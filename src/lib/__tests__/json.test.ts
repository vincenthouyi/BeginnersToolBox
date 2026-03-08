import { describe, it, expect } from 'vitest';

// Pure logic extracted from JsonFormatterTool (JSON.parse + JSON.stringify)
function prettify(input: string, indent: number): string {
  return JSON.stringify(JSON.parse(input), null, indent);
}

function minify(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

describe('JSON prettify', () => {
  it('formats a compact JSON string', () => {
    expect(prettify('{"a":1,"b":2}', 2)).toBe('{\n  "a": 1,\n  "b": 2\n}');
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

  it('handles arrays', () => {
    expect(minify('[1, 2, 3]')).toBe('[1,2,3]');
  });

  it('throws on invalid JSON', () => {
    expect(() => minify('not json')).toThrow();
  });
});
