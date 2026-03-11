import { describe, it, expect } from 'vitest';
import { sortJsonKeysDeep } from '../json';

// Pure logic extracted from JsonFormatterTool (JSON.parse + JSON.stringify)
function prettify(input: string, indent: number, sortKeys = false): string {
  const parsed = JSON.parse(input);
  const normalized = sortKeys ? sortJsonKeysDeep(parsed) : parsed;
  return JSON.stringify(normalized, null, indent);
}

function minify(input: string, sortKeys = false): string {
  const parsed = JSON.parse(input);
  const normalized = sortKeys ? sortJsonKeysDeep(parsed) : parsed;
  return JSON.stringify(normalized);
}

describe('JSON prettify', () => {
  it('formats a compact JSON string', () => {
    expect(prettify('{"a":1,"b":2}', 2)).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('can sort keys recursively', () => {
    expect(prettify('{"b":1,"a":{"d":1,"c":2}}', 2, true)).toBe(
      '{\n  "a": {\n    "c": 2,\n    "d": 1\n  },\n  "b": 1\n}'
    );
  });

  it('supports 4-space indent', () => {
    expect(prettify('{"x":1}', 4)).toBe('{\n    "x": 1\n}');
  });

  it('throws on invalid JSON', () => {
    expect(() => prettify('{bad}', 2)).toThrow();
  });
});

describe('JSON minify', () => {
  it('removes whitespace', () => {
    expect(minify('{\n  "a": 1\n}')).toBe('{"a":1}');
  });

  it('can sort keys recursively', () => {
    expect(minify('{"b":1,"a":2}', true)).toBe('{"a":2,"b":1}');
  });

  it('handles arrays', () => {
    expect(minify('[1, 2, 3]')).toBe('[1,2,3]');
  });

  it('throws on invalid JSON', () => {
    expect(() => minify('not json')).toThrow();
  });
});
