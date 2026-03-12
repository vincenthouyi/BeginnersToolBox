import { describe, it, expect } from 'vitest';
import { diffJson, formatDiff } from '../jsonDiff';

describe('diffJson', () => {
  it('returns empty array for identical objects', () => {
    expect(diffJson('{"a":1}', '{"a":1}')).toEqual([]);
  });

  it('detects added key', () => {
    const entries = diffJson('{"a":1}', '{"a":1,"b":2}');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'added', path: 'b', value: 2 });
  });

  it('detects removed key', () => {
    const entries = diffJson('{"a":1,"b":2}', '{"a":1}');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'removed', path: 'b', value: 2 });
  });

  it('detects changed value', () => {
    const entries = diffJson('{"name":"Alice"}', '{"name":"Bob"}');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'changed', path: 'name', oldValue: 'Alice', newValue: 'Bob' });
  });

  it('detects nested object changes', () => {
    const entries = diffJson('{"a":{"x":1}}', '{"a":{"x":2}}');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'changed', path: 'a.x', oldValue: 1, newValue: 2 });
  });

  it('detects array element change', () => {
    const entries = diffJson('[1,2,3]', '[1,9,3]');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'changed', path: '[1]', oldValue: 2, newValue: 9 });
  });

  it('detects array length increase', () => {
    const entries = diffJson('[1]', '[1,2]');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'added', path: '[1]', value: 2 });
  });

  it('detects array length decrease', () => {
    const entries = diffJson('[1,2]', '[1]');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'removed', path: '[1]', value: 2 });
  });

  it('handles type change (object to array at root)', () => {
    const entries = diffJson('{"a":1}', '[1,2]');
    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe('changed');
  });

  it('sort keys option normalises key order before diffing', () => {
    const left = '{"b":2,"a":1}';
    const right = '{"a":1,"b":2}';
    const without = diffJson(left, right);
    const withSort = diffJson(left, right, { sortKeys: true });
    expect(without).toEqual([]);
    expect(withSort).toEqual([]);
  });

  it('sort keys detects real differences even when keys are reordered', () => {
    const left = '{"b":99,"a":1}';
    const right = '{"a":1,"b":2}';
    const entries = diffJson(left, right, { sortKeys: true });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'changed', path: 'b', oldValue: 99, newValue: 2 });
  });

  it('throws on invalid JSON', () => {
    expect(() => diffJson('{bad}', '{}')).toThrow();
    expect(() => diffJson('{}', '{bad}')).toThrow();
  });
});

describe('formatDiff', () => {
  it('returns no-differences message for empty entries', () => {
    expect(formatDiff([])).toBe('(no differences)');
  });

  it('formats added entry with + prefix', () => {
    const result = formatDiff([{ kind: 'added', path: 'x', value: 1 }]);
    expect(result).toBe('+ x: 1');
  });

  it('formats removed entry with - prefix', () => {
    const result = formatDiff([{ kind: 'removed', path: 'x', value: 1 }]);
    expect(result).toBe('- x: 1');
  });

  it('formats changed entry with ~ prefix and arrow', () => {
    const result = formatDiff([{ kind: 'changed', path: 'x', oldValue: 1, newValue: 2 }]);
    expect(result).toBe('~ x: 1 → 2');
  });

  it('joins multiple entries with newlines', () => {
    const result = formatDiff([
      { kind: 'added', path: 'a', value: 1 },
      { kind: 'removed', path: 'b', value: 2 },
    ]);
    expect(result).toBe('+ a: 1\n- b: 2');
  });
});
