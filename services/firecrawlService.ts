import { FirecrawlResponse, ScrapeRequest, ScrapeOptions } from '../types';

const BASE_URL = 'https://api.firecrawl.dev/v1/scrape';

export const scrapeUrl = async (apiKey: string, url: string, options: ScrapeOptions = {}): Promise<FirecrawlResponse> => {
  try {
    const payload: ScrapeRequest = {
      url: url,
      formats: ['markdown'],
      waitFor: options.waitFor || 0,
      mobile: options.mobile || false,
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Error ${response.status}: Failed to scrape URL`,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected network error occurred',
    };
  }
};