import { recognize } from 'node-tesseract-ocr'

recognize('./img.png', {
    lang: 'eng',
    psm: '4',
    debug: true,
}).then(data => {
    console.log(data)
})
