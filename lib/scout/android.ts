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
  }

  getResolution() {
    return this.shell('wm size')
      .then(streamToBuffer)
      .then(buff => buff.toString('utf8'))
      .then(result => {
        const [width, height] = result
          .trim()
          .slice(result.indexOf(': ') + 2).split('x')
        this.resolution = {
          width: Number(width),
          height: Number(height)
        }
        return this.resolution
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

  type(text) {
    return this.shell(`input text "${text}"`)
      .then(stream => {
        stream.on('data', data => console.log('DATA YO', data))
      })
  }

  openApp(bundleID) {
    console.log('open bundle', bundleID)
    return this.shell(`monkey -p ${bundleID} -c android.intent.category.LAUNCHER 1`)
  }

  closeApp(bundleID) {
    return this.shell(`am force-stop ${bundleID}`)
  }

  keycode(code) {
    return this.shell(`input keyevent ${code}`)
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
const android = {
  refresh: ({ width, height }) => [width/2, height*0.14, width/2, height*0.5],
  scrollDown: ({ width, height }) => [width/2, height*0.7, width/2, height*0.35], // Meaning, see content further down
  scrollUp: ({ width, height }) => [width/2, height*0.35, width/2, height*0.7], // Meaning, see content further up
  tapVertical: (target, text, direction) => {
    const location = text
      .findIndex(block => block.text.includes(target))
    if (location === -1) {
      const msg = `Target: ${target} not found in context`
      throw new Error(msg)
    } else {
      const block = text[location]
      return direction === -1
        ? [block.left + 10, block.top + block.height + 120]
        : [block.left + 10, block.top - 120]
    }
  },
}

const chrome = {
  searchBar: ({ width, height }) => [width / 2, 124],
}

function createMethods(device) {
  return {
    'tap':               (pt) => device.tap(pt[0], pt[1]),
    'tap above':         (pt) => device.tap(pt[0], pt[1] + 20),
    'tap below':         (pt) => device.tap(pt[0], pt[1] - 20),
    'tap home':          () => device.goHome(),
    'tap back':          () => device.goBack(),
    'tap windows':       () => device.openTasker(),
    'Chrome search':     (pt) => device.tap(pt[0], pt[1]),
    'pull down refresh': (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
    'scroll down':       (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
    'scroll up':         (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
    'type':              (txt) => device.type(txt),
    'wait':              (amt) => wait(amt),
    'enter':             (code) => device.keycode(code),
    'open':              (app) => device.openApp(app),
    'close':             (app) => device.closeApp(app),
  }
}

function createParsers(device, text) {
  return {
    'tap':               (target) => targetToPoint(target, text),
    'tap above':         (target) => android.tapVertical(target, text, 1),
    'tap below':         (target) => android.tapVertical(target, text, -1),
    'Chrome search':     () => chrome.searchBar(device.resolution),
    'pull down refresh': () => android.refresh(device.resolution),
    'scroll down':       () => android.scrollDown(device.resolution),
    'scroll up':         () => android.scrollUp(device.resolution),
    'wait':              (amount) => Number(amount),
    'enter':             () => 66,
  }
}

export async function executeSteps(device, text, steps) {
  const methods = createMethods(device)
  const parsers = createParsers(device, text)

  const actions = typeof steps === 'string' ? [steps] : steps
  await doSteps(actions, methods, parsers)
}

class Session extends EventEmitter {
  public textBlocks
  private blocksReporter
  private device

  constructor(blocksReporter, device) {
    super()
    this.blocksReporter = blocksReporter
    this.device = device
  }

  async start() {
    for await (const textBlocks of this.blocksReporter) {
      this.textBlocks = textBlocks
      this.emit('update', textBlocks)
    }
  }

  waitOneCycle() {
    return new Promise(resolve => {
      this.once('update', () => {
        resolve(null)
      })
    })
  }

  stopExecution() {
    this.emit('cancel')
  }

  perform(steps) {
    return executeSteps(this.device, this.textBlocks, steps)
  }

  repeatUntilText(text, repeat, timeout=60000) {
    let start = Date.now()
    let stop = false
    return new Promise((resolve, reject) => {
      const hasTextYet = async (blocks) => {
        if (blocks.some(block => block.text.includes(text)) || stop) {
          this.removeListener('update', hasTextYet)
          await this.waitOneCycle()
          resolve(null)
        } else if (Date.now() - start > timeout) {
          reject('Operation Timeout')
        } else {
          repeat()
        }
      }
      this.on('update', hasTextYet)
      this.once('cancel', () => {
        stop = true
      })
    })
  }

  waitForText(text) {
    return this.repeatUntilText(text, () => null)
  }

  scrollDownToText(text) {
    return this.repeatUntilText(text, async () => {
      await this.perform(['wait 200', 'scroll down', 'wait 200'])
    })
  }
}

/*
  @ Device Setup
*/
export async function session(id) {
  const devices = await adb.listDevices()
  
  if (devices.length < 1)
    throw new Error('No Android devices found')

  if (!devices.some(device => device.id === id))
    throw new Error(`Android Device ID '${id}' not found`)

  // For now, use first device found
  const deviceId = devices[0].id
  const device = new Device(adb.getDevice(deviceId), deviceId)
  const resolution = await device.getResolution()

  // Text on screen report generator
  const textBlocks = textContext(device, resolution, EVAL_LOOP_DELAY)

  // Start getting text off screen of device
  const session = new Session(textBlocks, device)
  session.start()

  return { device, session }
}
