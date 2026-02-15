import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    action: {
      default_title: 'Statsig Browser Extension',
    },
    description:
      'Manage Statsig feature gates and experiments directly from your browser. View user details, override gates, and debug efficiently.',
    host_permissions: ['<all_urls>', 'https://statsigapi.net/*'],
    name: 'Statsig Browser Extension',
    permissions: ['storage', 'tabs', 'scripting', 'activeTab'],
    version: '1.0.1',
  },
  modules: ['@wxt-dev/module-react'],
})
