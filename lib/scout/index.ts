// import browser from './browser'
import android from './android'

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
