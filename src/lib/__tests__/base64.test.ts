import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from '../base64';

describe('encodeBase64', () => {
  it('encodes plain ASCII text', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('encodes an empty string', () => {
    expect(encodeBase64('')).toBe('');
  });

  it('encodes UTF-8 text', () => {
    const encoded = encodeBase64('café');
    expect(encoded).toBeTruthy();
    expect(encoded).not.toBe('café');
  });
});

describe('decodeBase64', () => {
  it('decodes a base64 string', () => {
    expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
  });

  it('decodes an empty string', () => {
    expect(decodeBase64('')).toBe('');
  });

  it('throws on invalid base64', () => {
    expect(() => decodeBase64('not-valid-base64!!!')).toThrow();
  });
});

describe('round-trip', () => {
  it('encode then decode returns original text', () => {
    const texts = ['Hello!', 'café', 'こんにちは', '{"key":"value"}'];
    for (const text of texts) {
      expect(decodeBase64(encodeBase64(text))).toBe(text);
    }
  });
});
