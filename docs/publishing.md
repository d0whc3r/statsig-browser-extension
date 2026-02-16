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
    "jwtIssuer": "your-jwt-issuer",
    "jwtSecret": "your-jwt-secret"
  },
  "edge": {
    "productId": "your-product-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret"
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
3.  **CI/CD**: The workflow will:
    - Install dependencies.
    - Lint and Test.
    - Determine the next version based on commits.
    - Update `package.json` and `CHANGELOG.md`.
    - Build the extension for all browsers using `wxt`.
    - Zip the artifacts.

- Publish the zips to Chrome, Firefox, and Edge stores.
- Create a GitHub Release with the zips attached.

## Local Testing & Troubleshooting

### Dry Run

You can simulate a publishing run without actually uploading to stores by setting the `DRY_RUN` environment variable to `true`.

```bash
# Build the extension first
pnpm zip:all

# Run the publish script in dry-run mode
DRY_RUN=true node scripts/publish-extensions.mjs
```

This will attempt to locate the artifacts and print what would happen, but will not make API calls to the stores.

### Common Issues

1.  **"No extension artifacts found"**: Ensure you have run `pnpm zip:all` before running the publish script. The script looks for `.zip` files in `.output/` or its subdirectories.
2.  **Authentication Errors**: Double-check your environment variables. Ensure tokens haven't expired (especially for Chrome, though the refresh token should handle it).
3.  **Version Conflicts**: If the version in `package.json` (managed by semantic-release) conflicts with a version already on the store (e.g., if you manually uploaded a version with the same number), the publish will fail. Always let semantic-release handle versioning.
