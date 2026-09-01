/**
 * Image pipeline shared by both renderers.
 *
 * Responsibilities:
 *  - validate data URLs and extract natural dimensions (PNG/JPEG headers),
 *  - compute fitted output size in mm, always preserving aspect ratio,
 *  - never upscale beyond the source resolution (avoids blurry images),
 *  - downsample oversized images before embedding (avoids multi-MB exports),
 *  - preserve transparency for PNG/WebP sources.
 *
 * Never crash on a bad image — callers skip invalid images and continue.
 */

const PX_PER_MM = 96 / 25.4

export interface ImageInfo {
  width: number
  height: number
  mime: string
  /** True when the source format can carry an alpha channel. */
  maybeTransparent: boolean
}

export interface FittedSize {
  widthMm: number
  heightMm: number
}

interface ParsedDataUrl {
  mime: string
  bytes: Uint8Array
}

export function decodeDataUrl(dataUrl: string): ParsedDataUrl | null {
  const comma = dataUrl.indexOf(',')
  if (comma === -1) return null
  const header = dataUrl.slice(0, comma)
  const mime = (header.match(/data:([^;]+)/)?.[1] ?? 'image/png')
  try {
    const b64 = dataUrl.slice(comma + 1)
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return { mime: mime.toLowerCase(), bytes }
  } catch {
    return null
  }
}

/** Validate that the payload actually decodes as the declared image type. */
export function sniff(dataUrl: string): ImageInfo | null {
  const parsed = decodeDataUrl(dataUrl)
  if (!parsed) return null
  const { mime, bytes } = parsed

  if (mime === 'image/png' || bytes.length >= 8 && isPng(bytes)) {
    const size = pngSize(bytes)
    if (!size) return null
    return { width: size.width, height: size.height, mime: 'image/png', maybeTransparent: true }
  }
  if (mime === 'image/jpeg' || mime === 'image/jpg' || bytes.length >= 3 && isJpeg(bytes)) {
    const size = jpegSize(bytes)
    if (!size) return null
    return { width: size.width, height: size.height, mime: 'image/jpeg', maybeTransparent: false }
  }
  // GIF / WebP / SVG / BMP — resolve through the DOM decoder when available.
  return null
}

export function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
}

export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

/** Width/height from the PNG IHDR chunk. */
function pngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null
  // IHDR chunk length check (8-byte signature, 4-byte length = 13, marker + dims)
  const hasIhdr = readUint32BE(bytes, 8) === 13
  if (!hasIhdr) return null
  const width = readUint32BE(bytes, 16)
  const height = readUint32BE(bytes, 20)
  if (width <= 0 || height <= 0 || width > 40000 || height > 40000) return null
  return { width, height }
}

/** Width/height from JPEG SOF markers (works for baseline + progressive). */
function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  let pos = 2
  const len = bytes.length
  while (pos + 9 < len) {
    if (bytes[pos] !== 0xff) {
      pos++
      continue
    }
    const marker = bytes[pos + 1]
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      // standalone markers (SOI, RST/EOI) carry no length
      pos += marker === 0xd8 ? 2 : 1
      continue
    }
    const segmentLen = readUint16BE(bytes, pos + 2)
    if (segmentLen < 2) return null
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = readUint16BE(bytes, pos + 5)
      const width = readUint16BE(bytes, pos + 7)
      if (width <= 0 || height <= 0 || width > 40000 || height > 40000) return null
      return { width, height }
    }
    pos += 2 + segmentLen
  }
  return null
}

function hasCanvas(): boolean {
  return typeof document !== 'undefined' && !!document.createElement('canvas')
}

/** Resolve dims via DOM decoder (fallback for GIF/WebP/SVG/BMP). */
async function dimsViaDom(dataUrl: string): Promise<{ width: number; height: number } | null> {
  if (typeof document === 'undefined') return null
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const inf = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(img.src)
      resolve(inf)
    }
    img.onerror = () => resolve(null)
    try {
      img.src = dataUrl
    } catch {
      resolve(null)
    }
  })
}

/** Validate + measure an image. Returns null for invalid/corrupted images. */
export async function inspectImage(dataUrl: string): Promise<ImageInfo | null> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null
  const sn = sniff(dataUrl)
  if (sn) return sn
  const viaDom = await dimsViaDom(dataUrl)
  if (!viaDom) return null
  const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
  const maybeTransparent = !mime.includes('jpeg') && !mime.includes('jpg')
  return { ...viaDom, mime: mime || 'image/png', maybeTransparent }
}

/**
 * Fit an image to `maxWidthMm x maxHeightMm` preserving aspect ratio.
 * Never upscales beyond the source's native resolution (≈96 DPI), so
 * low-resolution images are not stretched into blur.
 */
export function fitImage(
  naturalWidth: number,
  naturalHeight: number,
  maxWidthMm: number,
  maxHeightMm: number
): FittedSize {
  if (naturalWidth <= 0 || naturalHeight <= 0) return { widthMm: 0, heightMm: 0 }
  const scale = Math.min(
    maxWidthMm / naturalWidth,
    maxHeightMm / naturalHeight,
    1 / PX_PER_MM
  )
  return { widthMm: naturalWidth * scale, heightMm: naturalHeight * scale }
}

export interface PreparedImage extends ImageInfo {
  /** Possibly downsampled data URL, always embeddable. */
  src: string
}

/**
 * Downsample an image when it is much larger than its displayed size.
 * Keeps PNG/WebP sources lossless (transparency preserved); JPEG photos are
 * re-encoded as JPEG. Falls back to the original when downsampling is
 * unavailable (non-browser environment).
 */
export async function prepareImage(dataUrl: string, targetWidthPx: number): Promise<PreparedImage> {
  const info = await inspectImage(dataUrl)
  if (!info) throw new Error('Invalid image')
  const src = await downsampleIfNeeded(dataUrl, info, targetWidthPx)
  return { ...info, src }
}

async function downsampleIfNeeded(
  dataUrl: string,
  info: ImageInfo,
  targetWidthPx: number
): Promise<string> {
  if (!hasCanvas()) return dataUrl
  // Only bother when the source needs significant reduction.
  if (info.width <= targetWidthPx * 1.5) return dataUrl
  const factor = Math.min(1, targetWidthPx / info.width)
  const outW = Math.max(64, Math.round(info.width * factor))
  const outH = Math.max(64, Math.round(info.height * factor))
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  const img = new Image()
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.onerror = () => {
      /* keep the original on decode failure */
      resolve()
    }
    img.src = dataUrl
  })
  ctx.drawImage(img, 0, 0, outW, outH)
  return info.maybeTransparent
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', 0.85)
}