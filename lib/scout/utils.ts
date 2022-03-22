import { Buffer } from 'buffer'

export function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), delay)
  })
}

export function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const buffers: any = []
    stream.on('data', data => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
    stream.on('error', err => reject(err))
  })
}
