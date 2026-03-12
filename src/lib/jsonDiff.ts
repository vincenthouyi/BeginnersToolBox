export type DiffEntry =
  | { kind: 'added'; path: string; value: unknown }
  | { kind: 'removed'; path: string; value: unknown }
  | { kind: 'changed'; path: string; oldValue: unknown; newValue: unknown };

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

function diffValues(left: unknown, right: unknown, path: string, entries: DiffEntry[]): void {
  const leftIsObj = left !== null && typeof left === 'object' && !Array.isArray(left);
  const rightIsObj = right !== null && typeof right === 'object' && !Array.isArray(right);

  if (leftIsObj && rightIsObj) {
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const keys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
    for (const key of [...keys].sort()) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in leftObj)) {
        entries.push({ kind: 'added', path: childPath, value: rightObj[key] });
      } else if (!(key in rightObj)) {
        entries.push({ kind: 'removed', path: childPath, value: leftObj[key] });
      } else {
        diffValues(leftObj[key], rightObj[key], childPath, entries);
      }
    }
    return;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = `${path}[${i}]`;
      if (i >= left.length) {
        entries.push({ kind: 'added', path: childPath, value: right[i] });
      } else if (i >= right.length) {
        entries.push({ kind: 'removed', path: childPath, value: left[i] });
      } else {
        diffValues(left[i], right[i], childPath, entries);
      }
    }
    return;
  }

  if (JSON.stringify(left) !== JSON.stringify(right)) {
    entries.push({ kind: 'changed', path: path || '(root)', oldValue: left, newValue: right });
  }
}

export function diffJson(
  leftInput: string,
  rightInput: string,
  options: { sortKeys?: boolean } = {},
): DiffEntry[] {
  let left: unknown = JSON.parse(leftInput);
  let right: unknown = JSON.parse(rightInput);

  if (options.sortKeys) {
    left = sortKeys(left);
    right = sortKeys(right);
  }

  const entries: DiffEntry[] = [];
  diffValues(left, right, '', entries);
  return entries;
}

export function formatDiff(entries: DiffEntry[]): string {
  if (entries.length === 0) return '(no differences)';

  return entries
    .map((e) => {
      switch (e.kind) {
        case 'added':
          return `+ ${e.path}: ${JSON.stringify(e.value)}`;
        case 'removed':
          return `- ${e.path}: ${JSON.stringify(e.value)}`;
        case 'changed':
          return `~ ${e.path}: ${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.newValue)}`;
      }
    })
    .join('\n');
}
