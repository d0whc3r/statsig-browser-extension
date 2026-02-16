import type { UserManifest } from 'wxt'

import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
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
    name: 'Statsig Browser Extension',
    permissions: ['storage', 'scripting', 'activeTab'],
  } as UserManifest,
  modules: ['@wxt-dev/module-react'],
})
