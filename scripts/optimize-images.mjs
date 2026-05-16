#!/usr/bin/env node
/**
 * Otimiza imagens raster (PNG/JPEG) em `public/images/` in-place.
 *
 * - Redimensiona se a largura ultrapassar MAX_WIDTH (mantém aspect ratio).
 * - Re-encoda com compressão alta + paleta (quando aplicável) para PNG.
 * - Re-encoda JPEG com qualidade alta.
 * - Substitui o arquivo original SOMENTE se o resultado for menor.
 *
 * Uso: `npm run optimize:images`
 */
import { globby } from 'globby';
import sharp from 'sharp';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { relative } from 'node:path';

const MAX_WIDTH = 1600; // largura máxima permitida
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');

const fmt = (n) => {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
};

const optimize = async (file) => {
  const before = (await stat(file)).size;
  const buf = await readFile(file);
  const img = sharp(buf, { failOn: 'none' });
  const meta = await img.metadata();
  const ext = (meta.format || '').toLowerCase();

  if (!['png', 'jpeg', 'jpg'].includes(ext)) {
    return { file, skipped: true, reason: `unsupported format ${ext}` };
  }

  let pipeline = sharp(buf, { failOn: 'none' });
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === 'png') {
    pipeline = pipeline.png({
      compressionLevel: 9,
      palette: true,
      quality: 90,
      effort: 10,
    });
  } else {
    pipeline = pipeline.jpeg({
      quality: 82,
      mozjpeg: true,
      progressive: true,
    });
  }

  const out = await pipeline.toBuffer();
  if (out.length >= before) {
    return { file, before, after: before, kept: 'original (no gain)' };
  }
  await writeFile(file, out);
  return { file, before, after: out.length };
};

const main = async () => {
  const files = await globby(['public/images/**/*.{png,jpg,jpeg,PNG,JPG,JPEG}']);
  if (files.length === 0) {
    console.log('No raster images found under public/images/.');
    return;
  }
  console.log(`Optimizing ${files.length} image(s)...\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    try {
      const r = await optimize(file);
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (r.skipped) {
        console.log(`  - ${rel}  (skipped: ${r.reason})`);
        continue;
      }
      totalBefore += r.before;
      totalAfter += r.after;
      if (r.kept) {
        console.log(`  = ${rel}  ${fmt(r.before)}  (${r.kept})`);
      } else {
        const pct = ((1 - r.after / r.before) * 100).toFixed(1);
        console.log(`  ✓ ${rel}  ${fmt(r.before)} → ${fmt(r.after)}  (-${pct}%)`);
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  if (totalBefore > 0) {
    const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
    console.log(`\nTotal: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (-${pct}%)`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
