// import browser from './browser'
import { session as androidSession } from './android'

export function includesText(text, keyword, then) {
  const hasKeyword = text
    .text(block => block.text.includes(keyword))
  if (hasKeyword) return then()
}

export enum Env {
  BROWSER,
  ANDROID,
}

export function createSession(type: Env) {
  switch (type) {
    // case Environment.BROWSER: return browser(App)
    case Env.ANDROID: return androidSession()
    default:
      throw new Error('Invalid session environment argument')
  }
}

/*
  @ Experimential JSX support
*/
export async function begin({ func, attrs, children }) {
  await func(attrs)
  for (const [_, child] of children.entries()) {
    // await begin(child)
  }
}

function tagMap(tag) {
  switch (tag) {
    case 'schedule': return
    case 'perform':  return
    case 'activity': return
    case 'text':     return
    case 'tap':      return
    default:
      console.error('Syntax Error')
  }
}

export default {
  createElement(tag, attrs, ...children) {
    const func = tagMap(tag)
    return { func, attrs: { ...attrs, children } }
  }
}
