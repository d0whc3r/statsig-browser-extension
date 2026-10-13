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
  - `cleanup/`: Gate cleanup findings, filters, and audit panel
  - `modals/`: Auth form and modal
    - `manage-experiment/`: Experiment override dialog, forms, rows, and context card
    - `manage-gate-overrides/`: Gate override dialog, forms, rows, and context card
  - `sheets/`: Detail sheets for gates, experiments, and configs
- `src/handlers/`: API interaction logic (gate/experiment overrides, user details, initial login, project fingerprint)
- `src/hooks/`: TanStack Query hooks, storage hooks, mutation logic, and form hooks
- `src/lib/`: Core utilities (`fetcher`, `rules`, `storage`, `utils`, `query-client`)
- `src/store/`: Zustand stores (`use-settings-store`, `use-ui-store`, `use-context-store`)
- `src/types/`: TypeScript definitions (Statsig API types, audit logs, gates, experiments)
- `src/utils/`: Utility functions (audit log helpers, etc.)
- `src/tests/`: Test setup, unit tests, and integration tests

## Project Transitions

The settings store owns credential activation for project additions, switches,
removals, and external storage changes. During a credential change it reports a
pending state, closes project-specific editors, and cancels/removes project query
cache entries. Settings and page user detection remain available. A usable key is
published only after its background storage mirror is written. Writes are
serialized, and an older completion cannot activate a newer selection's key.
Failed persistence keeps project data blocked until a retry succeeds.
The fetch bridge captures each ready request's key before asynchronous background
delivery, so a request already submitted for one project keeps that credential
even if another project becomes active. Explicit login/fingerprint keys take
precedence over the active key.

External storage watchers read the project list, active id, and mirrored key
without writing them back. They enable data only when those values agree.
Metadata-only changes preserve the current editors and query cache. Manual page
selection and detected matches must refer to the configured active project.

## API Pagination and Cleanup Audit

All four list hooks use `src/lib/pagination.ts` for the Console API response.
Requests use `limit` and `page`; responses use `itemsPerPage`, `pageNumber`,
`nextPage`, and `previousPage`. The `nextPage` marker determines whether more data
exists, even when `totalItems` is absent. See the [official gate list contract](https://docs.statsig.com/api-reference/gates/list-gates).

Cleanup audits preserve rule order. An always-on finding requires an unconditional
100% rule that applies to every environment, without an earlier rejecting rule or
a holdout. Twin detection excludes percentage rollouts and holdouts, whose salts
can change which users pass. Loaded rules cannot establish the complete inventory
of project environments. These findings are review signals; inspect configured
user overrides before removing a gate. See [Statsig evaluation semantics](https://docs.statsig.com/sdks/how-evaluation-works).

## Build Output

`pnpm build` and `pnpm zip:all` write artifacts to `.output/`.

## Related Docs

- [Project key detection](project-key-detection.md) — how the extension matches a page's SDK key to a stored project
- [Permissions justification](permissions-justification.md) — why each manifest permission is requested
- [Publishing](publishing.md) — release automation and store submission
