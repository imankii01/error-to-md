/**
 * Basic usage example for error-to-md
 * 
 * Run with: node examples/basic.js
 */

import { errorToMarkdown } from '../index.js';

console.log('🚀 error-to-md - Basic Example\n');

// Example 1: Simple error
console.log('📋 Example 1: Simple Error');
console.log('─'.repeat(50));

try {
  // Simulate an error
  const data = null;
  data.someProperty.value; // This will throw
} catch (error) {
  const markdown = errorToMarkdown(error, null, {
    appVersion: '1.0.0',
    severity: 'error'
  });
  
  console.log(markdown);
}

console.log('\n\n');

// Example 2: Different severity levels
console.log('📋 Example 2: Different Severity Levels');
console.log('─'.repeat(50));

const severities = ['info', 'warning', 'error', 'critical'];

severities.forEach(severity => {
  const testError = new Error(`This is a ${severity} level error`);
  const markdown = errorToMarkdown(testError, null, {
    severity,
    includeTimestamp: false,
    includePerformance: false,
    includeEnvironment: false
  });
  
  console.log(`\n${severity.toUpperCase()}:`);
  console.log(markdown.split('\n').slice(0, 6).join('\n'));
  console.log('...\n');
});

console.log('\n📚 Run "node examples/express-app.js" for Express middleware example!');