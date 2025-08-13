/**
 * Comprehensive test suite for error-to-md
 * 
 * Run with: node test.js
 */

import { 
  errorToMarkdown, 
  expressErrorToMd, 
  asyncErrorToMd,
  createErrorFromObject 
} from './index.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✅ ${message}`);
  } else {
    testsFailed++;
    console.error(`❌ ${message}`);
  }
}

function assertContains(haystack, needle, message) {
  assert(haystack.includes(needle), message);
}

function assertNotContains(haystack, needle, message) {
  assert(!haystack.includes(needle), message);
}

console.log('🧪 Running error-to-md test suite...\n');

// Test 1: Basic error conversion
console.log('📋 Test Group: Basic Error Conversion');
const basicError = new Error('Test error message');
const basicMarkdown = errorToMarkdown(basicError);

assertContains(basicMarkdown, '## 🐛 Bug Report', 'Should contain bug report title');
assertContains(basicMarkdown, 'Test error message', 'Should contain error message');
assertContains(basicMarkdown, 'Stack Trace:', 'Should contain stack trace section');
assertContains(basicMarkdown, 'Environment:', 'Should contain environment section');
assertContains(basicMarkdown, process.version, 'Should contain Node.js version');

console.log('');

// Test 2: Error with request context
console.log('📋 Test Group: Express Request Context');
const expressError = new Error('Database connection failed');
const mockRequest = {
  method: 'POST',
  originalUrl: '/api/users',
  url: '/api/users',
  ip: '127.0.0.1',
  body: { name: 'John Doe', password: 'secret123' },
  query: { include: 'profile' },
  params: { id: '12345' },
  headers: {
    'content-type': 'application/json',
    'authorization': 'Bearer token123',
    'user-agent': 'Mozilla/5.0'
  }
};

const expressMarkdown = errorToMarkdown(expressError, mockRequest);

assertContains(expressMarkdown, 'Request Details:', 'Should contain request details');
assertContains(expressMarkdown, 'POST', 'Should contain HTTP method');
assertContains(expressMarkdown, '/api/users', 'Should contain URL');
assertContains(expressMarkdown, 'John Doe', 'Should contain body data');
assertContains(expressMarkdown, '[REDACTED]', 'Should redact sensitive data');
assertNotContains(expressMarkdown, 'secret123', 'Should not contain passwords');
assertNotContains(expressMarkdown, 'token123', 'Should not contain tokens');

console.log('');

// Test 3: Configuration options
console.log('📋 Test Group: Configuration Options');
const configError = new Error('Configuration test error');
const configOptions = {
  theme: 'slack',
  severity: 'critical',
  appVersion: '2.1.0',
  includeTimestamp: true,
  includePerformance: false,
  redact: ['name', 'email']
};

const configMarkdown = errorToMarkdown(configError, null, configOptions);

assertContains(configMarkdown, '🚨 CRITICAL', 'Should show critical severity');
assertContains(configMarkdown, 'v2.1.0', 'Should show app version');
assertContains(configMarkdown, new Date().getFullYear().toString(), 'Should contain timestamp');

console.log('');

// Test 4: Different error types
console.log('📋 Test Group: Different Error Types');
const typeError = new TypeError('Cannot read property of undefined');
typeError.code = 'ENOENT';
const typeMarkdown = errorToMarkdown(typeError);

assertContains(typeMarkdown, 'TypeError', 'Should contain error type');
assertContains(typeMarkdown, 'ENOENT', 'Should contain error code');

console.log('');

// Test 5: Express middleware
console.log('📋 Test Group: Express Middleware');
const middleware = expressErrorToMd({ 
  appVersion: '1.0.0',
  logger: (markdown, err, req) => {
    assert(typeof markdown === 'string', 'Logger should receive markdown string');
    assert(err instanceof Error, 'Logger should receive error object');
  }
});

// Mock Express objects
const mockRes = {
  headersSent: false,
  status: (code) => {
    assert(code === 500, 'Should set status to 500');
    return mockRes;
  },
  json: (data) => {
    assert(data.error === 'Internal Server Error', 'Should send error response');
  }
};

const middlewareError = new Error('Middleware test error');
middleware(middlewareError, mockRequest, mockRes, () => {});

console.log('');

// Test 6: Async error wrapper
console.log('📋 Test Group: Async Error Wrapper');
const asyncFunction = async (req, res, next) => {
  throw new Error('Async operation failed');
};

const wrappedFunction = asyncErrorToMd(asyncFunction);
let nextCalled = false;

wrappedFunction(mockRequest, mockRes, (err) => {
  nextCalled = true;
  assert(err instanceof Error, 'Should pass error to next()');
  assert(err.message === 'Async operation failed', 'Should preserve error message');
});

// Give async operation time to complete
setTimeout(() => {
  assert(nextCalled, 'Should call next() with error');
  console.log('');
  runFinalTests();
}, 100);

function runFinalTests() {
  // Test 7: Error from JSON object
  console.log('📋 Test Group: Error from JSON Object');
  const errorJson = {
    message: 'JSON error test',
    name: 'CustomError',
    code: 'CUSTOM_001',
    stack: 'CustomError: JSON error test\n    at test.js:1:1'
  };

  const jsonError = createErrorFromObject(errorJson);
  assert(jsonError.message === 'JSON error test', 'Should create error with correct message');
  assert(jsonError.name === 'CustomError', 'Should create error with correct name');
  assert(jsonError.code === 'CUSTOM_001', 'Should create error with correct code');

  console.log('');

  // Test 8: Edge cases
  console.log('📋 Test Group: Edge Cases');
  
  // Empty error
  const emptyError = new Error();
  const emptyMarkdown = errorToMarkdown(emptyError);
  assertContains(emptyMarkdown, 'Unknown Error', 'Should handle empty error message');

  // Null request
  const nullReqMarkdown = errorToMarkdown(basicError, null);
  assertNotContains(nullReqMarkdown, 'Request Details:', 'Should handle null request');

  // Large objects (truncation)
  const largeBody = { data: 'x'.repeat(2000) };
  const largeReq = { ...mockRequest, body: largeBody };
  const largeMarkdown = errorToMarkdown(basicError, largeReq);
  assertContains(largeMarkdown, '[TRUNCATED]', 'Should truncate large objects');

  console.log('');

  // Test 9: Theme variations
  console.log('📋 Test Group: Theme Variations');
  
  const githubTheme = errorToMarkdown(basicError, null, { theme: 'github' });
  assertContains(githubTheme, '## 🐛 Bug Report', 'GitHub theme should use markdown headers');

  const slackTheme = errorToMarkdown(basicError, null, { theme: 'slack' });
  assertContains(slackTheme, '*🐛 Bug Report*', 'Slack theme should use slack formatting');

  const discordTheme = errorToMarkdown(basicError, null, { theme: 'discord' });
  assertContains(discordTheme, '## 🐛 Bug Report', 'Discord theme should use markdown headers');

  console.log('');

  // Print test results
  console.log('🎯 Test Results:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Ready for production! 🚀');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please fix the issues.');
    process.exit(1);
  }
}