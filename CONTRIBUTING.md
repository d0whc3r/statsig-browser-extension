# Contributing to Statsig Browser Extension

Thank you for your interest in contributing to the Statsig Browser Extension! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1.  **Prerequisites**:
    - Node.js (v24 or higher)
    - pnpm (v10 recommended)

2.  **Clone the repository**:

    ```bash
    git clone https://github.com/statsig/statsig-browser-extension.git
    cd statsig-browser-extension
    ```

3.  **Install dependencies**:

    ```bash
    pnpm install
    ```

4.  **Start development server**:
    ```bash
    pnpm dev
    # Or specific browser:
    pnpm dev:chrome
    pnpm dev:firefox
    pnpm dev:edge
    ```

## Code Standards

- **Linting**: We use `oxlint` for linting. Run `pnpm lint` to check for issues and `pnpm lint:fix` to fix them.
- **Formatting**: We use `oxfmt` for formatting. Run `pnpm format` to format your code.
- **Testing**: We use `vitest` for testing. Run `pnpm test` to run tests.

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation via `semantic-release`. It is **crucial** to follow these guidelines.

### Format

```
<type>(<scope>): <subject>
```

### Types

- **feat**: A new feature (triggers a MINOR release, e.g., v1.1.0).
- **fix**: A bug fix (triggers a PATCH release, e.g., v1.0.1).
- **docs**: Documentation only changes.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **test**: Adding missing tests or correcting existing tests.
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
- **chore**: Other changes that don't modify src or test files.
- **revert**: Reverts a previous commit.

### Breaking Changes

If your commit introduces a breaking change, add `BREAKING CHANGE:` in the footer or append `!` after the type/scope. This triggers a MAJOR release (e.g., v2.0.0).

**Example**:

```
feat(auth)!: remove support for basic authentication
```

## Release Process

The release process is fully automated using GitHub Actions and `semantic-release`.
For detailed instructions on how the release process works and how to configure environment variables for publishing to browser stores, please refer to [docs/publishing.md](docs/publishing.md).

## Pull Request Process

1.  Fork the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`pnpm test`).
4.  Make sure your code lints (`pnpm lint`).
5.  Follow the commit message guidelines.
6.  Issue that pull request!
