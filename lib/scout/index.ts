// import browser from './browser'
import androidLoop, { android } from './android'
import { define, every } from './agenda'

export function includesText(text, keyword, then) {
  const hasKeyword = text
    .text(block => block.text.includes(keyword))
  if (hasKeyword) return then()
}

export enum Env {
  BROWSER,
  ANDROID,
}

// This function evalutes the screen at a set interval
export function start(type: Env, App, when) {
  switch (type) {
    // case Environment.BROWSER: return browser(App)
    case Env.ANDROID: return androidLoop(App)
    default:
      throw new Error('Invalid strategy environment argument')
  }
}

export async function schedule(when, what, App) {
  await define(what, async () => {
    console.log('RUN APP')
    await android(App)
  })
  await every(when, what)
  console.log('SCHEDULED')
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
