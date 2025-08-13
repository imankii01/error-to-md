#!/usr/bin/env node

/**
 * error-to-md CLI - Convert error JSON files to Markdown
 * 
 * @author imankii01 <private.ankit047@gmail.com>
 * @homepage https://imankii01.github.io/error-to-md
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { errorToMarkdown, createErrorFromObject } from './index.js';

const VERSION = '1.0.0';

function showHelp() {
  console.log(`
🐛 error-to-md CLI v${VERSION}
Convert Node.js errors to beautiful Markdown bug reports

USAGE:
  error-to-md <input.json> [options]
  error-to-md --demo
  cat error.json | error-to-md

OPTIONS:
  -o, --output <file>     Output file (default: stdout)
  -t, --theme <theme>     Theme: github, slack, discord (default: github)
  --no-env               Exclude environment info
  --no-timestamp         Exclude timestamp
  --severity <level>     Set severity: info, warning, error, critical
  --app-version <ver>    Set app version
  --demo                 Generate a demo error report
  -h, --help             Show this help
  -v, --version          Show version

EXAMPLES:
  error-to-md error.json
  error-to-md error.json -o bug-report.md -t slack
  error-to-md --demo --severity critical
  echo '{"message":"Test error","stack":"at test.js:1:1"}' | error-to-md

GitHub: https://github.com/imankii01/error-to-md
  `);
}

function generateDemo(options = {}) {
  const demoError = new Error('Database connection timeout');
  demoError.name = 'ConnectionTimeoutError';
  demoError.code = 'ETIMEDOUT';
  demoError.stack = `ConnectionTimeoutError: Database connection timeout
    at Database.connect (/app/src/database.js:42:15)
    at UserService.getUser (/app/src/services/user.js:28:18)
    at UserController.profile (/app/src/controllers/user.js:15:12)
    at /app/src/routes/api.js:23:5
    at processTicksAndRejections (node:internal/process/task_queues:96:5)`;
  
  const demoRequest = {
    method: 'GET',
    originalUrl: '/api/user/profile',
    url: '/api/user/profile',
    ip: '192.168.1.100',
    headers: {
      'user-agent': 'Mozilla/5.0 (Mac OS X) Chrome/91.0.4472.124',
      'accept': 'application/json',
      'authorization': 'Bearer jwt-token-here',
      'x-forwarded-for': '203.0.113.195'
    },
    query: { include: 'preferences' },
    params: { userId: '12345' }
  };
  
  return errorToMarkdown(demoError, demoRequest, {
    appVersion: '2.1.3',
    severity: 'error',
    ...options
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    theme: 'github',
    includeEnvironment: true,
    includeTimestamp: true,
    severity: 'error'
  };
  
  let inputFile = null;
  let outputFile = null;
  let showDemo = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
        
      case '-v':
      case '--version':
        console.log(`v${VERSION}`);
        process.exit(0);
        break;
        
      case '--demo':
        showDemo = true;
        break;
        
      case '-o':
      case '--output':
        outputFile = args[++i];
        break;
        
      case '-t':
      case '--theme':
        options.theme = args[++i];
        break;
        
      case '--severity':
        options.severity = args[++i];
        break;
        
      case '--app-version':
        options.appVersion = args[++i];
        break;
        
      case '--no-env':
        options.includeEnvironment = false;
        break;
        
      case '--no-timestamp':
        options.includeTimestamp = false;
        break;
        
      default:
        if (!arg.startsWith('-')) {
          inputFile = arg;
        }
        break;
    }
  }
  
  return { inputFile, outputFile, options, showDemo };
}

function main() {
  const { inputFile, outputFile, options, showDemo } = parseArgs();
  
  let markdown = '';
  
  try {
    if (showDemo) {
      markdown = generateDemo(options);
    } else if (inputFile) {
      // Read from file
      const filePath = resolve(inputFile);
      const jsonData = readFileSync(filePath, 'utf8');
      const errorObj = JSON.parse(jsonData);
      
      const error = createErrorFromObject(errorObj);
      const request = errorObj.request || null;
      
      markdown = errorToMarkdown(error, request, options);
    } else {
      // Read from stdin
      let stdinData = '';
      process.stdin.setEncoding('utf8');
      
      if (process.stdin.isTTY) {
        console.error('❌ Error: No input provided. Use --help for usage information.');
        process.exit(1);
      }
      
      process.stdin.on('data', chunk => {
        stdinData += chunk;
      });
      
      process.stdin.on('end', () => {
        try {
          const errorObj = JSON.parse(stdinData.trim());
          const error = createErrorFromObject(errorObj);
          const request = errorObj.request || null;
          
          markdown = errorToMarkdown(error, request, options);
          
          if (outputFile) {
            writeFileSync(outputFile, markdown);
            console.error(`✅ Markdown report saved to: ${outputFile}`);
          } else {
            console.log(markdown);
          }
        } catch (err) {
          console.error('❌ Error parsing JSON from stdin:', err.message);
          process.exit(1);
        }
      });
      
      return;
    }
    
    // Output result
    if (outputFile) {
      writeFileSync(outputFile, markdown);
      console.error(`✅ Markdown report saved to: ${outputFile}`);
    } else {
      console.log(markdown);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    
    if (err.code === 'ENOENT') {
      console.error('💡 Tip: Make sure the input file exists and is readable.');
    } else if (err instanceof SyntaxError) {
      console.error('💡 Tip: Make sure the input file contains valid JSON.');
    }
    
    process.exit(1);
  }
}

main();