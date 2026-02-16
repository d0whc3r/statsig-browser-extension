# Publishing Guide

This project uses `semantic-release` to automatically publish new versions of the extension to the Chrome Web Store, Firefox Add-ons (AMO), and Microsoft Edge Add-ons.

## Prerequisites

Before setting up the automation, ensure you have:

1.  Created developer accounts for all stores.
2.  Uploaded the initial version of the extension manually to each store at least once. This is required to generate the necessary IDs and to pass initial review.

## Environment Variables

The following environment variables must be set in your CI/CD environment (e.g., GitHub Secrets).

### Chrome Web Store

1.  **Extension ID (`CHROME_EXTENSION_ID`)**: Found in the Chrome Web Store URL of your extension (e.g., `https://chrome.google.com/webstore/detail/.../EXTENSION_ID`).
2.  **Client ID (`CHROME_CLIENT_ID`)**, **Client Secret (`CHROME_CLIENT_SECRET`)**, **Refresh Token (`CHROME_REFRESH_TOKEN`)**:
    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a project.
    - Enable the **Chrome Web Store API**.
    - Configure the OAuth consent screen (Internal or External).
    - Create credentials -> OAuth client ID (Desktop app).
    - Use the `clientId` and `clientSecret` to obtain a `refreshToken`. You can use a tool like [chrome-webstore-upload-cli](https://github.com/DrewML/chrome-webstore-upload-cli) or follow the [official guide](https://developer.chrome.com/docs/webstore/using_webstore_api/#before_you_begin) to generate the token.

### Firefox Add-ons (AMO)

1.  **Extension ID (`FIREFOX_EXTENSION_ID`)**: The UUID of your extension (e.g., `{uuid}`). You can find this in the Developer Hub after your first submission.
2.  **JWT Issuer (`FIREFOX_JWT_ISSUER`)** and **JWT Secret (`FIREFOX_JWT_SECRET`)**:
    - Log in to the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).
    - Go to **Settings** -> **Manage API Keys**.
    - Generate a new set of credentials. The "JWT issuer" is your Issuer string, and the "JWT secret" is your Secret string.

### Microsoft Edge Add-ons

1.  **Product ID (`EDGE_PRODUCT_ID`)**: The Store ID of your extension found in the [Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview).
2.  **Client ID (`EDGE_CLIENT_ID`)** and **API Key (`EDGE_API_KEY`)**:
    - Go to **Partner Center** -> **Microsoft Edge** -> **Settings** -> **Developer settings**.
    - Under "Associating Azure Active Directory with your Partner Center account", ensure you have linked an AD tenant.
    - Create a new client secret (API Key) and copy the Client ID and Secret (API Key).

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
