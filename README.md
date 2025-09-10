# js-utils

Repo for useful js utilities

[![GitHub Issues](https://img.shields.io/github/issues/codibre/js-utils.svg)](https://github.com/codibre/js-utils/issues)
[![GitHub Stars](https://img.shields.io/github/stars/codibre/js-utils.svg)](https://github.com/codibre/js-utils/stargazers)
[![Maintainability](https://qlty.sh/gh/codibre/projects/js-utils/maintainability.svg)](https://qlty.sh/gh/codibre/projects/js-utils)
[![Code Coverage](https://qlty.sh/gh/codibre/projects/js-utils/coverage.svg)](https://qlty.sh/gh/codibre/projects/js-utils)

---

## Overview

This monorepo has some useful javascript utilities that merge seamlessly with vanilla javascript

---

## 🛠️ Development

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10.12.4
- **Git**

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/codibre/js-utils.git
   cd js-utils
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run tests**
   ```bash
   pnpm test
   ```

4. **Build packages**
   ```bash
   pnpm build
   ```

### Development Commands

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Lint all packages
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm prettier:fix

# Validate commit messages
pnpm commit:validate
```

### 💡 Development Tip: Don't Worry About Formatting While Coding!

**Focus on your logic, not formatting** while developing. The project has automated tools to handle code style:

```bash
# After writing your code, run this to fix all formatting/linting issues:
pnpm lint:fix
```

This command will automatically:
- ✅ Fix ESLint rule violations
- ✅ Format code with Prettier
- ✅ Organize imports
- ✅ Remove unused variables
- ✅ Apply consistent code style

**Pre-commit hooks** will also run these fixes automatically when you commit, so you can stay in the flow of coding without interruption!

### Code Quality Standards

#### TypeScript
- Strict TypeScript configuration
- Comprehensive type definitions
- TSDoc documentation for all public APIs

#### Testing
- **Unit Tests**: All business logic and utilities
- **Integration Tests**: Real HTTP request testing with spies
- **Coverage**: Maintained above 80%
- **Test Structure**: Descriptive names, success/error scenarios

#### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```bash
# Examples
feat(newrelic): add support for HTTP/2 instrumentation
fix(events): resolve memory leak in event emitter
docs(readme): update installation instructions
test(guard): add integration tests for transaction context
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

## 🚀 CI/CD & Publishing

### Automated Publishing

The monorepo uses intelligent change detection to automatically:

1. **Detect Changed Packages**: Only builds and tests packages that have changes
2. **Semantic Versioning**: Automatically bumps versions based on conventional commits
3. **Automated Publishing**: Publishes to npm registry when changes are merged to main
4. **Release Notes**: Generates changelogs from commit messages

### GitHub Actions Workflow

```yaml
# Automatically triggers on:
# - Pull requests (run tests)
# - Push to main (run tests + publish if needed)
# - Manual dispatch (force publish)
```

**Pipeline Steps:**
1. **Setup**: Node.js, pnpm, dependencies
2. **Build**: Compile TypeScript, generate types
3. **Test**: Unit tests, integration tests, coverage
4. **Lint**: Code style and formatting checks
5. **Publish**: Automatic npm publishing for changed packages

### Release Process

Releases are fully automated:

1. **Commit Changes**: Using conventional commit format
2. **Create PR**: CI runs all tests and checks
3. **Merge to Main**: Automatic version bump and publishing
4. **Monitor**: Check npm and GitHub releases

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/your-username/js-utils.git
cd js-utils
```

### 2. Create Feature Branch
```bash
git checkout -b feat/your-feature-name
```

### 3. Development Workflow
```bash
# Install dependencies
pnpm install

# Make your changes
# Add tests for new functionality
# Update documentation

# Validate your changes
pnpm build
pnpm test
pnpm lint
```

### 4. Commit & Push
```bash
# Use conventional commit format
git add .
git commit -m "feat(scope): description of your changes"
git push origin feat/your-feature-name
```

### 5. Create Pull Request
- Provide clear description of changes
- Link any related issues
- Ensure all CI checks pass

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No breaking changes (or properly documented)

## 📋 Adding New Features

### For New Instrumentation Types

1. **Identify Use Case**: What isn't covered by existing instrumentation?
2. **Design Solution**: Integration with existing components vs. new components
3. **Implement with Tests**: Comprehensive unit and integration tests
4. **Documentation**: Update README, add examples, document APIs

### For Bug Fixes

1. **Reproduce Issue**: Create test demonstrating the bug
2. **Fix Minimally**: Smallest change to resolve the issue
3. **Test Thoroughly**: Verify fix + full test suite + edge cases

## 🔧 Package Development

### Adding a New Package

1. **Create Package Directory**
   ```bash
   mkdir libs/your-new-package
   cd libs/your-new-package
   ```

2. **Package Configuration**
   ```bash
   # Create package.json with proper workspace config
   # Add to pnpm-workspace.yaml
   # Configure turbo.json for build pipeline
   ```

3. **Development Setup**
   ```bash
   # Add scripts in turbo.json
   # Configure Jest for testing
   # Set up TypeScript configuration
   ```

### Testing Integration

- Use `--runInBand` for consistent test execution
- Mock external dependencies (New Relic, databases, etc.)
- Test both success and error scenarios
- Maintain high coverage (>80%)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🌟 Support

- **Documentation**: Check package-specific READMEs in `libs/`
- **Issues**: [GitHub Issues](https://github.com/codibre/js-utils/issues)
- **Discussions**: [GitHub Discussions](https://github.com/codibre/js-utils/discussions)

## 🚀 Why Choose This Library?

### Production Ready
- ✅ **Battle-tested** in high-traffic production environments
- ✅ **Comprehensive testing** with >90% coverage
- ✅ **Performance optimized** with minimal overhead
- ✅ **Error resilient** with graceful degradation

### Developer Experience
- ✅ **TypeScript first** with complete type definitions
- ✅ **Easy integration** with minimal configuration
- ✅ **Extensive documentation** with real-world examples
- ✅ **Active maintenance** with regular updates

### Enterprise Features
- ✅ **Distributed tracing** across microservices
- ✅ **Custom transaction naming** for better monitoring
- ✅ **Event-driven architecture** for real-time insights
- ✅ **Background job instrumentation** for complete visibility

---

**Built with ❤️ by [Codibre](https://github.com/codibre)**
