# Statsig Browser Extension

A Chrome extension for managing Statsig features, experiments, and dynamic configs directly from your browser.

## Features

- **Feature Gates**: View, search, and manage feature gates.
- **Experiments**: Monitor experiments, view groups, and manage overrides.
- **Dynamic Configs**: Inspect dynamic configurations and default values.
- **Audit Logs**: Track changes and user activities.
- **Overrides**: Create and manage local overrides for testing.
- **User Details**: View current user information.

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Tools)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI and Tailwind CSS)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Development

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running in Development Mode

```bash
pnpm dev
```

This will start the development server and open a Chrome instance with the extension loaded.

### Building for Production

```bash
pnpm build
```

The output will be in the `.output/` directory.

## Project Structure

- `entrypoints/`: Extension entry points (popup, background, content scripts)
- `src/components/`: React components (UI, sheets, modals, tables)
- `src/hooks/`: Custom React hooks (TanStack Query, local storage)
- `src/handlers/`: API handlers and mutations
- `src/store/`: Zustand store configuration
- `src/types/`: TypeScript definitions
- `src/lib/`: Utility functions and configurations
