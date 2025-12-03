export interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
    metadata?: Record<string, any>;
  };
  error?: string;
}

export interface ScrapeOptions {
  waitFor?: number;
  mobile?: boolean;
}

export interface ScrapeRequest {
  url: string;
  formats: string[];
  waitFor?: number;
  mobile?: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}