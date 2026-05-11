import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebScrapeOptions {
  url: string;
  selectors: {
    container: string;   // e.g. "table tr", ".product-card"
    fields: Record<string, string>; // { name: "h2", price: ".price", url: "a[href]" }
  };
}

export interface WebScrapeResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  previewData: Record<string, string>[];
  pageTitle: string;
}

export async function scrapeWebPage(options: WebScrapeOptions): Promise<WebScrapeResult> {
  const { url, selectors } = options;

  const response = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AdigicubeBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  const $ = cheerio.load(response.data);
  const pageTitle = $('title').text().trim();
  const rows: Record<string, string>[] = [];
  const headers = Object.keys(selectors.fields);

  $(selectors.container).each((_, el) => {
    const row: Record<string, string> = {};
    let hasContent = false;

    for (const [fieldName, selector] of Object.entries(selectors.fields)) {
      const element = $(el).find(selector);

      // Try href for links, src for images, text() for everything else
      let value = '';
      if (selector.includes('[href]')) {
        value = element.attr('href') || element.text().trim();
      } else if (selector.includes('[src]')) {
        value = element.attr('src') || '';
      } else {
        value = element.text().trim();
      }

      if (value) hasContent = true;
      row[fieldName] = value;
    }

    if (hasContent) rows.push(row);
  });

  return {
    headers,
    rows,
    totalRows: rows.length,
    previewData: rows.slice(0, 10),
    pageTitle,
  };
}
