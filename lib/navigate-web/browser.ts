import puppeteer from 'puppeteer'

const DEFAULT_TIMEOUT = 1000 * 60 * 5

const LOCAL_PATH = {
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}

const userDataDir = './profiles/debug'
const viewPort = {
  width: 375,
  height: 667,
  deviceScaleFactor: 4,
}
const userAgent = `Mozilla/5.0 (Linux; Android 11; BE2026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36`

const args = [
  // Required for Docker:
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  // Mobile args:
  '--use-mobile-user-agent',
  '--top-controls-show-threshold=0.5',
  '--top-controls-hide-threshold=0.5 ',
  '--use-mobile-user-agent',
  '--enable-viewport',
  '--validate-input-event-stream',
  '--enable-longpress-drag-selection',
  '--touch-selection-strategy=direction',
  '--main-frame-resizes-are-orientation-changes',
  '--disable-composited-antialiasing',
  '--enable-dom-distiller',
  '--flag-switches-begin',
  '--flag-switches-end',
  '--origin-trial-disabled-features=ConditionalFocus',
  '--top-controls-show-threshold=0.5',
  '--top-controls-hide-threshold=0.5',
  // Misc:
  `--user-agent=${userAgent}`,
  `--window-size=${viewPort.width},${viewPort.height + 40}`,
]

const browserConfig = {
  defaultViewport: {
    isMobile: true,
    hasTouch: true,
    ...viewPort,
  },
  headless: false,
  userDataDir,
  args,
  ...LOCAL_PATH
}

export async function createSession() {
  const browser = await puppeteer.launch(browserConfig)
  const page = await browser.newPage()
  await page.setDefaultTimeout(DEFAULT_TIMEOUT)
  return page
}
