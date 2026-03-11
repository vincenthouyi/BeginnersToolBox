export const DEFAULT_URL_TEXT_LIMIT = 500;

export function getShortSearchParam(
  params: URLSearchParams,
  key: string,
  maxLen: number = DEFAULT_URL_TEXT_LIMIT
): string | null {
  const value = params.get(key);
  if (!value) return null;
  if (value.length > maxLen) return null;
  return value;
}

export function getEnumSearchParam<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[]
): T | null {
  const value = params.get(key);
  if (!value) return null;
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}
