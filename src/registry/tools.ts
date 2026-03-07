/**
 * BeginnersToolBox — Tool Registry
 *
 * Each tool entry describes a beginner-friendly utility.
 * Implementations live in src/tools/<id>/index.tsx.
 */

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'text' | 'data' | 'color' | 'math' | 'web' | 'misc';
  status: 'planned' | 'wip' | 'ready';
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode text to Base64 or decode Base64 back to plain text.',
    icon: '🔤',
    category: 'text',
    status: 'planned',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Prettify or minify JSON with syntax highlighting.',
    icon: '📋',
    category: 'data',
    status: 'planned',
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and CSS color formats.',
    icon: '🎨',
    category: 'color',
    status: 'planned',
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Type Markdown on the left, see rendered HTML on the right.',
    icon: '📝',
    category: 'text',
    status: 'planned',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URL components and query strings.',
    icon: '🔗',
    category: 'web',
    status: 'planned',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Write a regular expression and test it against sample text.',
    icon: '🔍',
    category: 'text',
    status: 'planned',
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and back.',
    icon: '⏱️',
    category: 'misc',
    status: 'planned',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text.',
    icon: '#️⃣',
    category: 'data',
    status: 'planned',
  },
];

export const getToolById = (id: string): ToolMeta | undefined =>
  TOOLS.find((t) => t.id === id);
