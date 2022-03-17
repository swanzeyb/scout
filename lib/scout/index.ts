import { createBrowser, createConfig, textContext } from './browser'
import { executeSteps } from './strategy'

const EVAL_LOOP_DELAY = 1000

const effects: any = new Set()

function useEffect(effect) {
  effects.add(effect)
}

export function useStart(then) {
  useEffect(async ({ page, texts }) => {
    await executeSteps(page, then, texts)
  })
}

export function useTexts(has, then) {
  useEffect(async ({ page, texts }) => {
    console.log('args', page, texts)
    const hasKeyword = texts.some(block => (
      block.text.includes(has)
    ))
    if (hasKeyword) {
      await executeSteps(page, then, texts)
    }
  })
}

export async function start(App) {
  const config = createConfig('lily-horner')
  const { page } = await createBrowser(config)
  const evalTexts = textContext(page, EVAL_LOOP_DELAY)

  // Initialize App Root
  App()

  // On Mount
  for (const effect of effects) {
    await effect({ page, texts: [] })
  }
  
  // On Update
  for await (const texts of evalTexts) {
    for (const effect of effects) {
      await effect({
        page,
        texts,
      })
    }
    console.log('texts', texts.length)
  }

  console.log('Done')
}
