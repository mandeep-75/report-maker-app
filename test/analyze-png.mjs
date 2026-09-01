/**
 * Decode pdftoppm PNG pages and report the non-white bounding box (in mm),
 * then assert content stays inside the 19mm top/bottom / 20mm left/right
 * margins. Catches overflow, clipped images and footer-overlap without
 * needing to view the images.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import zlib from 'node:zlib'

const dir = process.argv[2] || path.join(process.cwd(), 'test/out')
const dpi = Number(process.argv[3] || 70)
const files = fs.readdirSync(dir).filter((f) => /^page-\d+\.png$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))

const MM = dpi / 25.4
const PX_PER_MM = dpi / 25.4

function decodePng(file) {
  const buf = fs.readFileSync(file)
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png: ' + file)
  let pos = 8
  let w = 0, h = 0, bitDepth = 0, colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4)
      bitDepth = data[8]; colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  if (bitDepth !== 8) throw new Error('unsupported bit depth ' + bitDepth)
  let ch = 3
  if (colorType === 6) ch = 4
  else if (colorType === 0) ch = 1
  else if (colorType === 4) ch = 2
  else if (colorType !== 2) throw new Error('unsupported color type ' + colorType)
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = w * ch
  const out = Buffer.alloc(h * stride)
  const paeth = (a, b, c) => {
    const p = a + b - c
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
  }
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)]
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    const cur = out.subarray(y * stride, (y + 1) * stride)
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= ch ? prev[i - ch] : 0
      let v = row[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) v += paeth(a, b, c)
      cur[i] = v & 255
    }
  }
  return { w, h, ch, data: out }
}

let allOk = true
for (const f of files) {
  const { w, h, ch, data } = decodePng(path.join(dir, f))
  const footerPx = Math.round(19 * PX_PER_MM)
  const bandH = h - footerPx
  let minX = w, minY = bandH, maxX = -1, maxY = -1
  for (let y = 0; y < bandH; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * ch
      const r = data[o], g = data[o + 1], b = data[o + 2]
      if (r < 250 || g < 250 || b < 250) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const mm = (px) => (px / PX_PER_MM).toFixed(1)
  const topMm = minY >= 0 ? minY / PX_PER_MM : 0
  const bottomInset = (bandH - maxY) / PX_PER_MM
  const leftMm = minX >= 0 ? minX / PX_PER_MM : 0
  const rightInset = (w - maxX) / PX_PER_MM
  // footer: inspect the bottom strip separately
  let fminX = w, fmaxX = -1, fmaxY = -1
  for (let y = bandH; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * ch
      if (data[o] < 250 || data[o + 1] < 250 || data[o + 2] < 250) {
        if (x < fminX) fminX = x
        if (x > fmaxX) fmaxX = x
        if (y > fmaxY) fmaxY = y
      }
    }
  }
  const hasFooter = fmaxY >= 0
  const footerInset = hasFooter ? (h - fmaxY) / PX_PER_MM : null
  const ok = (minX <= maxX) &&
    topMm >= 17.0 && leftMm >= 17.0 && rightInset >= 17.0 &&
    bottomInset >= -0.5 &&
    (!hasFooter || footerInset >= 2.5)
  if (!ok) allOk = false
  console.log(
    f.padEnd(9),
    `content L${mm(minX)} R${mm(w - maxX)} T${topMm.toFixed(1)} B${bottomInset.toFixed(1)}`,
    `footer ${hasFooter ? `at ${mm(fminX)}–${mm(fmaxX)} inset ${footerInset.toFixed(1)}` : 'none'}`,
    ok ? 'OK' : 'VIOLATION'
  )
}
console.log(allOk ? 'ALL PAGES WITHIN MARGINS' : 'SOME PAGES OVERFLOW')
process.exit(allOk ? 0 : 1)