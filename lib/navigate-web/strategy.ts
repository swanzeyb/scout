import normalizeUrl from 'normalize-url'
import extractTextBlocks from 'ocr-image'
import { createSession } from './browser'
import { debounce } from 'debounce'
import { writeFileSync } from 'fs'

const NAV_DEBOUNCE_DELAY = 600

enum PlayType {
  Sequential,
  Seek,
}

function translateUrl(url, root) {
  switch(url) {
    case 'start': return 'about:blank'
    case 'root': return root
    default: return `${root}/${url}`
  }
}

export async function wordBlocks(page) {
  const screenImg = await page.screenshot()
  const words = await extractTextBlocks(screenImg)
  return words
}

async function createMethods(page) {
  return {
    'goto': (url) => page.goto(url),
    'click': (point) => page.mouse.click(point[0], point[1]),
  }
}

async function createParsers(page, root, context) {
  return {
    'goto': (url) => translateUrl(url, root),
    'click': (target) => {
      const resultIndex = blocks
        .findIndex(block => block.text.includes(target))
      return blocks[resultIndex].center
    },
  }
}

function parseQuery(query) {
  const [method] = query.split(' ')
  const payload = query.slice(method.length + 1)
  return [method, payload]
}

async function executeSteps(page, context, instruction) {
  const { root, steps } = instruction
  const methods = await createMethods(page)
  const parsers = await createParsers(page, root, context)

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const [method, payload] = parseQuery(step)
    const action = methods[method]
    const parser = parsers[method]
    const data = parser ? parser(payload) : payload

    try {
      await action(data)
    } catch (err) {
      console.error('Failed to execute strategy step', err.message)
    }
  }
}

export async function playStrategy(page, strategy) {
  for (let i = 0; i < strategy.length; i++) {
    const instruction = strategy[i];
    await page.waitForNetworkIdle()
    const context = await wordBlocks(page)
    console.log(context, 'context')
    await executeSteps(page, context, instruction)
    await page.waitForNetworkIdle()
  }
}

export function createStrategy(site, map) {
  const root = normalizeUrl(site)
  const routes = Object.keys(map)
  const steps = Object.values(map)

  return routes.map((route, i) => {
    return {
      root,
      url: translateUrl(route, root),
      steps: steps[i],
    }
  })
}
