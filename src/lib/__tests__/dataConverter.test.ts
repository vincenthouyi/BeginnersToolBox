import { describe, it, expect } from 'vitest';
import { jsonToYaml, yamlToJson, jsonToCsv, csvToJson, convert } from '../dataConverter';

describe('jsonToYaml', () => {
  it('converts a simple object', () => {
    const result = jsonToYaml('{"name":"Alice","age":30}');
    expect(result).toBe('name: Alice\nage: 30');
  });

  it('converts an array of primitives', () => {
    const result = jsonToYaml('[1, 2, 3]');
    expect(result).toBe('- 1\n- 2\n- 3');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToYaml('{bad json}')).toThrow();
  });
});

describe('yamlToJson', () => {
  it('converts a simple YAML object', () => {
    const result = yamlToJson('name: Alice\nage: 30', 2);
    expect(JSON.parse(result)).toEqual({ name: 'Alice', age: 30 });
  });

  it('respects indent option', () => {
    const result2 = yamlToJson('x: 1', 2);
    const result4 = yamlToJson('x: 1', 4);
    expect(result2).toBe('{\n  "x": 1\n}');
    expect(result4).toBe('{\n    "x": 1\n}');
  });

  it('throws on invalid YAML', () => {
    expect(() => yamlToJson('key: [invalid: yaml: !!', 2)).toThrow();
  });
});

describe('jsonToCsv', () => {
  it('converts a flat array of objects', () => {
    const input = JSON.stringify([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
    const result = jsonToCsv(input, ',');
    expect(result).toContain('name,age');
    expect(result).toContain('Alice,30');
    expect(result).toContain('Bob,25');
  });

  it('uses custom delimiter', () => {
    const input = JSON.stringify([{ a: 1, b: 2 }]);
    const result = jsonToCsv(input, ';');
    expect(result).toContain('a;b');
    expect(result).toContain('1;2');
  });

  it('rejects non-array JSON', () => {
    expect(() => jsonToCsv('{"a":1}', ',')).toThrow('JSON must be an array');
  });

  it('rejects arrays with nested objects', () => {
    const input = JSON.stringify([{ a: { b: 1 } }]);
    expect(() => jsonToCsv(input, ',')).toThrow('Nested structures are not supported');
  });

  it('rejects arrays with array values', () => {
    const input = JSON.stringify([{ a: [1, 2] }]);
    expect(() => jsonToCsv(input, ',')).toThrow('Nested structures are not supported');
  });

  it('returns empty string for empty array', () => {
    expect(jsonToCsv('[]', ',')).toBe('');
  });
});

describe('csvToJson', () => {
  it('converts simple CSV to JSON', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = JSON.parse(csvToJson(csv, ',', 2));
    expect(result).toEqual([{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]);
  });

  it('uses custom delimiter', () => {
    const csv = 'name;age\nAlice;30';
    const result = JSON.parse(csvToJson(csv, ';', 2));
    expect(result).toEqual([{ name: 'Alice', age: '30' }]);
  });
});

describe('convert', () => {
  it('throws on empty input', () => {
    expect(() => convert('  ', 'json', 'yaml', { jsonIndent: 2, csvDelimiter: ',' })).toThrow('Input is empty');
  });

  it('throws on unsupported conversion', () => {
    expect(() => convert('{}', 'yaml', 'csv', { jsonIndent: 2, csvDelimiter: ',' })).toThrow('not supported');
  });

  it('performs JSON -> YAML round trip via YAML -> JSON', () => {
    const json = '{"key":"value"}';
    const yaml = convert(json, 'json', 'yaml', { jsonIndent: 2, csvDelimiter: ',' });
    const backToJson = convert(yaml, 'yaml', 'json', { jsonIndent: 2, csvDelimiter: ',' });
    expect(JSON.parse(backToJson)).toEqual({ key: 'value' });
  });
});
