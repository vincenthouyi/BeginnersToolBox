import * as YAML from 'yaml';
import Papa from 'papaparse';

export type InputFormat = 'json' | 'yaml' | 'csv';
export type OutputFormat = 'json' | 'yaml' | 'csv';

export interface ConvertOptions {
  jsonIndent: 2 | 4;
  csvDelimiter: ',' | ';' | '\t';
}

/**
 * Checks whether a value is a primitive (safe as a CSV cell).
 */
function isPrimitive(v: unknown): boolean {
  return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

export function jsonToYaml(input: string): string {
  const parsed: unknown = JSON.parse(input);
  return YAML.stringify(parsed).trimEnd();
}

export function yamlToJson(input: string, indent: 2 | 4): string {
  const parsed: unknown = YAML.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function jsonToCsv(input: string, delimiter: ',' | ';' | '\t'): string {
  const parsed: unknown = JSON.parse(input);

  if (!Array.isArray(parsed)) {
    throw new Error('JSON must be an array of objects for CSV conversion.');
  }
  if (parsed.length === 0) {
    return '';
  }

  for (const row of parsed) {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) {
      throw new Error('Each item in the JSON array must be a flat object (no arrays or nested objects).');
    }
    for (const [key, val] of Object.entries(row as Record<string, unknown>)) {
      if (!isPrimitive(val)) {
        throw new Error(`Nested structures are not supported in v1. Field "${key}" contains a non-primitive value.`);
      }
    }
  }

  return Papa.unparse(parsed as object[], { delimiter });
}

export function csvToJson(input: string, delimiter: ',' | ';' | '\t', indent: 2 | 4): string {
  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  return JSON.stringify(result.data, null, indent);
}

export function convert(
  input: string,
  from: InputFormat,
  to: OutputFormat,
  options: ConvertOptions,
): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Input is empty.');

  if (from === 'json' && to === 'yaml') return jsonToYaml(trimmed);
  if (from === 'yaml' && to === 'json') return yamlToJson(trimmed, options.jsonIndent);
  if (from === 'json' && to === 'csv') return jsonToCsv(trimmed, options.csvDelimiter);
  if (from === 'csv' && to === 'json') return csvToJson(trimmed, options.csvDelimiter, options.jsonIndent);

  throw new Error(`Conversion from ${from.toUpperCase()} to ${to.toUpperCase()} is not supported.`);
}
