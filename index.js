/**
 * error-to-md - 🐛 Convert Node.js/Express errors into beautiful Markdown bug reports
 * 
 * @author imankii01 <private.ankit047@gmail.com>
 * @homepage https://imankii01.github.io/error-to-md
 * @repository https://github.com/imankii01/error-to-md
 * @license MIT
 */

import { performance } from 'perf_hooks';
import { createHash } from 'crypto';

/**
 * Default configuration options
 */
const defaultOptions = {
  redact: ['password', 'token', 'key', 'secret', 'auth', 'authorization', 'cookie'],
  includeEnvironment: true,
  includeTimestamp: true,
  includePerformance: true,
  theme: 'github', // github, slack, discord
  maxStackLines: 50,
  maxBodySize: 1000,
  includeUserAgent: true,
  includeMemoryUsage: true,
  generateErrorId: true,
  severity: 'error' // info, warning, error, critical
};

/**
 * Themes for different platforms
 */
const themes = {
  github: {
    title: '## 🐛 Bug Report',
    errorIcon: '❌',
    stackIcon: '📋',
    requestIcon: '🌐',
    envIcon: '💻',
    separator: '---'
  },
  slack: {
    title: '*🐛 Bug Report*',
    errorIcon: ':x:',
    stackIcon: ':clipboard:',
    requestIcon: ':globe_with_meridians:',
    envIcon: ':computer:',
    separator: '```'
  },
  discord: {
    title: '## 🐛 Bug Report',
    errorIcon: '❌',
    stackIcon: '📋',
    requestIcon: '🌐',
    envIcon: '💻',
    separator: '```diff'
  }
};

/**
 * Generate a unique error ID based on error details
 */
function generateErrorId(err, req = null) {
  const errorData = {
    message: err.message,
    stack: err.stack?.split('\n')[0] || '',
    url: req?.originalUrl || req?.url || '',
    method: req?.method || ''
  };
  
  const hash = createHash('md5').update(JSON.stringify(errorData)).digest('hex');
  return `ERR-${hash.substring(0, 8).toUpperCase()}`;
}

/**
 * Clean and redact sensitive information from objects
 */
function cleanObject(obj, redactKeys = [], maxSize = 1000) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = JSON.parse(JSON.stringify(obj, (key, value) => {
    // Redact sensitive keys
    if (redactKeys.some(redactKey => 
      key.toLowerCase().includes(redactKey.toLowerCase())
    )) {
      return '[REDACTED]';
    }
    return value;
  }));
  
  const jsonString = JSON.stringify(cleaned, null, 2);
  if (jsonString.length > maxSize) {
    return JSON.stringify(cleaned).substring(0, maxSize) + '... [TRUNCATED]';
  }
  
  return cleaned;
}

/**
 * Get system performance metrics
 */
function getPerformanceMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    cpu: {
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`
    },
    uptime: `${Math.round(uptime)}s`
  };
}

/**
 * Format error severity with appropriate emoji
 */
function formatSeverity(severity) {
  const severityMap = {
    info: '💡 INFO',
    warning: '⚠️ WARNING',
    error: '❌ ERROR',
    critical: '🚨 CRITICAL'
  };
  return severityMap[severity] || severityMap.error;
}

/**
 * Main function to convert errors to markdown
 */
function errorToMarkdown(err, req = null, options = {}) {
  const config = { ...defaultOptions, ...options };
  const theme = themes[config.theme] || themes.github;
  const startTime = performance.now();
  
  const errorId = config.generateErrorId ? generateErrorId(err, req) : null;
  const timestamp = config.includeTimestamp ? new Date().toISOString() : null;
  
  const md = [];
  
  // Title and Error ID
  md.push(theme.title);
  if (errorId) md.push(`**Error ID:** \`${errorId}\``);
  if (timestamp) md.push(`**Timestamp:** \`${timestamp}\``);
  md.push('');
  
  // Severity
  md.push(`**Severity:** ${formatSeverity(config.severity)}`);
  md.push('');
  
  // Error Message
  md.push(`${theme.errorIcon} **Error Message:**`);
  md.push(`\`\`\`\n${err.message || 'Unknown Error'}\n\`\`\``);
  md.push('');
  
  // Error Type
  if (err.name && err.name !== 'Error') {
    md.push(`**Error Type:** \`${err.name}\``);
    md.push('');
  }
  
  // Error Code (for system errors)
  if (err.code) {
    md.push(`**Error Code:** \`${err.code}\``);
    md.push('');
  }
  
  // Stack Trace
  md.push(`${theme.stackIcon} **Stack Trace:**`);
  const stackLines = (err.stack || 'No stack trace available')
    .split('\n')
    .slice(0, config.maxStackLines);
  md.push('```');
  md.push(stackLines.join('\n'));
  if (err.stack && err.stack.split('\n').length > config.maxStackLines) {
    md.push('... [TRUNCATED]');
  }
  md.push('```');
  md.push('');
  
  // Request Details
  if (req) {
    md.push(`${theme.requestIcon} **Request Details:**`);
    md.push(`- **Method:** \`${req.method}\``);
    md.push(`- **URL:** \`${req.originalUrl || req.url}\``);
    md.push(`- **IP:** \`${req.ip || req.connection?.remoteAddress || 'unknown'}\``);
    
    if (config.includeUserAgent && req.headers?.['user-agent']) {
      md.push(`- **User Agent:** \`${req.headers['user-agent']}\``);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      md.push(`- **Body:**`);
      md.push('```json');
      md.push(JSON.stringify(cleanObject(req.body, config.redact, config.maxBodySize), null, 2));
      md.push('```');
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
      md.push(`- **Query Parameters:**`);
      md.push('```json');
      md.push(JSON.stringify(cleanObject(req.query, config.redact), null, 2));
      md.push('```');
    }
    
    if (req.params && Object.keys(req.params).length > 0) {
      md.push(`- **Route Parameters:**`);
      md.push('```json');
      md.push(JSON.stringify(req.params, null, 2));
      md.push('```');
    }
    
    // Headers (redacted)
    md.push(`- **Headers:**`);
    md.push('```json');
    md.push(JSON.stringify(cleanObject(req.headers, config.redact), null, 2));
    md.push('```');
    md.push('');
  }
  
  // Environment Information
  if (config.includeEnvironment) {
    md.push(`${theme.envIcon} **Environment:**`);
    md.push(`- **Node.js Version:** \`${process.version}\``);
    md.push(`- **Platform:** \`${process.platform} ${process.arch}\``);
    md.push(`- **Environment:** \`${process.env.NODE_ENV || 'development'}\``);
    
    if (config.appVersion) {
      md.push(`- **App Version:** \`${config.appVersion}\``);
    }
    
    if (config.includeMemoryUsage) {
      const perf = getPerformanceMetrics();
      md.push(`- **Memory Usage:** RSS: \`${perf.memory.rss}\`, Heap: \`${perf.memory.heapUsed}/${perf.memory.heapTotal}\``);
      md.push(`- **CPU Usage:** User: \`${perf.cpu.user}\`, System: \`${perf.cpu.system}\``);
      md.push(`- **Process Uptime:** \`${perf.uptime}\``);
    }
    
    md.push('');
  }
  
  // Performance
  if (config.includePerformance) {
    const endTime = performance.now();
    md.push(`⚡ **Report Generation Time:** \`${(endTime - startTime).toFixed(2)}ms\``);
    md.push('');
  }
  
  // Footer
  md.push(theme.separator);
  md.push('*Generated by [error-to-md](https://github.com/imankii01/error-to-md) 🚀*');
  
  return md.join('\n');
}

/**
 * Express middleware factory
 */
function expressErrorToMd(options = {}) {
  const config = { ...defaultOptions, ...options };
  
  return (err, req, res, next) => {
    const markdown = errorToMarkdown(err, req, config);
    
    // Log to console
    console.error('\n' + markdown + '\n');
    
    // Call custom logger if provided
    if (config.logger && typeof config.logger === 'function') {
      config.logger(markdown, err, req);
    }
    
    // Send response
    if (!res.headersSent) {
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode);
      
      if (config.sendMarkdown) {
        res.type('text/markdown').send(markdown);
      } else {
        res.json({
          error: 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && { 
            message: err.message,
            errorId: config.generateErrorId ? generateErrorId(err, req) : undefined
          })
        });
      }
    }
  };
}

/**
 * Async error handler wrapper
 */
function asyncErrorToMd(fn, options = {}) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      const markdown = errorToMarkdown(err, req, options);
      console.error('\n' + markdown + '\n');
      next(err);
    }
  };
}

/**
 * Create error from JSON object (for CLI usage)
 */
function createErrorFromObject(errorObj) {
  const err = new Error(errorObj.message || 'Unknown error');
  err.name = errorObj.name || 'Error';
  err.stack = errorObj.stack || err.stack;
  err.code = errorObj.code;
  return err;
}

export { 
  errorToMarkdown, 
  expressErrorToMd, 
  asyncErrorToMd, 
  createErrorFromObject,
  defaultOptions,
  themes
};

export default errorToMarkdown;