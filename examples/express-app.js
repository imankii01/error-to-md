/**
 * Express middleware example for error-to-md
 * 
 * Run with: node examples/express-app.js
 * Then visit: http://localhost:3000/test-error
 */

import express from 'express';
import { expressErrorToMd, asyncErrorToMd } from '../index.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('🚀 error-to-md Express Example Server');
console.log('─'.repeat(50));

// Routes that will trigger different types of errors
app.get('/', (req, res) => {
  res.json({
    message: 'error-to-md Express Example',
    endpoints: {
      '/test-error': 'Throws a basic error',
      '/test-async-error': 'Throws an async error',
      '/test-post-error': 'POST endpoint that throws (send JSON body)',
      '/test-validation-error': 'Throws a validation error',
      '/test-database-error': 'Simulates database connection error'
    },
    instructions: [
      '1. Visit any endpoint above to see error-to-md in action',
      '2. Check the console for beautiful markdown error reports',
      '3. Try sending POST data to /test-post-error'
    ]
  });
});

// Basic error
app.get('/test-error', (req, res) => {
  throw new Error('This is a test error from the basic route!');
});

// Async error with wrapper
app.get('/test-async-error', asyncErrorToMd(async (req, res) => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  throw new Error('This is an async error!');
}, { severity: 'warning' }));

// POST endpoint with body data
app.post('/test-post-error', (req, res) => {
  console.log('📨 Received POST data:', req.body);
  
  const error = new Error('Failed to process POST data');
  error.code = 'PROCESSING_FAILED';
  throw error;
});

// Validation error
app.get('/test-validation-error', (req, res) => {
  const error = new TypeError('Validation failed: email is required');
  error.name = 'ValidationError';
  error.field = 'email';
  throw error;
});

// Database error simulation
app.get('/test-database-error', (req, res) => {
  const error = new Error('Connection timeout after 5000ms');
  error.name = 'DatabaseConnectionError';
  error.code = 'ETIMEDOUT';
  error.errno = -110;
  throw error;
});

// Custom 404 handler
app.use('*', (req, res) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.name = 'NotFoundError';
  throw error;
});

// Error-to-markdown middleware (must be last!)
app.use(expressErrorToMd({
  appVersion: '2.1.0',
  theme: 'github',
  severity: 'error',
  includePerformance: true,
  logger: (markdown, error, req) => {
    console.log('\n' + '🐛 ERROR REPORT GENERATED'.padStart(50, '='));
    console.log(markdown);
    console.log('='.repeat(50) + '\n');
    
    // Here you could send to external services:
    // - sendToSlack(markdown);
    // - createGitHubIssue(markdown);
    // - sendToDatadog(markdown);
  }
}));

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log('\n📋 Try these commands:');
  console.log(`   curl http://localhost:${PORT}/test-error`);
  console.log(`   curl -X POST -H "Content-Type: application/json" -d '{"username":"john","password":"secret123"}' http://localhost:${PORT}/test-post-error`);
  console.log('\n💡 Watch the console for beautiful error reports!');
  console.log('\n🛑 Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Server shutting down gracefully...');
  process.exit(0);
});