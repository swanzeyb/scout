export { drawRects } from './utils'
export { createDB, set, get, has } from './database'

// import browser from './browser'
import android from './android'

export function includesText(text, keyword, then) {
  const hasKeyword = text
    .text(block => block.text.includes(keyword))
  if (hasKeyword) return then()
}

export enum Environment {
  BROWSER,
  ANDROID,
}

export function start(type: Environment, App) {
  switch (type) {
    // case Environment.BROWSER: return browser(App)
    case Environment.ANDROID: return android(App)
    default:
      throw new Error('Invalid strategy environment argument')
  }
}
