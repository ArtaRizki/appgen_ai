import axios from 'axios';

export interface ApiImportOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  dataPath?: string; // e.g. "data.results" to access nested array
}

export interface ApiResult {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  previewData: Record<string, unknown>[];
  rawResponse?: unknown;
}

export async function fetchFromApi(options: ApiImportOptions): Promise<ApiResult> {
  const { url, method = 'GET', headers = {}, body, dataPath } = options;

  const response = await axios({
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    data: body,
    timeout: 30000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = response.data;

  // Navigate nested path if specified (e.g. "data.results")
  if (dataPath) {
    const parts = dataPath.split('.');
    for (const part of parts) {
      if (data && typeof data === 'object') {
        data = (data as Record<string, unknown>)[part];
      } else {
        throw new Error(`Data path "${dataPath}" not found in API response`);
      }
    }
  }

  // Handle array or single object
  const rows: Record<string, unknown>[] = Array.isArray(data)
    ? data
    : [data];

  if (rows.length === 0) {
    return { headers: [], rows: [], totalRows: 0, previewData: [] };
  }

  const fieldHeaders = Object.keys(rows[0] as Record<string, unknown>);

  return {
    headers: fieldHeaders,
    rows,
    totalRows: rows.length,
    previewData: rows.slice(0, 10),
    rawResponse: response.data,
  };
}
