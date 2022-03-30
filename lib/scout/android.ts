import Adb, { DeviceClient } from '@devicefarmer/adbkit'
import { Buffer } from 'buffer'
import { streamToBuffer, wait } from './utils'
import extractTextBlocks from 'ocr-image'
import isEqual from 'lodash/isEqual'
import { executeSteps as doSteps, targetToPoint } from './strategy'

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
export async function* textContext(device: Device, resolution, delay) {
  const last = {
    cap: Buffer.alloc(0),
    texts: [],
  }

  while (true) {
    console.time('Eval Loop')
    await wait(delay)
    const cap = await device.screencap()
      .then(streamToBuffer)

    if (Buffer.compare(last.cap, cap) !== 0) {
      last.cap = cap
      const texts = await extractTextBlocks(cap, resolution)
      if (!isEqual(last.texts, texts)) {
        last.texts = texts
        yield texts
      } 
    }

    console.timeEnd('Eval Loop')
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
  @ Context Evaluation Loop
*/
const EVAL_LOOP_DELAY = 1000 * 1

export default async function android(App) {
  const devices = await adb.listDevices()
  
  if (devices.length < 1)
    throw new Error('No Android devices found')

  const deviceId = devices[0].id
  const device = new Device(adb.getDevice(deviceId), deviceId)
  const resolution = await device.getResolution()
  const textReport = textContext(device, resolution, EVAL_LOOP_DELAY)

  // On Mount
  await App({ device, text: [], executeSteps, executeStrategy })

  // On Update
  for await (const text of textReport) {
    console.log('OCR Output', text.map(block => block?.text))
    const finished = await App({ device, text, executeSteps, executeStrategy })
    if (finished) break
  }

  console.log('Cycle Finished')
}
