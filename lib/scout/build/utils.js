"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = exports.streamToBuffer = exports.wait = void 0;
const buffer_1 = require("buffer");
function wait(delay) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), delay);
    });
}
exports.wait = wait;
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        stream.on('data', data => buffers.push(data));
        stream.on('end', () => resolve(buffer_1.Buffer.concat(buffers)));
        stream.on('error', err => reject(err));
    });
}
exports.streamToBuffer = streamToBuffer;
function getEnv(key) {
    const result = process.env[key];
    if (!result) {
        const msg = `${key} missing from env`;
        throw new Error(msg);
    }
    return result;
}
exports.getEnv = getEnv;
/*
import gmFactory from 'gm'
const gm = gmFactory.subClass({ imageMagick: true })

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number,
}

export function drawRects(imgPath: string, rects: Rect[]) {
  const img = gm(imgPath)
  img.fill('transparent')
  img.stroke('#6C68FF', 5)

  for (const [_, rect] of rects.entries()) {
    const x0 = rect.left
    const y0 = rect.top
    const x1 = rect.left + rect.width
    const y1 = rect.top + rect.height
    img.drawRectangle(x0, y0, x1, y1)
  }

  return (() => new Promise((resolve, reject) => {
    img.write(imgPath, err => {
      if (err) reject(err)
    })
    resolve(null)
  }))()
}
*/
