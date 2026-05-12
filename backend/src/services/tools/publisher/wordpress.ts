import axios from 'axios';

export interface WordPressPostInput {
  siteUrl: string;
  username: string;
  appPassword: string;
  title: string;
  content: string;
  status?: 'draft' | 'publish';
  categories?: number[];
  tags?: number[];
}

export interface WordPressPostResult {
  id: number;
  link: string;
  status: string;
}

export class WordPressPublisher {
  async publish(input: WordPressPostInput): Promise<WordPressPostResult> {
    const { siteUrl, username, appPassword, title, content, status = 'draft', categories, tags } = input;

    // Remove trailing slash from siteUrl
    const normalizedUrl = siteUrl.replace(/\/$/, '');
    const apiUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;

    // Basic Auth with Application Password
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');

    try {
      const response = await axios.post(
        apiUrl,
        {
          title,
          content,
          status,
          categories,
          tags,
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error(`[WordPressPublisher] Failed to post to ${siteUrl}:`, errorMsg);
      throw new Error(`WordPress error: ${errorMsg}`);
    }
  }
}
