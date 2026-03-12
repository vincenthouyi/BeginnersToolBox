/**
 * localStorage admin helpers.
 *
 * Central registry mapping toolId → the exact localStorage keys that tool uses.
 * Clearing a tool removes only its mapped keys; clearing all removes the union.
 * Keys outside this map are never touched.
 */

const TOOL_KEYS: Record<string, string[]> = {
  'base64': ['base64:input'],
  'json-formatter': ['json:input', 'json:indent', 'json:sortKeys'],
  'markdown-preview': ['markdown:md'],
  'url-encoder': ['url:input', 'url:mode'],
  'regex-tester': ['regex:pattern', 'regex:flags', 'regex:testStr'],
  'timestamp-converter': ['ts:tsInput', 'ts:dateInput'],
  'hash-generator': ['hash:input', 'hash:selected'],
  'data-converter': [
    'data-converter:input',
    'data-converter:from',
    'data-converter:to',
    'data-converter:indent',
  ],
  'json-diff': ['json-diff:left', 'json-diff:right', 'json-diff:sort-keys'],
  'metronome': ['metro:bpm', 'metro:beats', 'metro:accent', 'metro:volume', 'metro:countdown'],
  'music-box-designer': ['mbox:bpm', 'mbox:volume', 'mbox:grid'],
};

/** All app-owned localStorage keys across all tools. */
export function listAppKeys(): string[] {
  return Object.values(TOOL_KEYS).flat();
}

/** Keys owned by a specific tool (empty array if tool has none). */
export function getToolKeys(toolId: string): string[] {
  return TOOL_KEYS[toolId] ?? [];
}

/** Tool IDs that have at least one localStorage key. */
export function toolsWithStorage(): string[] {
  return Object.keys(TOOL_KEYS);
}

/** Remove all localStorage keys belonging to a single tool. */
export function clearTool(toolId: string): void {
  for (const key of getToolKeys(toolId)) {
    localStorage.removeItem(key);
  }
}

/** Remove all app-owned localStorage keys (union of all tools). */
export function clearAll(): void {
  for (const key of listAppKeys()) {
    localStorage.removeItem(key);
  }
}
