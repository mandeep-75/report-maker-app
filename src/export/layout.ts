/**
 * Shared layout rules — the single source of truth for page geometry and
 * spacing used by BOTH the PDF and DOCX renderers. Keeping this here (instead
 * of duplicated inside each renderer) is what makes the two formats layout
 * consistently.
 */

const MM_TO_PT = 72 / 25.4
const MM_TO_TWIP = 1440 / 25.4

const PAGE = {
  widthMm: 210,
  heightMm: 297,
} as const

const MARGINS = {
  topMm: 19,
  bottomMm: 19,
  leftMm: 20,
  rightMm: 20,
} as const

export const CONTENT = {
  widthMm: Math.round((PAGE.widthMm - MARGINS.leftMm - MARGINS.rightMm) * 100) / 100,
  heightMm: Math.round((PAGE.heightMm - MARGINS.topMm - MARGINS.bottomMm) * 100) / 100,
} as const

/** Twips + points used by each renderer. */
export const PAGE_TWIP = {
  width: Math.round(PAGE.widthMm * MM_TO_TWIP),
  height: Math.round(PAGE.heightMm * MM_TO_TWIP),
}
export const MARGIN_TWIP = {
  top: Math.round(MARGINS.topMm * MM_TO_TWIP),
  bottom: Math.round(MARGINS.bottomMm * MM_TO_TWIP),
  left: Math.round(MARGINS.leftMm * MM_TO_TWIP),
  right: Math.round(MARGINS.rightMm * MM_TO_TWIP),
}

/** A small, intentional gap between side-by-side images in grids. */
export const GRID_GAP_MM = 3

export interface LayoutContext {
  compact: boolean
}

/**
 * Spacing system (pt). `compact` implements the "remove empty space" toggle:
 * more aggressive, but never destroys margins or readability.
 *
 * Numbers are deliberately small so content flows continuously and unused
 * bottom-of-page space is avoided.
 */
export function spacing(ctx: LayoutContext) {
  const { compact } = ctx
  return {
    // Paragraphs
    bodyAfter: compact ? 4.5 : 6,
    bodyLineHeight: compact ? 1.16 : 1.2,
    listItemAfter: compact ? 2 : 3,
    listGapBefore: compact ? 2 : 4,
    // Headings
    headingBefore: compact ? 9 : 12,
    headingAfter: compact ? 4 : 5.5,
    headingAfterImage: compact ? 2 : 3,
    subheadingBefore: compact ? 7 : 9,
    subheadingAfter: compact ? 3 : 4,
    // Images
    imageBefore: (compact ? 5 : 8),
    imageAfter: (compact ? 5 : 8),
    captionGap: 3,
    // Misc
    theneGap: 10,
    organizedByGap: 6,
    personGap: compact ? 8 : 10,
    tableGapAfter: compact ? 4 : 6,
    sectionDividerAfter: compact ? 2 : 4,
  }
}

/** Keep a heading with at least the first line of its content. */
export const HEADING_KEEP_PT = 22

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT
}

/**
 * Image placement rules (mm). Targets "maximum useful visual size with minimum
 * wasted page space" while never exceeding the usable page size.
 */

/** Cap a single (non-grid) image so it can never swallow a page. */
export function singleImageMaxHeightMm(compact: boolean): number {
  return CONTENT.heightMm * (compact ? 0.5 : 0.54)
}

/** Very tall / portrait images get a tighter cap. */
export function tallImageMaxHeightMm(compact: boolean): number {
  return CONTENT.heightMm * (compact ? 0.45 : 0.5)
}

/** Grid images are capped per row so a row of portraits stays compact. */
export function gridRowMaxHeightMm(compact: boolean): number {
  return CONTENT.heightMm * (compact ? 0.38 : 0.42)
}

/** Resource-person thumbnail box (mm). */
export const PERSON_PHOTO_BOX = { widthMm: 21, heightMm: 26 }
/** Press image cap so a single press cutout never occupies the full page. */
export const PRESS_IMAGE_MAX_HEIGHT_MM = 90