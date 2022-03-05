import { recognize } from 'node-tesseract-ocr'

const task = recognize('./img.png', {
  lang: 'eng',
  psm: '3',
  debug: true,
  tsv: true,
})

task
  .then(transform)
  .then(allTxt => (
    allTxt
      .map(block => ({
        ...block,
        text: filter(block.text)
      }))
      .filter(block => (
        block.text !== ''
      ))
  ))
  .then(allTxt => {
    console.log(allTxt, '----', allTxt.length)
  })

function transform(tsv) {
  const data = tsv.slice(1)
    return data.map(row => ({
      left: row[6],
      top: row[7],
      width: row[8],
      height: row[9],
      text: row[11],
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
