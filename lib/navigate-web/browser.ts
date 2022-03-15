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

export function createPersona() {
  return {
    // proxy: {
    //   ip: 'x.x.x.x',
    //   port: '3000',
    // },
    name: {
      first: '',
      last: '',
    },
    email: '',
    username: '',
    password: '',
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
    userAgent: 'Mozilla/5.0 (Linux; Android 11; BE2026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36',
  }
}

const persona = createPersona()

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
  `--user-agent=${persona.userAgent}`,
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
  page.setDefaultTimeout(DEFAULT_TIMEOUT)
  await page.setRequestInterception(true)

  page.on('request', request => {
    const headers = request.headers()
    const keys = Object.keys(headers)
    const toOverride = Object.keys(persona.hints)

    const override = {}
    keys.forEach(key => {
      if (toOverride.includes(key)) {
        override[key] = persona.hints[key]
      }
    })
    console.log('SETTING', {
      headers: {
        ...headers,
        ...override,
      },
    })
    request.continue({
      headers: {
        ...headers,
        ...override,
      },
    })
  })

  page.on('requestfinished', request => {
    const headers = request.headers()
    if (Object.keys(headers).includes('sec-ch')) {
      console.log(request.headers())
    }
  })

  return { page, browser }
}
