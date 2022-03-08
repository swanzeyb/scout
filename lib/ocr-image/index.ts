import { recognize } from 'node-tesseract-ocr'

const ocrConfig = {
  lang: 'eng',
  psm: 3,
  debug: false,
  tsv: true,
}

export default async function extractBlocks(image) {
  try {
    const tsv = await recognize(image, ocrConfig)
    const blocks = transform(tsv)
    const strip = blocks
      .map(block => ({
        ...block,
        text: filter(block.text)
      }))
    console.log('strip', strip)
    const summarized = strip
      .filter(block => (
        block.text !== ''
      ))
    return summarized
  } catch (err) {
    console.error('Failed to extract text blocks from image', err.message)
  }
}

function transform(tsv) {
  const data = tsv.slice(1)
    return data.map(row => ({
      left: parseInt(row[6], 10),
      top: parseInt(row[7], 10),
      width: parseInt(row[8], 10),
      height: parseInt(row[9], 10),
      text: row[11],
  })).map(row => ({
    ...row,
    center: [
      row.left + row.width / 2,
      row.top + row.height / 2
    ],
  }))
}

function filter(txt) {
  const alpha = txt.replace(/[^a-zA-Z]/g, ' ')
  const reduce = alpha.replace(/\s\s+/g, ' ')
  const tokens = reduce.split(' ')
  return tokens.reduce((p, c) => (
    `${p}${c.length > 1 ? ` ${c}` : ''}`
  ))
}

// extractBlocks('../navigate-web/hi.png')
//   .then(console.log)
