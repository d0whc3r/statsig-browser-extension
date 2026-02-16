# Permission Justifications

## activeTab

**Justification:**
This permission is required to allow the extension to interact with the current tab when the user clicks the extension icon. It is used to:

1.  Detect if the Statsig SDK is initialized on the current page.
2.  Inject scripts (`chrome.scripting.executeScript`) to retrieve the current Statsig user object (`statsig.getCurrentUser()`) and SDK state.
3.  Read and write local storage or cookies associated with Statsig configurations (e.g., overrides) specifically on the active page.
    The extension only accesses the tab's content when the user explicitly invokes it, ensuring privacy and minimal permission scope.

## Host Permissions

**Justification:**

1.  `<all_urls>`: The extension is designed to work on _any_ web application that uses the Statsig SDK. Since Statsig is a general-purpose feature flagging platform, our users (developers) implement it on their own domains. We cannot predict which domains will use it, so we need access to all URLs to inject the content scripts that detect the SDK and facilitate debugging features (like overrides and experiment forcing) on the developer's application.
2.  `https://statsigapi.net/*`: This specific host permission is required to communicate with the Statsig API for:
    - Fetching current project configurations (gates, experiments, dynamic configs).
    - Applying overrides via the Statsig Console API (using the user's provided API key).
    - Validating API keys.

## Remote Code

**Are you using remote code?**
**No.**

**Justification/Clarification:**
The extension does **NOT** load, execute, or interpret any code hosted remotely (e.g., via CDN, external servers, or eval() of fetched strings).
All scripts executed by the extension (including those injected via `chrome.scripting.executeScript`) are fully bundled within the extension package itself (`storage-helper.js` and content scripts).
The use of `chrome.scripting` is strictly limited to injecting these _local_, _bundled_ resources into the page context to interact with the page's DOM and `window` object (specifically to access `window.statsig`). No external JavaScript is ever retrieved or executed.

## Scripting

**Justification:**
The `scripting` permission is essential for the core functionality of the extension. It is used to:

1.  Inject the `storage-helper.js` script into the active tab's context. This allows the extension to read and write the local storage/cookies that the Statsig SDK uses to store override values.
2.  Inject functions to retrieve the current Statsig user details (`getUserDetailsFromPage`) from the page's global scope.
    Without this permission, the extension cannot interact with the Statsig SDK running on the user's page to provide debugging capabilities.

## Storage

**Justification:**
The `storage` permission (`chrome.storage.local`) is used to persist:

1.  **User Settings**: The Statsig Console API Key provided by the user.
2.  **Extension State**: Caching fetched configurations (gates/experiments) to improve performance and reduce API calls.
3.  **Preferences**: UI preferences like the last active tab in the extension popup.
    This data is stored locally on the user's device and is never shared externally except when making authenticated requests to the Statsig API (using the stored API key).

## Single Purpose Description

**Description:**
A developer tool that allows Statsig users to debug feature gates, force experiment variations, and inspect dynamic configurations directly within their web applications by interacting with the Statsig SDK and API.

## Data Usage Policy Certification

**Certification:**
I certify that this extension only collects and uses data strictly necessary for its stated purpose (debugging Statsig SDK implementations).

- **Statsig API Key**: Stored locally and used only to authenticate requests to the Statsig API on behalf of the user.
- **Page Data**: The extension reads the `window.statsig` object and specific local storage keys related to Statsig. It does not collect browsing history, personal data, or unrelated page content.
- **Data Transmission**: Data is only transmitted to `statsigapi.net` (the official Statsig API) to perform the requested debugging actions. No data is sent to third-party servers or tracking services.
