import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SeoAuditorInput {
  url: string;
}

export interface SeoAuditResult {
  url: string;
  title: { text: string; status: 'pass' | 'fail' | 'warning'; message: string };
  metaDescription: { text: string; status: 'pass' | 'fail' | 'warning'; message: string };
  headings: { h1Count: number; h2Count: number; status: 'pass' | 'fail'; message: string };
  images: { total: number; missingAlt: number; status: 'pass' | 'fail' | 'warning'; message: string };
  ssl: { status: 'pass' | 'fail'; message: string };
  score: number;
}

export class SeoAuditorService {
  async execute(input: SeoAuditorInput): Promise<SeoAuditResult> {
    const { url } = input;
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    try {
      const response = await axios.get(normalizedUrl, { 
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (AidigicubeBot/1.0)' }
      });
      const $ = cheerio.load(response.data);

      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const h1s = $('h1').length;
      const h2s = $('h2').length;
      const images = $('img');
      const missingAlt = images.filter((_, img) => !$(img).attr('alt')).length;

      const results: SeoAuditResult = {
        url: normalizedUrl,
        title: {
          text: title,
          status: title.length >= 30 && title.length <= 60 ? 'pass' : (title.length > 0 ? 'warning' : 'fail'),
          message: title.length === 0 ? 'Title tag missing' : (title.length < 30 ? 'Title too short' : (title.length > 60 ? 'Title too long' : 'Optimal length')),
        },
        metaDescription: {
          text: description,
          status: description.length >= 120 && description.length <= 160 ? 'pass' : (description.length > 0 ? 'warning' : 'fail'),
          message: description.length === 0 ? 'Meta description missing' : 'Length check',
        },
        headings: {
          h1Count: h1s,
          h2Count: h2s,
          status: h1s === 1 ? 'pass' : 'fail',
          message: h1s === 0 ? 'H1 missing' : (h1s > 1 ? 'Multiple H1s found' : 'Correct hierarchy'),
        },
        images: {
          total: images.length,
          missingAlt: missingAlt,
          status: missingAlt === 0 ? 'pass' : 'warning',
          message: missingAlt > 0 ? `${missingAlt} images missing alt text` : 'All images have alt text',
        },
        ssl: {
          status: normalizedUrl.startsWith('https') ? 'pass' : 'fail',
          message: normalizedUrl.startsWith('https') ? 'Secure connection' : 'Not secure',
        },
        score: 0
      };

      // Simple score calculation
      let score = 0;
      if (results.title.status === 'pass') score += 20;
      if (results.metaDescription.status === 'pass') score += 20;
      if (results.headings.status === 'pass') score += 20;
      if (results.images.status === 'pass') score += 20;
      if (results.ssl.status === 'pass') score += 20;
      results.score = score;

      return results;
    } catch (err: any) {
      throw new Error(`Audit failed for ${normalizedUrl}: ${err.message}`);
    }
  }
}
