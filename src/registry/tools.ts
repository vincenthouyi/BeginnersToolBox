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
  category: 'text' | 'data' | 'color' | 'math' | 'web' | 'misc' | 'music';
  status: 'planned' | 'wip' | 'ready';
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode text to Base64 or decode Base64 back to plain text.',
    icon: '🔤',
    category: 'text',
    status: 'ready',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Prettify or minify JSON with syntax highlighting.',
    icon: '📋',
    category: 'data',
    status: 'ready',
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and CSS color formats.',
    icon: '🎨',
    category: 'color',
    status: 'ready',
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Type Markdown on the left, see rendered HTML on the right.',
    icon: '📝',
    category: 'text',
    status: 'ready',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URL components and query strings.',
    icon: '🔗',
    category: 'web',
    status: 'ready',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Write a regular expression and test it against sample text.',
    icon: '🔍',
    category: 'text',
    status: 'ready',
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and back.',
    icon: '⏱️',
    category: 'misc',
    status: 'ready',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text.',
    icon: '#️⃣',
    category: 'data',
    status: 'ready',
  },
  {
    id: 'data-converter',
    name: 'Data Converter',
    description: 'Convert between JSON, YAML, CSV, and TOML formats in the browser.',
    icon: '🔄',
    category: 'data',
    status: 'ready',
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare two JSON documents and view added, removed, and changed paths.',
    icon: '🔀',
    category: 'data',
    status: 'ready',
  },
  {
    id: 'uuid-generator',
    name: 'UUID / ULID Generator',
    description: 'Generate RFC-4122 UUIDs or sortable ULIDs in bulk.',
    icon: '🪪',
    category: 'misc',
    status: 'ready',
  },
  {
    id: 'metronome',
    name: 'Metronome',
    description: 'Keep time with a browser-based metronome. Tap tempo, accent beat 1, adjust BPM and volume.',
    icon: '🎵',
    category: 'music',
    status: 'ready',
  },
  {
    id: 'music-box-designer',
    name: 'Music Box Designer',
    description: 'Toggle notes on a step-sequencer grid and play back your melody in the browser.',
    icon: '🎼',
    category: 'music',
    status: 'ready',
  },
  {
    id: 'tuner',
    name: 'Tuner',
    description: 'Tune your instrument with a real-time microphone pitch detector and cents meter.',
    icon: '🎸',
    category: 'music',
    status: 'ready',
  },
];

export const getToolById = (id: string): ToolMeta | undefined =>
  TOOLS.find((t) => t.id === id);
