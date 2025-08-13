/**
 * TypeScript definitions for error-to-md
 * 
 * @author imankii01 <private.ankit047@gmail.com>
 */

export interface ErrorToMdOptions {
  /** Fields to redact in request bodies/headers */
  redact?: string[];
  
  /** Include environment information */
  includeEnvironment?: boolean;
  
  /** Include timestamp */
  includeTimestamp?: boolean;
  
  /** Include performance metrics */
  includePerformance?: boolean;
  
  /** Theme for output formatting */
  theme?: 'github' | 'slack' | 'discord';
  
  /** Maximum lines in stack trace */
  maxStackLines?: number;
  
  /** Maximum size for request body */
  maxBodySize?: number;
  
  /** Include user agent information */
  includeUserAgent?: boolean;
  
  /** Include memory usage information */
  includeMemoryUsage?: boolean;
  
  /** Generate unique error ID */
  generateErrorId?: boolean;
  
  /** Error severity level */
  severity?: 'info' | 'warning' | 'error' | 'critical';
  
  /** Application version to display */
  appVersion?: string;
  
  /** Custom logger function */
  logger?: (markdown: string, error: Error, request?: any) => void;
  
  /** Send markdown in HTTP response */
  sendMarkdown?: boolean;
}

export interface ExpressRequest {
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
  body?: any;
  query?: any;
  params?: any;
  headers?: Record<string, any>;
  [key: string]: any;
}

export interface ExpressResponse {
  status(code: number): ExpressResponse;
  json(data: any): void;
  type(type: string): ExpressResponse;
  send(data: any): void;
  headersSent: boolean;
}

export interface ExpressNextFunction {
  (err?: any): void;
}

export interface PerformanceMetrics {
  memory: {
    rss: string;
    heapUsed: string;
    heapTotal: string;
    external: string;
  };
  cpu: {
    user: string;
    system: string;
  };
  uptime: string;
}

export interface Theme {
  title: string;
  errorIcon: string;
  stackIcon: string;
  requestIcon: string;
  envIcon: string;
  separator: string;
}

/**
 * Convert an Error object to Markdown format
 */
export function errorToMarkdown(
  error: Error,
  request?: ExpressRequest | null,
  options?: ErrorToMdOptions
): string;

/**
 * Express middleware factory for error-to-md
 */
export function expressErrorToMd(
  options?: ErrorToMdOptions
): (error: Error, req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void;

/**
 * Async error handler wrapper
 */
export function asyncErrorToMd<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: ErrorToMdOptions
): (...args: T) => Promise<R>;

/**
 * Create Error object from JSON (for CLI usage)
 */
export function createErrorFromObject(errorObj: {
  message?: string;
  name?: string;
  stack?: string;
  code?: string;
  [key: string]: any;
}): Error;

/**
 * Default configuration options
 */
export const defaultOptions: Required<ErrorToMdOptions>;

/**
 * Available themes
 */
export const themes: Record<'github' | 'slack' | 'discord', Theme>;

/**
 * Default export (same as errorToMarkdown)
 */
declare const errorToMarkdown: typeof import('./index.js').errorToMarkdown;
export default errorToMarkdown;
</parameter>