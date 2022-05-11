// import browser from './browser'
import { session as androidSession } from './android'
export { Device, executeSteps } from './android'
export { wait } from './utils'

export function getEnv(key: string) {
  const result = process.env[key]
  if (!result) {
    const msg = `${key} missing from env`
    throw new Error(msg)
  }
  return result
}

export enum Env {
  BROWSER,
  ANDROID,
}

export function createSession(type: Env, id) {
  switch (type) {
    // case Environment.BROWSER: return browser(App)
    case Env.ANDROID: return androidSession(id)
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
