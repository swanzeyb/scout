import { createStrategy, wordBlocks } from './strategy'
import { createSession } from './browser'
import { playStrategy } from './strategy'
import { debounce } from 'debounce'

const EVAL_DEBOUNCE_DELAY = 1600
const root = 'https://facebook.com/marketplace'

const name = 'Jeanie Beus'
const username = ''
const password = ''

const contextMap = {
  'inital': createStrategy(root, [
    'goto root'
  ]),
  'must log in': createStrategy(root, [
    'click Mobile number',
    `type ${username}`,
    'click Password',
    `type ${password}`,
    'click Log In',
  ]),
  'Choose Your Account': createStrategy(root, [
    `click ${name.split(' ')[0]}`
  ]),
  'Password': createStrategy(root, [
    'click Password',
    `type ${password}`,
    'click Log In',
  ]),
  'Save your password': createStrategy(root, [
    'click Not now'
  ])
}

async function fetchInfo() {
  const page = await createSession()
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
        const nextStrategy = contextMap[keyword]
        await playStrategy(page, context, nextStrategy)
      }
    }

    if (!executed) {
      console.log('No strategy found to play in this context')
    }
  }, EVAL_DEBOUNCE_DELAY)

  page.on('framenavigated', evalContext)
  await playStrategy(page, context, contextMap['inital'])
}

fetchInfo()
