import { parseCsv, applyMapping } from './csv';
import { fetchFromApi } from './api';
import { scrapeWebPage } from './web';

export interface ScraperInput {
  sourceType: 'csv' | 'api' | 'web';
  sourceUrl?: string;
  file?: Express.Multer.File;
  mappingConfig?: Record<string, string>;
  selectors?: {
    container: string;
    fields: Record<string, string>;
  };
}

export interface ScraperResult {
  sourceType: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  rowsImported: number;
  rowsFailed: number;
  previewData: Record<string, unknown>[];
  mappingConfig?: Record<string, string>;
  pageTitle?: string;
}

export class ScraperService {
  async execute(input: ScraperInput): Promise<ScraperResult> {
    const { sourceType, sourceUrl, file, mappingConfig, selectors } = input;

    switch (sourceType) {
      case 'csv': {
        if (!file) throw new Error('No file uploaded for CSV import');

        const parsed = await parseCsv(file.buffer, file.originalname);
        let rows = parsed.rows as Record<string, unknown>[];
        let rowsFailed = 0;

        if (mappingConfig && Object.keys(mappingConfig).length > 0) {
          const mapped = applyMapping(parsed.rows, mappingConfig);
          rows = mapped.mapped as Record<string, unknown>[];
          rowsFailed = mapped.failed;
        }

        return {
          sourceType: 'csv',
          headers: mappingConfig ? Object.keys(mappingConfig) : parsed.headers,
          rows,
          totalRows: parsed.totalRows,
          rowsImported: parsed.totalRows - rowsFailed,
          rowsFailed,
          previewData: rows.slice(0, 10),
          mappingConfig,
        };
      }

      case 'api': {
        if (!sourceUrl) throw new Error('API URL is required for API import');

        const result = await fetchFromApi({
          url: sourceUrl,
          dataPath: undefined,
        });

        return {
          sourceType: 'api',
          headers: result.headers,
          rows: result.rows,
          totalRows: result.totalRows,
          rowsImported: result.totalRows,
          rowsFailed: 0,
          previewData: result.previewData,
        };
      }

      case 'web': {
        if (!sourceUrl) throw new Error('URL is required for web scraping');
        if (!selectors) throw new Error('Selectors are required for web scraping');

        const result = await scrapeWebPage({ url: sourceUrl, selectors });

        return {
          sourceType: 'web',
          headers: result.headers,
          rows: result.rows as Record<string, unknown>[],
          totalRows: result.totalRows,
          rowsImported: result.totalRows,
          rowsFailed: 0,
          previewData: result.previewData as Record<string, unknown>[],
          pageTitle: result.pageTitle,
        };
      }

      default:
        throw new Error(`Unknown sourceType: ${sourceType}`);
    }
  }
}
