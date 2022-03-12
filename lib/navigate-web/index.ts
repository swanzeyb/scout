import { createStrategy, wordBlocks } from './strategy'
import { createSession } from './browser'
import { playStrategy } from './strategy'
import { debounce } from 'debounce'

const EVAL_DEBOUNCE_DELAY = 2000

const root = 'https://facebook.com/marketplace'

const contextMap = {
  'inital': createStrategy(root, [
    'goto root'
  ]),
  'Log In': createStrategy(root, [
    'click Log In'
  ])
}

async function fetchInfo() {
  const page = await createSession()
  let context:any = []

  const evalContext = debounce(async () => {
    console.log('eval context')
    context = await wordBlocks(page)
    const keywords = Object.keys(contextMap)

    for (let i = 1; i < keywords.length; i++) {
      const keyword = keywords[i]
      const hasKeyword = context.some(block => (
        block.text.includes(keyword)
      ))
      console.log('has keyword?', hasKeyword)
      if (hasKeyword) {
        const nextStrategy = contextMap[keyword]
        return await playStrategy(page, context, nextStrategy)
      }
    }
  }, EVAL_DEBOUNCE_DELAY)

  page.on('framenavigated', evalContext)
  await playStrategy(page, context, contextMap['inital'])
}

fetchInfo()
