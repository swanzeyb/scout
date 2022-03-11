import { spawn } from 'child_process'

export default function preprocess(image, resize): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [
      'preprocess.py',
      resize.width,
      resize.height,
    ])

    child.stdin.write(image, err => {
      if (err?.message) reject(err.message)
      child.stdin.end()
    })

    const buffers:any = []
    child.stdout.on('data', data => {
      buffers.push(Buffer.from(data))
    })
    child.stdout.on('close', () => {
      resolve(Buffer.concat(buffers))
    })
  })
}