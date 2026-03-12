import { describe, it, expect } from 'vitest';
import { queryJsonPath } from '../jsonpath';

const SAMPLE = JSON.stringify({
  store: {
    book: [
      { category: 'fiction', author: 'Tolkien', title: 'The Fellowship', price: 9.99 },
      { category: 'fiction', author: 'Asimov', title: 'Foundation', price: 7.99 },
      { category: 'reference', author: 'Fowler', title: 'Refactoring', price: 29.99 },
    ],
    bicycle: { color: 'red', price: 19.99 },
  },
});

describe('queryJsonPath', () => {
  it('returns a scalar value with dot notation', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$.store.bicycle.color');
    expect(error).toBeUndefined();
    expect(matches).toEqual(['red']);
  });

  it('returns all book titles with deep wildcard', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$..title');
    expect(error).toBeUndefined();
    expect(matches).toEqual(['The Fellowship', 'Foundation', 'Refactoring']);
  });

  it('returns specific array element with bracket notation', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$.store.book[0].author');
    expect(error).toBeUndefined();
    expect(matches).toEqual(['Tolkien']);
  });

  it('returns all items with wildcard [*]', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$.store.book[*].price');
    expect(error).toBeUndefined();
    expect(matches).toHaveLength(3);
  });

  it('supports filter expressions', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$.store.book[?(@.price < 10)].title');
    expect(error).toBeUndefined();
    expect(matches).toContain('The Fellowship');
    expect(matches).toContain('Foundation');
    expect(matches).not.toContain('Refactoring');
  });

  it('returns empty array for no matches', () => {
    const { matches, error } = queryJsonPath(SAMPLE, '$.store.nothing');
    expect(error).toBeUndefined();
    expect(matches).toEqual([]);
  });

  it('returns error for invalid JSON', () => {
    const { matches, error } = queryJsonPath('{bad json}', '$.a');
    expect(matches).toEqual([]);
    expect(error).toMatch(/JSON parse error/i);
  });

  it('returns error for empty JSON', () => {
    const { error } = queryJsonPath('', '$.a');
    expect(error).toMatch(/empty/i);
  });

  it('returns error for empty expression', () => {
    const { error } = queryJsonPath('{"a":1}', '');
    expect(error).toMatch(/empty/i);
  });

  it('works on arrays at root', () => {
    const { matches, error } = queryJsonPath('[1,2,3]', '$[1]');
    expect(error).toBeUndefined();
    expect(matches).toEqual([2]);
  });
});
