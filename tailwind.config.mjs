/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        'azure-blue': '#0078D4',
        'security-green': '#22C55E',
        'graphite-light': '#E5E7EB',
        graphite: '#6B7280',
        surface: '#1F2937',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-text)',
            '--tw-prose-headings': 'var(--color-text)',
            '--tw-prose-links': 'var(--color-primary)',
            '--tw-prose-bold': 'var(--color-text)',
            '--tw-prose-code': 'var(--color-accent)',
            '--tw-prose-quotes': 'var(--color-text-muted)',
            '--tw-prose-quote-borders': 'var(--color-primary)',
            '--tw-prose-bullets': 'var(--color-text-muted)',
            '--tw-prose-counters': 'var(--color-text-muted)',
            '--tw-prose-hr': 'var(--color-border)',
            maxWidth: '72ch',
            a: { textDecoration: 'none', borderBottom: '1px solid currentColor' },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            pre: { padding: 0, background: 'transparent' },
            'pre code': { display: 'block', padding: '1rem', borderRadius: '0.5rem' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
