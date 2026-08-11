import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
// Pins the CRX id so the extension origin (chrome-extension://<id>) stays stable across rebuilds.
// Public half of the signing keypair — not a secret.
const CRX_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuEhfW2Y3y8I5UZJoO62oxQixOvkdZphdhHyjSfOo0LHI+G4feTt6mkY9b+GnZM2LzyWi/53213eFqiAxonYz64uvLomh+y9QgO6V9+4yVBnr1d16AICUe2UnQ71uKD1BBEoVbLVaZdYW4obML/mb9Txmv/jpK4QxWkCUWntRvKV7I5BrJaujhvX7RxtpLNyOEKXkkuWs3FWNjytWc/KAIZgsQvlXv766F1Gx+bNoTU97mxkUQWW0vPe+2FJLRPN7Vm8nP0GuWpWJ8zlxdXEtrmXiWKSB7LO6yxSsSDmZmD0Z1eQNhi92DkXpWmvNTyGMx+c4BEzC1DzWldvbYRLpYQIDAQAB'

export default defineConfig({
  manifest: ({ browser }) => ({
    action: {
      default_icon: {
        '128': 'icon/128.png',
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
      },
      default_title: 'Statsig Browser Extension',
    },
    browser_specific_settings: {
      gecko: {
        data_collection_permissions: {
          required: ['none'],
        },
        id: 'statsig-browser-extension@statsig.com',
      },
    },
    description:
      'Manage Statsig feature gates and experiments directly from your browser. View user details, override gates, and debug efficiently.',
    host_permissions: ['<all_urls>', 'https://statsigapi.net/*'],
    icons: {
      '128': 'icon/128.png',
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
    },
    // Chromium-only: AMO rejects `key` as an unknown manifest field.
    ...(browser === 'firefox' ? {} : { key: CRX_PUBLIC_KEY }),
    name: 'Statsig Browser Extension',
    permissions: ['storage', 'scripting', 'activeTab'],
  }),
  modules: ['@wxt-dev/module-react'],
})
