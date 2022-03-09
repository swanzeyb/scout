import { recognize } from 'node-tesseract-ocr'
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const debug = false
const ocrConfig = {
  psm: 11,
  debug,
  tsv: true,
}
const viewport = {
  width: 375,
  height: 667,
}

export async function extractTextBlocks(image) {
  const input = await preprocessImage(image)
  const tsv = await recognize(input, ocrConfig)
  const blocks = transform(tsv)
  return blocks
}

async function preprocessImage(input) {
  const { width, height } = viewport
  const process = await sharp(input)
    .greyscale()
    .resize(width, height)
    .png()
    .toBuffer()
  const canvas = await createCanvas(width, height, 20)
  const output = await canvas
    .composite([{ input: process }])
    .png()
    .toBuffer()

  debug && writeFileSync('./output.png', output)
  return output
}

async function createCanvas(width, height, border) {
  return await sharp({
    create: {
      width: width + border * 2,
      height: height + border * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    }
  })
  .withMetadata({ density: 72 })
}

function transform(tsv) {
  const rows = tsv.slice(1)
  const byBlock = {}
  rows.forEach(row => {
    const block = row[2]
    const conf = row[10]

    if (!(conf < 50)) {
      byBlock[block] = byBlock[block] || []
      byBlock[block].push({
        left: parseFloat(row[6]),
        top: parseFloat(row[7]),
        width: parseFloat(row[8]),
        height: parseFloat(row[9]),
        text: row[11],
      })
    }
  })
  const blocks:any = []
  const blockIds = Object.keys(byBlock)
  for (let i = 0; i < blockIds.length; i++) {
    const blockId = blockIds[i]
    const parts = byBlock[blockId]
    const last = parts[parts.length - 1]
    
    const { left } = parts.reduce((p, c) => ({ left: Math.min(p.left, c.left) }))
    const { top } = parts.reduce((p, c) => ({ top: Math.min(p.top, c.top) }))
    const width = left + (last.width + last.width)
    const { height } = parts.reduce((p, c) => ({ height: Math.max(p.height, c.height) }))
    const { text } = parts.reduce((p, c) => ({ text: `${p.text} ${c.text}` }))
    const center = [left + width / 2, top + height / 2]
    
    blocks[i] = {
      left, top,
      width, height,
      center,
      text,
    }
  }

  return blocks
}

function filter(txt) {
  const alpha = txt.replace(/[^a-zA-Z]/g, ' ')
  const reduce = alpha.replace(/\s\s+/g, ' ')
  const tokens = reduce.split(' ')
  const combine = tokens.reduce((p, c) => (
    `${p}${c.length > 1 ? ` ${c}` : ''}`
  ))
  return combine.trim()
}

extractTextBlocks('../navigate-web/yeet.png')
  .then(console.log)
