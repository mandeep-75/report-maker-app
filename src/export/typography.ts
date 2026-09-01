/**
 * Shared typography system. Both renderers map these tokens to their native
 * APIs so PDF and DOCX share one type scale, one palette and identical role
 * styles. Body text is always regular weight — bold is reserved for headings
 * and labels.
 */

export const FONT_FAMILY = {
  /** PDF: standard PDF base font name. */
  pdf: 'Times-Roman',
  /** DOCX: standard professional serif. */
  docx: 'Times New Roman',
} as const

export const TYPE = {
  /** Cover page */
  coverCollege: 20,
  coverDept: 13,
  coverReportOn: 11,
  coverEventTitle: 24,
  coverAcad: 11,
  coverTheme: 13,
  coverDetail: 11,
  coverTagline: 12,
  /** Section headings */
  heading1: 13.5,
  heading2: 11.5,
  /** Body */
  body: 11,
  theme: 11.5,
  personName: 12.5,
  personMeta: 11,
  organizedBy: 12,
  caption: 9.5,
  quote: 11.5,
  table: 10.5,
  tableHeader: 10.5,
} as const

export const COLOR = {
  text: '#1f2937',
  heading: '#111827',
  muted: '#4b5563',
  caption: '#6b7280',
  accent: '#1d4ed8',
  border: '#d1d5db',
  tableHeaderBg: '#eef2ff',
} as const

/** Role → style map consumed by both renderers. */
export const PARAGRAPH_STYLES = {
  body: {},
  caption: { size: TYPE.caption, color: COLOR.caption, align: 'center' as const },
  theme: { size: TYPE.theme, color: COLOR.accent, italic: true, align: 'center' as const },
  centered: { align: 'center' as const },
  centeredBold: { align: 'center' as const, bold: true },
  personMeta: { size: TYPE.personMeta },
  labelValue: {},
} as const