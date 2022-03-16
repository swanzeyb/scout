import { createBrowser, createConfig } from './browser'
import { playStrategy } from './strategy'

// When text is in context, do these steps
export function when(text, steps) {
  return {
    text,
    steps,
  }
}

function transform(plan) {
  const app = {}
  plan.forEach(part => {
    const { text, steps } = part
    app[text] = steps
  })
  return app
}

export async function play(App) {
  const config = createConfig('lily-horner')
  const { page } = await createBrowser(config)
  const app = App()
  const plan = transform(app)
  await playStrategy(plan, page)
}
