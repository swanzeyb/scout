import normalizeUrl from 'normalize-url'
import extractTextBlocks from 'ocr-image'
import { debounce } from 'debounce'

const EVAL_DEBOUNCE_DELAY = 1600

function translateUrl(url) {
  switch(url) {
    case 'start': return 'about:blank'
    default: return url
  }
}

function targetToPoint(target, context) {
  const location = context
    .findIndex(block => block.text.includes(target))
  console.log('CLICK HERE', location, context[location]?.center)
  if (location === -1) {
    throw new Error('Target not found in context')
  } else {
    return context[location].center
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
    'type': (text) => page.keyboard.type(text, { delay: 100 })
  }
}

async function createParsers(context) {
  return {
    'goto': (url) => translateUrl(url),
    'click': (target) => targetToPoint(target, context),
  }
}

function parseQuery(query) {
  const [method] = query.split(' ')
  const payload = query.slice(method.length + 1)
  return [method, payload]
}

async function executeSteps(page, steps) {
  const methods = await createMethods(page)
  const parsers = await createParsers(page)

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

export function playStrategy(contextMap, page) {
  return new Promise(async (resolve, reject) => {
    let context:any = []

    const evalContext = debounce(async () => {
      context = await wordBlocks(page)
      const keywords = Object.keys(contextMap)
  
      let executed = false
      for (let i = 1; i < keywords.length; i++) {
        const keyword = keywords[i]
        const hasKeyword = context.some(block => (
          block.text.includes(keyword)
        ))
  
        if (hasKeyword) {
          executed = true
          executeSteps(page, contextMap[keyword])
            .catch(reject)
        }
      }
  
      if (!executed) {
        console.log('No strategy found to play in this context')
        resolve(null)
      }
    }, EVAL_DEBOUNCE_DELAY)
  
    page.on('framenavigated', evalContext)
    executeSteps(page, contextMap['inital'])
      .catch(reject)
  })
}
