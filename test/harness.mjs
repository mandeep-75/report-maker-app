/**
 * Harness globals + tiny PNG generator (plain JS, no node type-checking).
 * Bundled with esbuild, run under node.
 */
import { JSDOM } from 'jsdom'
import zlib from 'node:zlib'

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

const w = dom.window
for (const key of [
  'window',
  'document',
  'Node',
  'Element',
  'HTMLElement',
  'HTMLTableElement',
  'HTMLTableCellElement',
  'Image',
  'navigator',
  'URL',
  'getComputedStyle',
  'DOMException',
]) {
  if (w[key] !== undefined && globalThis[key] === undefined) {
    globalThis[key] = w[key]
  }
}

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 255
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, Buffer.from(data)])))
  return Buffer.concat([len, typeBuf, Buffer.from(data), crc])
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Generate a valid PNG (vertical gradient c1→c2) of the given size. */
export function makePng(width, height, c1 = '#7c5cff', c2 = '#4f8cff') {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const rowStride = width * 3 + 1
  const raw = Buffer.alloc(rowStride * height)
  for (let y = 0; y < height; y++) {
    const t = height <= 1 ? 0 : y / (height - 1)
    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)
    const off = y * rowStride
    raw[off] = 0
    for (let x = 0; x < width; x++) {
      raw[off + 1 + x * 3] = r
      raw[off + 2 + x * 3] = g
      raw[off + 3 + x * 3] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const idat = zlib.deflateSync(raw)
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', new Uint8Array(0)),
  ])
  return `data:image/png;base64,${png.toString('base64')}`
}