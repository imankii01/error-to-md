# Contributing to error-to-md

Thank you for your interest in contributing to error-to-md! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to private.ankit047@gmail.com.

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/error-to-md.git
   cd error-to-md
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Try the examples**
   ```bash
   npm run example
   npm run example:express
   npm run example:cli
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-theme`
- `fix/memory-leak-issue`
- `docs/update-readme`
- `refactor/cleanup-code`

### Commit Messages

Follow conventional commits:
- `feat: add Discord theme support`
- `fix: resolve memory leak in large objects`
- `docs: update CLI documentation`
- `refactor: simplify error ID generation`
- `test: add tests for async error handling`

### Code Style

- Use ES modules (import/export)
- Follow existing code formatting
- Add JSDoc comments for functions
- Keep functions focused and small
- Use descriptive variable names

### Adding Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your feature**
   - Add the main functionality
   - Update TypeScript definitions if needed
   - Add examples if applicable

3. **Add tests**
   - Add test cases in `test.js`
   - Test both success and error scenarios
   - Ensure high test coverage

4. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments
   - Update examples

### Adding Themes

To add a new theme:

1. **Add theme definition**
   ```javascript
   // In index.js
   const themes = {
     // ... existing themes
     yourtheme: {
       title: '## 🐛 Your Theme Bug Report',
       errorIcon: '🔥',
       stackIcon: '📊',
       requestIcon: '🌍',
       envIcon: '⚙️',
       separator: '---'
     }
   };
   ```

2. **Add to TypeScript definitions**
   ```typescript
   // In types.d.ts
   theme?: 'github' | 'slack' | 'discord' | 'yourtheme';
   ```

3. **Add tests**
   ```javascript
   // In test.js
   const yourThemeMarkdown = errorToMarkdown(basicError, null, { theme: 'yourtheme' });
   assertContains(yourThemeMarkdown, 'Your Theme Bug Report', 'Should use your theme formatting');
   ```

4. **Update documentation**
   - Add to README.md examples
   - Add to CLI help text

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with file watching
npm run test:watch
```

### Test Structure

Tests are in `test.js` and cover:
- Basic error conversion
- Express middleware
- Request context
- Configuration options
- Theme variations
- Edge cases
- CLI functionality

### Adding Tests

When adding features, add corresponding tests:

```javascript
console.log('📋 Test Group: Your Feature');
// Your test implementation
assert(condition, 'Description of what should happen');
```

## Submitting Changes

### Pull Request Process

1. **Ensure tests pass**
   ```bash
   npm test
   ```

2. **Update documentation**
   - README.md if user-facing changes
   - CONTRIBUTING.md if process changes
   - JSDoc comments for new functions

3. **Create pull request**
   - Use descriptive title
   - Reference any related issues
   - Include testing instructions
   - Add screenshots if UI changes

4. **Pull request template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature  
   - [ ] Documentation update
   - [ ] Refactoring
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests for changes
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows project style
   - [ ] Self-review completed
   - [ ] Documentation updated
   ```

### Review Process

- Maintainer will review within 48 hours
- Address feedback promptly
- Ensure CI passes
- Squash commits if requested

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Create release PR
5. Tag release after merge
6. Publish to npm
7. Create GitHub release

## Need Help?

- 💬 **Questions**: Open a [Discussion](https://github.com/imankii01/error-to-md/discussions)
- 🐛 **Bug Reports**: Open an [Issue](https://github.com/imankii01/error-to-md/issues)
- 📧 **Direct Contact**: private.ankit047@gmail.com

## Recognition

Contributors will be added to:
- README.md contributors section
- npm package contributors
- GitHub releases

Thank you for contributing! 🙏