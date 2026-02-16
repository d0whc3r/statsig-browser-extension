import fs from 'node:fs'
import path from 'node:path'
import { publishExtension } from 'publish-browser-extension'

function findZipInRoot(outputDir, browser) {
  // 1. Check for files in .output/ that match naming convention (e.g. name-version-chrome.zip)
  const files = fs.readdirSync(outputDir).filter((file) => file.endsWith('.zip'))
  // Look for file containing browser name (case insensitive)
  const matchingFile = files.find((file) => file.toLowerCase().includes(browser))
  if (matchingFile) {
    console.log(`Found ${browser} zip: ${path.join(outputDir, matchingFile)}`)
    return path.join(outputDir, matchingFile)
  }
  return null
}

function findZipInSubdirs(outputDir, browser) {
  // 2. Check for subdirectories (e.g. .output/chrome-mv3/*.zip)
  const items = fs.readdirSync(outputDir)
  // Find directory starting with browser name (e.g. chrome-mv3, firefox-mv2)
  const dirs = items.filter((dirName) => dirName.toLowerCase().startsWith(`${browser}-`))

  for (const dir of dirs) {
    const targetDir = path.join(outputDir, dir)
    if (fs.statSync(targetDir).isDirectory()) {
      const nestedFiles = fs.readdirSync(targetDir).filter((file) => file.endsWith('.zip'))
      if (nestedFiles.length > 0) {
        console.log(`Found ${browser} zip in subdir: ${path.join(targetDir, nestedFiles[0])}`)
        return path.join(targetDir, nestedFiles[0])
      }
    }
  }
  return null
}

function findZip(browser) {
  const outputDir = '.output'
  if (!fs.existsSync(outputDir)) {
    return null
  }

  return findZipInRoot(outputDir, browser) || findZipInSubdirs(outputDir, browser)
}

console.log('Searching for extension artifacts...')

const chromeZip = findZip('chrome')
const firefoxZip = findZip('firefox')
const edgeZip = findZip('edge')

console.log('Found artifacts:', { chromeZip, edgeZip, firefoxZip })

if (!chromeZip && !firefoxZip && !edgeZip) {
  console.error('No extension artifacts found in .output/')
  // We don't exit with error here to allow partial success if some are missing but not all
  // But if ALL are missing, it's a problem.
  if (process.env.CI) {
    process.exit(1)
  }
}

try {
  const result = await publishExtension({
    chrome:
      chromeZip && process.env.CHROME_EXTENSION_ID
        ? {
            clientId: process.env.CHROME_CLIENT_ID,
            clientSecret: process.env.CHROME_CLIENT_SECRET,
            extensionId: process.env.CHROME_EXTENSION_ID,
            refreshToken: process.env.CHROME_REFRESH_TOKEN,
            zip: chromeZip,
          }
        : undefined,
    dryRun: process.env.DRY_RUN === 'true',
    edge:
      edgeZip && process.env.EDGE_PRODUCT_ID
        ? {
            apiKey: process.env.EDGE_API_KEY,
            clientId: process.env.EDGE_CLIENT_ID,
            productId: process.env.EDGE_PRODUCT_ID,
            zip: edgeZip,
          }
        : undefined,
    firefox:
      firefoxZip && process.env.FIREFOX_EXTENSION_ID
        ? {
            extensionId: process.env.FIREFOX_EXTENSION_ID,
            jwtIssuer: process.env.FIREFOX_JWT_ISSUER,
            jwtSecret: process.env.FIREFOX_JWT_SECRET,
            zip: firefoxZip,
          }
        : undefined,
  })

  console.log('Publish result:', result)
} catch (error) {
  console.error('Publish failed:', error)
  process.exit(1)
}
