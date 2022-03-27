import { recognize } from 'node-tesseract-ocr'
import { writeFileSync, readFileSync } from 'fs'
import preprocess from './preprocess'
import { drawRects } from 'scout'

// const ENV_PROD = process.env.NODE_ENV !== 'development'
const ENV_PROD = true
const ENV_DEV = !ENV_PROD

const ocrConfig = {
  psm: 11,
  debug: false,
  tsv: true,
}

interface Viewport {
  width: Number,
  height: Number,
}

export default async function extractTextBlocks(image: Buffer, viewport: Viewport) {
  if (ENV_DEV) console.time('extractTextBlocks')
  if (ENV_DEV) writeFileSync('./debug/input.png', image)
  const output = await preprocess(image, viewport)
  if (ENV_DEV) writeFileSync('./debug/output.png', output)
  const tsv = await recognize(output, ocrConfig)
  const blocks = transform(tsv)
  if (ENV_DEV) drawRects('./debug/output.png', blocks.map(block => ({ ...block, text: undefined })))
  if (ENV_DEV) console.timeEnd('extractTextBlocks')
  return blocks
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

// const testImg = readFileSync('../navigate-web/uhm.png')
// extractTextBlocks(testImg)
//   .then(blocks => {
//     console.log(blocks, 'has log in?')
//     console.log(blocks.some(block => block.text.includes('Log In')))
//   })
