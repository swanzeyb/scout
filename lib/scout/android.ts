import Adb, { DeviceClient } from '@devicefarmer/adbkit'
import { Buffer } from 'buffer'
import FormData from 'form-data'
import { executeSteps as doSteps, targetToPoint } from './strategy'
import { getEnv, streamToBuffer, wait } from './utils'
import { EventEmitter } from 'events'

const TEXT_API_URI = getEnv('TEXT_API_URI')
const EVAL_LOOP_DELAY = Number(getEnv('EVAL_LOOP_DELAY'))

/*
  @ Android ADB Creation
*/
const adb = Adb.createClient()

export class Device extends DeviceClient {
  public resolution

  constructor(client, serial) {
    super(client, serial)
    this.getResolution().then(res => {
      this.resolution = res
    })
  }

  getResolution() {
    return this.shell('wm size')
      .then(streamToBuffer)
      .then(buff => buff.toString('utf8'))
      .then(result => {
        const [width, height] = result
          .trim()
          .slice(result.indexOf(': ') + 2).split('x')
        return {
          width: Number(width),
          height: Number(height)
        }
      })
  }

  getActivity() {
    return this.shell('dumpsys window windows')
      .then(streamToBuffer)
      .then(buff => buff.toString('utf8'))
      .then(res => (res.match(/(?<=net.|com.).+(?=\/)/g) || [])[0])
  }

  isInteractive() {
    return this.shell('dumpsys input_method | grep mInteractive')
      .then(streamToBuffer)
      .then(buff => buff.toString('utf8'))
      .then(result => {
        const is = result.slice(result.indexOf('mInteractive')+13).trim()
        return is === 'true'
      })
  }

  togglePower() {
    return this.shell('input keyevent 26')
  }

  tap(x, y) {
    return this.shell(`input tap ${x} ${y}`)
  }

  swipe(x1, y1, x2, y2) {
    return this.shell(`input touchscreen swipe ${x1} ${y1} ${x2} ${y2}`)
  }

  goBack() {
    const x = (this.resolution.width / 3) - 20
    const y = this.resolution.height - 20
    return this.tap(x, y)
  }

  goHome() {
    const x = this.resolution.width / 2
    const y = this.resolution.height - 20
    return this.tap(x, y)
  }

  openTasker() {
    const x = this.resolution.width - ((this.resolution.width / 3) + 20)
    const y = this.resolution.height - 20
    return this.tap(x, y)
  }
}

/*
  @ Context Report Generators
*/
export function extractTextBlocks(image, viewport): Promise<any> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('image', image)
    form.append('viewport', JSON.stringify(viewport))
    form.submit(TEXT_API_URI, (err, response) => {
      if (err) return reject(err)
      response.once('data', buffer => {
        const str = buffer.toString('utf8')
        if (str === 'Internal Server Error')
          reject('OCR API returned an internal error')
        const json = JSON.parse(str)['text']
        resolve(json)
      })
    })
  })
}

export async function* textContext(device: Device, resolution, delay) {
  const last = {
    cap: Buffer.alloc(0),
    texts: [],
  }

  while (true) {
    // console.time('Eval Loop')
    await wait(delay)
    const cap = await device.screencap()
      .then(streamToBuffer)

    if (Buffer.compare(last.cap, cap) !== 0) {
      last.cap = cap
      const texts: any = await extractTextBlocks(cap, resolution)
      last.texts = texts
      yield texts
    } else {
      yield last.texts
    }

    // console.timeEnd('Eval Loop')
  }
}

/*
  @ Strategy Execution
*/
function pullDownRefresh(resolution) {
  const { width, height } = resolution
  return [width/2, height*0.2, width/2, height*0.8]
}

function createMethods(device) {
  return {
    'tap':               (pt) => device.tap(pt[0], pt[1]),
    'tap above':         (pt) => device.tap(pt[0], pt[1] + 20),
    'tap below':         (pt) => device.tap(pt[0], pt[1] - 20),
    'tap home':          () => device.goHome(),
    'tap back':          () => device.goBack(),
    'tap windows':       () => device.openTasker(),
    'pull down refresh': (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
    'wait':              (amt) => wait(amt),
  }
}

function createParsers(device, text) {
  return {
    'tap':               (target) => targetToPoint(target, text),
    'tap above':         (target) => targetToPoint(target, text),
    'tap below':         (target) => targetToPoint(target, text),
    'pull down refresh': () => pullDownRefresh(device.resolution),
    'wait':              (amount) => Number(amount),
  }
}

export async function executeStrategy(device, text, strategy) {
  const methods = createMethods(device)
  const parsers = createParsers(device, text)

  const keywords = Object.keys(strategy).entries()
  for (const [_, keyword] of keywords) {
    const hasKeyword = text
      .some(block => block.text.includes(keyword))
    if (hasKeyword) {
      const steps = strategy[keyword]
      await doSteps(steps, methods, parsers)
    }
  }
}

export async function executeSteps(device, text, steps) {
  const methods = createMethods(device)
  const parsers = createParsers(device, text)

  await doSteps(steps, methods, parsers)
}

/*
  @ Device Setup
*/
export async function session() {
  const devices = await adb.listDevices()
  
  if (devices.length < 1)
    throw new Error('No Android devices found')

  // For now, use first device found
  const deviceId = devices[0].id
  const device = new Device(adb.getDevice(deviceId), deviceId)
  const resolution = await device.getResolution()

  // Text on screen report generator
  const textReport = textContext(device, resolution, EVAL_LOOP_DELAY)

  // Setup event emitter for new text reported on screen
  const session = new EventEmitter()

  // Device actions
  let lastText = []
  const perform = (steps) => executeSteps(device, lastText, steps)

  // Monitor for text events
  const begin = async () => {
    for await (const text of textReport) {
      lastText = text
      session.emit('update', text)
    }
  }

  begin()
  return { device, perform, session }
}
