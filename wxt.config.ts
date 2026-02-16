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
  },
  modules: ['@wxt-dev/module-react'],
})
