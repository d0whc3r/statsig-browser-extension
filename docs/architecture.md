# Architecture

Technical reference for the extension internals. For setup, commit conventions, and the PR process see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Toolkit)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [wretch](https://github.com/elbywan/wretch) + [TanStack Query v5](https://tanstack.com/query/latest)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) v4
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **Linting & Formatting**: [oxlint](https://oxlint.dev/) + [oxfmt](https://github.com/oxc-project/oxfmt)
- **Icons**: [Lucide React](https://lucide.dev/)
- **CI/CD**: GitHub Actions, [semantic-release](https://github.com/semantic-release/semantic-release), [Codecov](https://codecov.io/), [SonarCloud](https://sonarcloud.io/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Project Structure

- `entrypoints/`: Extension entry points (`popup/index.html`, `background.ts`, `content.ts`, `statsig-detector.ts`)
- `src/components/`: React components
  - `audit-logs/`: Audit log list, filters, and row components
  - `common/`: Shared components (context cards, override forms, dialogs, tables)
  - `layout/`: Header, tabs, and global modal wrapper
  - `modals/`: Auth form and modal
  - `pages-experiment/`: Experiment override page, form, row, and context card
  - `pages-gate-overrides/`: Gate override page, section, modal, row, and context card
  - `sheets/`: Detail sheets for gates, experiments, and configs
- `src/handlers/`: API interaction logic (gate/experiment overrides, user details, initial login, project fingerprint)
- `src/hooks/`: TanStack Query hooks, storage hooks, mutation logic, and form hooks
- `src/lib/`: Core utilities (`fetcher`, `rules`, `storage`, `utils`, `query-client`)
- `src/store/`: Zustand stores (`use-settings-store`, `use-ui-store`, `use-context-store`)
- `src/types/`: TypeScript definitions (Statsig API types, audit logs, gates, experiments)
- `src/utils/`: Utility functions (audit log helpers, etc.)
- `src/tests/`: Test setup, unit tests, and integration tests

## Build Output

`pnpm build` and `pnpm zip:all` write artifacts to `.output/`.

## Related Docs

- [Project key detection](project-key-detection.md) — how the extension matches a page's SDK key to a stored project
- [Permissions justification](permissions-justification.md) — why each manifest permission is requested
- [Publishing](publishing.md) — release automation and store submission
