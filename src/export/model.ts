/**
 * Renderer-agnostic document model.
 *
 * Both the PDF and DOCX renderers consume this model. All layout decisions
 * (page geometry, spacing, image sizing, keep-together rules) happen in the
 * shared layers (`layout.ts`, `images.ts`, `builder.ts`) — never inside a
 * renderer. This guarantees PDF and DOCX produce visually consistent output.
 */

export interface DocTextRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export type DocAlign = 'left' | 'center' | 'justify'

export interface DocBase {
  id: string
  /** PDF: minPresenceAhead / DOCX: keepNext — keep heading with following content. */
  keepNext?: boolean
  /** Explicit page break, honored by both renderers. Never set automatically. */
  pageBreakBefore?: boolean
}

export interface DocParagraph extends DocBase {
  kind: 'paragraph'
  runs: DocTextRun[]
  align?: DocAlign
  /** Presentational role resolved to shared styles by both renderers. */
  role?: 'body' | 'caption' | 'theme' | 'centered' | 'centeredBold' | 'personMeta' | 'labelValue'
  label?: string
  /** Logical unit id used to reduce spacing after images, etc. */
  unit?: string
  /** Explicit spacing overrides (pt), resolved by both renderers. */
  spacingBefore?: number
  spacingAfter?: number
}

export interface DocHeading extends DocBase {
  kind: 'heading'
  text: string
  level: 1 | 2
  /** Draws a bottom border like the preview `.section-title`. */
  rule?: boolean
  /** Heading follows an image/grid — renderers tighten the gap. */
  precededByMedia?: boolean
}

export interface DocListItem {
  id: string
  runs: DocTextRun[]
}

export interface DocList extends DocBase {
  kind: 'list'
  ordered: boolean
  items: DocListItem[]
}

export interface DocImage extends DocBase {
  kind: 'image'
  src: string
  caption?: string
  /** Output size in mm, computed from the original aspect ratio. */
  widthMm?: number
  heightMm?: number
  align?: DocAlign
  border?: boolean
}

export interface DocImageCell {
  id: string
  src: string
  caption?: string
  /** Actual rendered image size (mm), aspect-ratio preserved. */
  widthMm: number
  heightMm: number
  /** Container width (mm); larger than widthMm for low-res images. */
  slotWidthMm: number
}

export interface DocGridRow {
  cells: DocImageCell[]
}

export interface DocImageGrid extends DocBase {
  kind: 'grid'
  rows: DocGridRow[]
}

export interface DocQuote extends DocBase {
  kind: 'quote'
  runs: DocTextRun[]
}

export interface DocTable extends DocBase {
  kind: 'table'
  headers?: string[]
  rows: DocTextRun[][][]
  /** e.g. 'Resource Person' | 'Event Information'. */
  caption?: string
}

export type CoverLineStyle =
  | 'college'
  | 'dept'
  | 'rule'
  | 'reportOn'
  | 'eventTitle'
  | 'acad'
  | 'theme'
  | 'detail'
  | 'tagline'

export interface DocCoverLine {
  text: string
  style: CoverLineStyle
  label?: string
}

export interface DocCover extends DocBase {
  kind: 'cover'
  lines: DocCoverLine[]
}

export interface DocPageBreak extends DocBase {
  kind: 'pageBreak'
}

export type DocBlock =
  | DocParagraph
  | DocHeading
  | DocList
  | DocImage
  | DocImageGrid
  | DocQuote
  | DocTable
  | DocCover
  | DocPageBreak

export interface DocDocument {
  blocks: DocBlock[]
  /** Problems encountered while building (skipped images, missing fields). */
  issues: DocIssue[]
}

export interface DocIssue {
  level: 'warning' | 'error'
  message: string
}