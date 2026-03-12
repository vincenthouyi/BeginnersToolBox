import { JSONPath } from 'jsonpath-plus';

export interface JsonPathResult {
  matches: unknown[];
  error?: string;
}

/**
 * Evaluates a JSONPath expression against a JSON string.
 * Returns an array of matching values, or an error message.
 */
export function queryJsonPath(jsonText: string, expression: string): JsonPathResult {
  if (!jsonText.trim()) return { matches: [], error: 'JSON input is empty.' };
  if (!expression.trim()) return { matches: [], error: 'Expression is empty.' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return { matches: [], error: e instanceof Error ? `JSON parse error: ${e.message}` : 'Invalid JSON' };
  }

  try {
    const matches = JSONPath({ path: expression, json: parsed as object });
    return { matches };
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : 'Invalid JSONPath expression' };
  }
}
