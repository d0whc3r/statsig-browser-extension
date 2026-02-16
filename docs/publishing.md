# Publishing Guide

This project uses `semantic-release` to automatically publish new versions of the extension to the Chrome Web Store, Firefox Add-ons (AMO), and Microsoft Edge Add-ons.

## Prerequisites

Before setting up the automation, ensure you have:

1.  Created developer accounts for all stores.
2.  Uploaded the initial version of the extension manually to each store at least once. This is required to generate the necessary IDs and to pass initial review.

## Environment Variables

The publishing workflow uses the [PlasmoHQ/bpp](https://github.com/PlasmoHQ/bpp) action, which requires a single JSON secret named `SUBMIT_KEYS`.

### `SUBMIT_KEYS` Secret

You must create a single repository secret named `SUBMIT_KEYS` containing a JSON object with the credentials for all stores you want to publish to.

**Format:**

```json
{
  "chrome": {
    "extensionId": "your-extension-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "refreshToken": "your-refresh-token"
  },
  "firefox": {
    "extensionId": "your-extension-id",
    "apiKey": "your-jwt-issuer",
    "apiSecret": "your-jwt-secret"
  },
  "edge": {
    "productId": "your-product-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "accessTokenUrl": "https://login.microsoftonline.com/your-tenant-id/oauth2/v2.0/token"
  }
}
```

### Credentials Guide

#### Chrome Web Store

1.  **extensionId**: Found in the Chrome Web Store URL.
2.  **clientId**, **clientSecret**, **refreshToken**:
    - Go to [Google Cloud Console](https://console.cloud.google.com/).
    - Enable **Chrome Web Store API**.
    - Create OAuth 2.0 Client ID (Desktop app).
    - Use credentials to generate a refresh token (e.g., via [chrome-webstore-upload-cli](https://github.com/DrewML/chrome-webstore-upload-cli)).

#### Firefox Add-ons (AMO)

1.  **extensionId**: The UUID of your extension (e.g., `{uuid}`).
2.  **jwtIssuer**, **jwtSecret**:
    - Go to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/) -> Settings -> Manage API Keys.

#### Microsoft Edge Add-ons

1.  **productId**: Store ID found in [Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview).
2.  **clientId**, **clientSecret**:
    - Go to Partner Center -> Microsoft Edge -> Settings -> Developer settings.
    - Create a new client secret (API Key). **Note**: `clientSecret` here corresponds to the "API Key" or "Secret" from Partner Center.

### GitHub Token

### GitHub Token

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions, but ensure the workflow has `contents: write` permissions.

## Release Process

The release process is fully automated via GitHub Actions on the `main` branch.

1.  **Commit**: Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.
    - `fix(...)`: Triggers a Patch release (v1.0.1).
    - `feat(...)`: Triggers a Minor release (v1.1.0).
    - `BREAKING CHANGE`: Triggers a Major release (v2.0.0).
2.  **Push**: Push to `main`.
3.  **Release Workflow (`release.yml`)**:
    - Installs dependencies, runs linting and tests.
    - Determines the next version using `semantic-release`.
    - Updates `package.json` and `CHANGELOG.md`.
    - Creates a GitHub Release and a git tag.
4.  **Submit Workflow (`submit.yml`)**:
    - Triggered automatically by the `release` (published) event.
    - Can also be triggered manually via "Run workflow" (workflow_dispatch).
    - Builds the extension for Chrome, Firefox, and Edge using `wxt` (`pnpm zip:all`).
    - Publishes the generated `.zip` artifacts to all configured stores using `PlasmoHQ/bpp`.

## Manual Trigger (Emergency)

If the automatic submission fails or you need to retry without creating a new version:

1.  Go to the "Actions" tab in GitHub.
2.  Select the **"Submit to Web Store"** workflow.
3.  Click **"Run workflow"**.
4.  Select the `main` branch and click **"Run workflow"**.

## Local Testing & Troubleshooting

### Common Issues

1.  **"No extension artifacts found"**: The workflow uses `pnpm zip:all` to generate artifacts in `.output/`. Ensure this command works locally.
2.  **Authentication Errors**: Double-check your `SUBMIT_KEYS` secret in GitHub. Ensure tokens haven't expired (especially for Chrome, though the refresh token should handle it).
3.  **Version Conflicts**: If the version in `package.json` (managed by semantic-release) conflicts with a version already on the store (e.g., if you manually uploaded a version with the same number), the publish will fail. Always let semantic-release handle versioning.
