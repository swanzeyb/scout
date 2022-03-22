export { createIdentity } from './identity'

import { createBrowser, createConfig, textContext } from './browser'
import { executeSteps } from './strategy'
import { createIdentity } from './identity'
import { wait } from './utils'

const EVAL_LOOP_DELAY = 1000 * 1

const mount: any = new Set()
const update: any = new Set()

export function useStart(then) {
  mount.add(async ({ page, texts }) => {
    await executeSteps(page, then, texts)
  })
}

export function useTexts(has, then) {
  update.add(async ({ page, texts }) => {
    const hasKeyword = texts.some(block => (
      block.text.includes(has)
    ))
    if (hasKeyword) {
      await executeSteps(page, then, texts)
    }
  })
}

export async function startAndroid(App) {
  const config = createConfig('lily-horner')
  const { device } = createIdentity()

  config.hints['sec-ch-ua-platform'] = device.platform
  config.hints['sec-ch-ua-platform-version'] = device.platformVersion
  config.hints['sec-ch-ua-model'] = device.model
  config.hints['device-memory'] = device.memory

  const { page } = await createBrowser(config)
  const evalTexts = textContext(page, EVAL_LOOP_DELAY)

  // Initialize App Root
  App()

  // On Mount
  for (const effect of mount) {
    await effect({ page, texts: [] })
  }
  
  // On Update
  for await (const texts of evalTexts) {
    console.log('Begin Eval Iteration', texts.map(block => block.text))
    for (const effect of update) {
      await effect({
        page,
        texts,
      })
    }
    await wait(10000)
  }

  console.log('Done')
}

export async function start(App) {
  const config = createConfig('lily-horner')
  const { device } = createIdentity()

  config.hints['sec-ch-ua-platform'] = device.platform
  config.hints['sec-ch-ua-platform-version'] = device.platformVersion
  config.hints['sec-ch-ua-model'] = device.model
  config.hints['device-memory'] = device.memory

  const { page } = await createBrowser(config)
  const evalTexts = textContext(page, EVAL_LOOP_DELAY)

  // Initialize App Root
  App()

  // On Mount
  for (const effect of mount) {
    await effect({ page, texts: [] })
  }
  
  // On Update
  for await (const texts of evalTexts) {
    console.log('Begin Eval Iteration', texts.map(block => block.text))
    for (const effect of update) {
      await effect({
        page,
        texts,
      })
    }
    await wait(10000)
  }

  console.log('Done')
}
