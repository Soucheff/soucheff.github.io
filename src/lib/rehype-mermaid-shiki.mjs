import { visit } from 'unist-util-visit';

export function rehypeMermaidShiki() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre' || node.properties?.dataLanguage !== 'mermaid') return;

      const className = Array.isArray(node.properties.className)
        ? node.properties.className
        : [];
      node.properties.className = [...className, 'mermaid'];
    });
  };
}

export default rehypeMermaidShiki;