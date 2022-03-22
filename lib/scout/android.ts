import Adb, {
  DeviceClient,
} from '@devicefarmer/adbkit'
import { Buffer } from 'buffer'
import { streamToBuffer, wait } from './utils'
import extractTextBlocks from 'ocr-image'

/*
  @ Android ADB Creation
*/
const adb = Adb.createClient()

export class Device extends DeviceClient {
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
        return {
          width: Number(width),
          height: Number(height)
        }
      })
  }
}

/*
  @ Context Report Generators
*/
export async function* textContext(device: Device, resolution, delay) {
  let last = Buffer.alloc(0)

  while (true) {
    await wait(delay)
    const cap = await device.screencap()
      .then(streamToBuffer)

    if (Buffer.compare(last, cap) !== 0) {
      last = cap
      yield await extractTextBlocks(cap, resolution)
    }
    
    console.count('Ran Eval Loop')
  }
}

/*
  @ Strategy Execution
*/
export async function executeStrategy() {
  
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
  const getTexts = textContext(device, resolution, EVAL_LOOP_DELAY)

  // On Mount
  await App({ device, texts: [] })

  // On Update
  for await (const texts of getTexts) {
    console.log('Run Apps', texts.map(block => block.text))
    await App({ device, texts })
  }

  console.log('Done')
}
