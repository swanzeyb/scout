// import browser from './browser'
import android from './android'

export function includesText(text, keyword, then) {
  const hasKeyword = text
    .text(block => block.text.includes(keyword))
  if (hasKeyword) return then()
}

export enum Env {
  BROWSER,
  ANDROID,
}

export function start(type: Env, App) {
  switch (type) {
    // case Environment.BROWSER: return browser(App)
    case Env.ANDROID: return android(App)
    default:
      throw new Error('Invalid strategy environment argument')
  }
}

export default {
  createElement(tag, attrs, ...children) {
    console.log('createElement', tag, attrs, children)
  }
}
