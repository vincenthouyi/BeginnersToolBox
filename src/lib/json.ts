export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Recursively sorts object keys. Arrays keep their order.
 *
 * Note: JSON.parse never produces Map/Set/Date/etc, so we only need to
 * handle primitives, arrays, and plain objects.
 */
export function sortJsonKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeysDeep);
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
    const next: Record<string, unknown> = {};
    for (const key of keys) {
      next[key] = sortJsonKeysDeep(value[key]);
    }
    return next;
  }

  return value;
}
