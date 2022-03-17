import { Buffer } from 'buffer'
import puppeteer from 'puppeteer'
import extractTextBlocks from 'ocr-image'
import { wait } from './utils'

const DEFAULT_TIMEOUT = 1000 * 60 * 5
const debug = false
const dataDirRoot = './profiles'
const viewPort = {
  width: 375,
  height: 667,
  deviceScaleFactor: 4,
}

export function createConfig(profileName) {
  const userAgent = 'Mozilla/5.0 (Linux; Android 11; BE2026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36'
  return {
    hints: {
      'sec-ch-ua':                   `" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"`,
      'sec-ch-ua-platform':          'Android',
      'sec-ch-ua-full-version':      '99.0.4844.58',
      'sec-ch-ua-platform-version':  '11.0.0',
      'sec-ch-prefers-color-scheme': 'light',
      'sec-ch-ua-mobile':            '?1',
      'sec-ch-ua-model':             'BE2026',
      'sec-ch-ua-arch':              '',
      'viewport-width':              `${viewPort.width}`,
      'device-memory':               '4',
      'downlink':                    '1.65',
      'ect':                         '4g',
      'rtt':                         '150',
      'dpr':                         '2.8125',
    },
    browser: {
      userDataDir: `${dataDirRoot}/${profileName}`,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
    args: [
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
      `--window-size=${viewPort.width},${viewPort.height + 40}`,
      `--user-agent=${userAgent}`,
    ],
  }
}

function overrideClientHints(request, hints) {
  const headers = request.headers()
  const keys = Object.keys(headers)
  const toOverride = Object.keys(hints)
  const override = {}
  keys.forEach(key => {
    if (toOverride.includes(key)) {
      override[key] = hints[key]
    }
  })
  request.continue({
    headers: {
      ...headers,
      ...override,
    },
  })
}

export async function createBrowser(config) {
  const browser = await puppeteer.launch({
    defaultViewport: {
      isMobile: true,
      hasTouch: true,
      ...viewPort,
    },
    headless: !debug,
    args: config.args,
    ...config.browser,
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(DEFAULT_TIMEOUT)
  await page.setRequestInterception(true)

  page.on('request', request => {
    overrideClientHints(request, config.hints)
  })

  return { page, browser }
}

export async function* textContext(page, evalDelay=0) {
  let done = false
  let last = Buffer.alloc(0)
  page.on('close', () => ( done = true ))

  try {
    while (!done) {
      const screenImg = await page.screenshot()
      if (Buffer.compare(last, screenImg) !== 0) {
        last = screenImg
        yield await extractTextBlocks(screenImg)
      } else {
        yield []
      }
      await wait(evalDelay)
    }
  } finally {
    return
  }
}
