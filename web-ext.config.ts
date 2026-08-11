import { defineWebExtConfig } from 'wxt'

export default defineWebExtConfig({
  chromiumArgs: ['--disable-blink-features=AutomationControlled'],
  chromiumProfile: '.dev-profile',
  firefoxProfile: '.dev-profile-ff',
  keepProfileChanges: true,
  startUrls: ['https://cloud.qdrant.io'],
})
