# Statsig Browser Extension

[![Statsig](https://img.shields.io/badge/Statsig-Enabled-194bfa?style=for-the-badge&logo=statsig&logoColor=white)](https://statsig.com)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web_Store-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--ons-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white)](https://addons.mozilla.org)
[![Microsoft Edge Add-ons](https://img.shields.io/badge/Edge-Add--ons-0078D7?style=for-the-badge&logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons)

A powerful browser extension for managing Statsig feature gates, experiments, and dynamic configs directly from your browser.

## 🚀 What is this?

This extension bridges the gap between the [Statsig Console](https://console.statsig.com) and your local development or production environment. It allows developers, PMs, and QA to debug and test feature flags and experiments in real-time without changing code or dashboard settings.

> **Note**: This extension allows you to inspect current configurations and apply overrides using your **Statsig Console API Key**. These overrides are applied via the Statsig API, effectively changing them in the project context (depending on the scope of the override, usually user or gate specific), not just a local browser hack. It requires a Write-access Console API Key to perform these actions.

**Key Capabilities:**

- **Debug Feature Flags**: Instantly see why a gate is returning `false` or `true`.
- **Test Variations**: Force a specific experiment group to verify UI changes on the fly.
- **Audit SDK State**: Ensure the SDK is initialized with the correct keys and user object.

## ✨ Features

- **Feature Gates**: View current status and apply overrides via Statsig API.
- **Experiments**: Monitor active experiments and force specific variations via Statsig API overrides.
- **Dynamic Configs**: Inspect dynamic configurations and their evaluated values.
- **Audit Logs**: Track recent changes and user activities within the session.
- **Overrides**: Create and manage overrides using your Statsig Console API Key.
- **User Details**: View the current Statsig User object (UserID, Email, Custom IDs, etc.).

## 📖 How to Use

1.  **Install the Extension**: Download it from your browser's extension store (links above) or load it as an unpacked extension.
2.  **Navigate to your App**: Open any web application that has the Statsig SDK initialized.
3.  **Open the Extension**: Click the Statsig icon in your browser toolbar.
    - _Note: The extension automatically detects the Statsig SDK on the page._
4.  **Configure API Key**: Go to Settings and enter your **Statsig Console API Key** (Write access required for overrides).
5.  **Interact**:
    - **Toggle Gates**: Click on a gate to override its value (requires Console API Key).
    - **Change Groups**: Select a different experiment group to see how the app behaves.
    - **Review Configs**: Check if your dynamic configs are delivering the expected JSON.

## 🛠 Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Tools)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI and Tailwind CSS)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 💻 Development

### Prerequisites

- Node.js (v24+)
- pnpm (v10+)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running in Development Mode

```bash
pnpm dev
# or for specific browsers
pnpm dev:chrome
pnpm dev:firefox
pnpm dev:edge
```

This will start the development server and open a browser instance with the extension loaded.

### Building for Production

```bash
pnpm build
# or
pnpm zip:all
```

The output artifacts will be in the `.output/` directory.

## 📂 Project Structure

- `entrypoints/`: Extension entry points (popup, background, content scripts)
- `src/components/`: React components (UI, sheets, modals, tables)
- `src/hooks/`: Custom React hooks (TanStack Query, local storage)
- `src/handlers/`: API handlers and mutations
- `src/store/`: Zustand store configuration
- `src/types/`: TypeScript definitions
- `src/lib/`: Utility functions and configurations

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📦 Release & Publishing

We use `semantic-release` to automate our release process. For detailed instructions on how to publish the extension to Chrome, Firefox, and Edge stores, please refer to [docs/publishing.md](docs/publishing.md).
