# Contributing to Statsig Browser Extension

Thank you for your interest in contributing to the Statsig Browser Extension! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1.  **Prerequisites**:
    - Node.js (v24 or higher)
    - pnpm (v10 recommended)

2.  **Clone the repository**:

    ```bash
    git clone https://github.com/d0whc3r/statsig-browser-extension.git
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
    ```

## Code Standards

- **Linting**: We use `oxlint` for high-performance linting. Run `pnpm lint` to check for issues and `pnpm lint:fix` to fix them.
- **Formatting**: We use `oxfmt` for lightning-fast formatting. Run `pnpm format` to format your code or `pnpm format:check` to verify.
- **Testing**: We use `vitest` for unit and integration testing. Run `pnpm test` to run tests.
- **Data Fetching**: Use `wretch` for API requests and `tanstack-query` for managing the server state in the UI. All network calls from the popup must be routed through `background.ts` via the `API_REQUEST` message (available in `src/lib/fetcher.ts`).

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

## Dependency security exceptions

Run `pnpm audit` after dependency changes. The lockfile contains compatible security
updates; the scoped `fx-runner>shell-quote` override replaces its vulnerable exact
pin. Keep install-script restrictions in `pnpm-workspace.yaml` enabled.

As of 2026-10-13, two development dependencies have no published fix. Keep their
advisories visible and review them again by **2026-11-13**:

- `node-forge` 1.4.0: [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
  It comes through `web-ext > @devicefarmer/adbkit`. The affected RSA verification
  belongs to adbkit's TCP USB server. The reviewed web-ext workflows use its ADB
  client, not that server, and target Chrome and desktop Firefox. Reassess before
  adding TCP USB server functionality or another node-forge caller.
- `braces` 3.0.3: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
  It comes through release tooling and micromatch. The reviewed release callers
  use `micromatch()` and `.isMatch()`, which call picomatch directly; the vulnerable
  brace expansion paths are `.parse()`, `.braces()` and `.braceExpand()`. Patterns
  are maintained in repository configuration. Reassess before using those paths
  or accepting patterns from external input.
