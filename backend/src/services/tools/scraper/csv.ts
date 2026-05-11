import Papa from 'papaparse';

export interface CsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  previewData: Record<string, string>[];
}

export async function parseCsv(fileBuffer: Buffer, originalName: string): Promise<CsvResult> {
  const content = fileBuffer.toString('utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          const critical = result.errors.filter((e) => e.type === 'Quotes' || e.type === 'Delimiter');
          if (critical.length > 0) {
            return reject(new Error(`CSV parse error: ${critical[0].message}`));
          }
        }

        const headers = result.meta.fields || [];
        const rows = result.data as Record<string, string>[];

        resolve({
          headers,
          rows,
          totalRows: rows.length,
          previewData: rows.slice(0, 10),
        });
      },
      error: (err: Error) => reject(new Error(`CSV parse failed: ${err.message}`)),
    });
  });
}

export function applyMapping(
  rows: Record<string, string>[],
  mappingConfig: Record<string, string>
): { mapped: Record<string, string>[]; failed: number } {
  let failed = 0;
  const mapped = rows.map((row) => {
    const newRow: Record<string, string> = {};
    for (const [destKey, srcKey] of Object.entries(mappingConfig)) {
      if (row[srcKey] !== undefined) {
        newRow[destKey] = row[srcKey];
      } else {
        failed++;
        newRow[destKey] = '';
      }
    }
    return newRow;
  });

  return { mapped, failed };
}
