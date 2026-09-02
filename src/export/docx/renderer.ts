/**
 * DOCX renderer — maps the SAME shared blocks to the `docx` library.
 * Layout decisions (sizes, spacing, keep-together) arrive pre-computed from
 * the shared model, so Word output matches the PDF.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeightRule,
  ImageRun,
  PageNumber,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import {
  DocBlock,
  DocHeading,
  DocImageGrid,
  DocParagraph,
  DocTable,
  DocTextRun,
} from '../model'
import { CONTENT, LayoutContext, MARGIN_TWIP, PAGE_TWIP, spacing } from '../layout'
import { COLOR, FONT_FAMILY, TYPE } from '../typography'

const TWIP = 1440 / 25.4
const tw = (mm: number) => Math.round(mm * TWIP)
const half = (pt: number) => pt * 2
const px = (mm: number) => Math.round(mm * (96 / 25.4))

/** Extra pt of space added before a topic (L1) heading to separate sections. */
const SECTION_SPACE_EXTRA = 10

export interface DocxContextData {
  compact: boolean
}

function alignToDocx(al: DocParagraph['align'], role: DocParagraph['role']) {
  if (al === 'center') return AlignmentType.CENTER
  if (al === 'left') return AlignmentType.LEFT
  if (al === 'justify') return AlignmentType.JUSTIFIED
  if (role === 'caption' || role === 'centered' || role === 'centeredBold' || role === 'theme') {
    return AlignmentType.CENTER
  }
  return AlignmentType.JUSTIFIED
}

export async function buildDocxDocument(blocks: DocBlock[], ctx: DocxContextData) {
  const images = await decodeImages(blocks)
  const content: (Paragraph | Table)[] = []

  for (const block of blocks) {
    if (block.kind === 'pageBreak') {
      // A paragraph-level break run falls to the next page when the current
      // page is full and then still breaks — leaving a blank page. A
      // paragraph with `pageBreakBefore` starts on a fresh page cleanly.
      content.push(
        new Paragraph({
          pageBreakBefore: true,
          spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' },
          children: [new TextRun({ text: '', size: 2, font: FONT_FAMILY.docx })],
        })
      )
      continue
    }
    content.push(...renderBlock(block, ctx, images))
  }

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            size: half(9),
            color: COLOR.muted.replace('#', ''),
            font: FONT_FAMILY.docx,
          }),
        ],
        spacing: { before: 0, after: 0 },
      }),
    ],
  })

  return new Document({
    creator: 'Report Maker',
    title: 'Event Report',
    subject: 'Institutional Event Report',
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: FONT_FAMILY.docx, size: half(TYPE.body), color: COLOR.text.replace('#', '') },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_TWIP.width, height: PAGE_TWIP.height },
            margin: { ...MARGIN_TWIP },
          },
        },
        footers: { default: footer },
        children: content,
      },
    ],
  })
}

function renderBlock(block: DocBlock, ctx: DocxContextData, images: ImageMap): (Paragraph | Table)[] {
  switch (block.kind) {
    case 'cover':
      return coverParagraphs(block.lines, ctx)
    case 'heading':
      return [headingParagraph(block, ctx)]
    case 'paragraph':
      return [bodyParagraph(block, ctx)]
    case 'list':
      return listParagraphs(block, ctx)
    case 'image': {
      const img = imageParagraph(block, ctx, images)
      return [img, ...(block.caption && img ? [captionParagraph(block.caption, ctx)] : [])]
        .filter((x): x is Paragraph => x != null)
    }
    case 'grid':
      return gridTables(block, ctx, images)
    case 'quote':
      return [quoteParagraph(block.runs, ctx)]
    case 'table':
      return structuredTable(block, ctx)
    default:
      return []
  }
}

function sp(ctx: DocxContextData) {
  return spacing(ctx as LayoutContext)
}

function color(hex?: string): string | undefined {
  return hex ? hex.replace('#', '') : undefined
}

/* ------------------------------- cover -------------------------------- */

function coverParagraphs(
  lines: Extract<DocBlock, { kind: 'cover' }>['lines'],
  _ctx: DocxContextData
): Table[] {
  const out: Paragraph[] = []

  lines.forEach((line) => {
    switch (line.style) {
      case 'college':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: line.text.toUpperCase(),
                size: half(TYPE.coverCollege),
                bold: true,
                characterSpacing: 40,
                font: FONT_FAMILY.docx,
              }),
            ],
          })
        )
        break
      case 'dept':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: line.text, size: half(TYPE.coverDept), color: color(COLOR.muted), font: FONT_FAMILY.docx })],
          })
        )
        break
      case 'rule':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 160 },
            indent: { left: tw(64), right: tw(64) },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: color(COLOR.accent) } },
          })
        )
        break
      case 'reportOn':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: line.text,
                size: half(TYPE.coverReportOn),
                color: color(COLOR.muted),
                characterSpacing: 120,
                font: FONT_FAMILY.docx,
              }),
            ],
          })
        )
        break
      case 'eventTitle':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 80 },
            children: [
              new TextRun({
                text: line.text,
                size: half(TYPE.coverEventTitle),
                bold: true,
                color: color(COLOR.heading),
                font: FONT_FAMILY.docx,
              }),
            ],
          })
        )
        break
      case 'acad':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: line.text, size: half(TYPE.coverAcad), color: color(COLOR.muted), font: FONT_FAMILY.docx })],
          })
        )
        break
      case 'theme':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: line.text,
                size: half(TYPE.coverTheme),
                italics: true,
                color: color(COLOR.accent),
                font: FONT_FAMILY.docx,
              }),
            ],
          })
        )
        break
      case 'detail': {
        const runs: TextRun[] = []
        if (line.label) runs.push(new TextRun({ text: line.label + ': ', bold: true, color: color(COLOR.heading), font: FONT_FAMILY.docx }))
        runs.push(new TextRun({ text: line.text, color: color(COLOR.text), font: FONT_FAMILY.docx }))
        out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: runs }))
        break
      }
      case 'tagline':
        out.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 320, after: 0 },
            children: [
              new TextRun({
                text: line.text,
                size: half(TYPE.coverTagline),
                italics: true,
                color: color(COLOR.muted),
                font: FONT_FAMILY.docx,
              }),
            ],
          })
        )
        break
    }
  })

  // Vertically center the cover content in the text area, mirroring the PDF
  // renderer's flex `justifyContent: 'center'` — Word needs a full-height row
  // (single cell, `middle` vertical alignment) to reproduce that.
  return [
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: tw(CONTENT.widthMm), type: WidthType.DXA },
      columnWidths: [tw(CONTENT.widthMm)],
      borders: TableBorders.NONE,
      rows: [
        new TableRow({
          height: { value: tw(CONTENT.heightMm), rule: HeightRule.ATLEAST },
          cantSplit: true,
          children: [
            new TableCell({
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: out,
            }),
          ],
        }),
      ],
    }),
  ]
}

/** Invisible paragraph that reserves exactly `pts` of vertical space. */
function spacerBefore(pts: number): Paragraph {
  return new Paragraph({
    spacing: { before: Math.round(pts * 20), after: 0, line: 20, lineRule: 'exact' },
    children: [new TextRun({ text: '', size: 2, font: FONT_FAMILY.docx })],
  })
}

/* ------------------------------ headings ------------------------------ */

function headingParagraph(heading: DocHeading, ctx: DocxContextData): Paragraph {
  const s = sp(ctx)
  const isL1 = heading.level === 1
  // Extra breathing room before a topic/L1 heading that follows body content,
  // so sections read as clearly separated blocks in Word.
  const extra = isL1 && !heading.precededByMedia ? SECTION_SPACE_EXTRA : 0
  const before = (heading.precededByMedia ? s.headingAfterImage : s.headingBefore) + extra
  const border = isL1 && heading.rule
    ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: color(COLOR.heading) } }
    : undefined
  return new Paragraph({
    alignment: isL1 ? AlignmentType.CENTER : AlignmentType.LEFT,
    keepNext: true,
    keepLines: true,
    spacing: { before: before * 20, after: s.headingAfter * 20 },
    border,
    children: [
      new TextRun({
        text: isL1 ? heading.text.toUpperCase() : heading.text,
        bold: true,
        size: half(isL1 ? TYPE.heading1 : TYPE.heading2),
        color: color(COLOR.heading),
        characterSpacing: isL1 ? 16 : 0,
        font: FONT_FAMILY.docx,
      }),
    ],
  })
}

/* ----------------------------- paragraphs ----------------------------- */

function textRuns(runs: DocTextRun[], opts?: { bold?: boolean; size?: number; color?: string; italics?: boolean }): TextRun[] {
  const out: TextRun[] = []
  for (const r of runs) {
    const parts = r.text.split('\n')
    parts.forEach((part, i) => {
      if (part || i < parts.length - 1) {
        out.push(
          new TextRun({
            text: part,
            bold: r.bold || opts?.bold,
            italics: r.italic || opts?.italics,
            underline: r.underline ? { type: 'single', color: '000000' } : undefined,
            size: opts?.size,
            color: opts?.color,
            font: FONT_FAMILY.docx,
          })
        )
      }
      if (i < parts.length - 1) out.push(new TextRun({ break: 1 }))
    })
  }
  return out
}

function bodyParagraph(p: DocParagraph, ctx: DocxContextData): Paragraph {
  const s = sp(ctx)
  const opts: { bold?: boolean; size?: number; color?: string; italics?: boolean } = {}
  if (p.role === 'theme') {
    opts.size = half(TYPE.theme)
    opts.italics = true
    opts.color = color(COLOR.accent)
  } else if (p.role === 'caption') {
    opts.size = half(TYPE.caption)
    opts.color = color(COLOR.caption)
  } else if (p.role === 'centeredBold') {
    opts.bold = true
  }

  const children: TextRun[] = []
  if (p.label) children.push(new TextRun({ text: p.label + ': ', bold: true, color: color(COLOR.heading), font: FONT_FAMILY.docx }))
  children.push(...textRuns(p.runs, opts))

  return new Paragraph({
    alignment: alignToDocx(p.align, p.role),
    keepLines: true,
    widowControl: true,
    spacing: {
      before: (p.spacingBefore ?? 0) * 20,
      after: (p.spacingAfter ?? s.bodyAfter) * 20,
      line: Math.round(240 * s.bodyLineHeight),
      lineRule: 'auto',
    },
    children,
  })
}

/* ------------------------------ centering helper ----------------------- */

function captionParagraph(text: string, ctx: DocxContextData): Paragraph {
  void ctx
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 30, after: 0 },
    children: [new TextRun({ text, size: half(TYPE.caption), color: color(COLOR.caption), font: FONT_FAMILY.docx })],
  })
}

/* -------------------------------- lists ------------------------------- */

const LIST_LEFT_TWIP = 300
const LIST_HANG_TWIP = 170

function listParagraphs(list: Extract<DocBlock, { kind: 'list' }>, ctx: DocxContextData): Paragraph[] {
  const s = sp(ctx)
  return list.items.map((item, idx) => {
    const marker = list.ordered ? `${idx + 1}.` : '•'
    const children: TextRun[] = [
      new TextRun({ text: marker + '\t', bold: true, font: FONT_FAMILY.docx }),
      ...textRuns(item.runs),
    ]
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      keepLines: true,
      widowControl: true,
      indent: { left: LIST_LEFT_TWIP, hanging: LIST_HANG_TWIP },
      tabStops: [{ type: TabStopType.LEFT, position: LIST_LEFT_TWIP }],
      spacing: {
        before: idx === 0 ? s.listGapBefore * 20 : 0,
        after: (idx === list.items.length - 1 ? s.bodyAfter : s.listItemAfter) * 20,
        line: Math.round(240 * s.bodyLineHeight),
        lineRule: 'auto',
      },
      children,
    })
  })
}

/* -------------------------------- quotes ------------------------------ */

function quoteParagraph(runs: DocTextRun[], ctx: DocxContextData): Paragraph {
  const s = sp(ctx)
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    keepLines: true,
    indent: { left: 220 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: color(COLOR.accent), space: 6 } },
    spacing: { before: 80, after: s.bodyAfter * 20, line: Math.round(240 * 1.25), lineRule: 'auto' },
    children: runs.map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.bold,
          italics: true,
          underline: r.underline ? { type: 'single', color: '000000' } : undefined,
          font: FONT_FAMILY.docx,
        })
    ),
  })
}

/* -------------------------------- images ------------------------------ */

async function reencodePng(dataUrl: string): Promise<string | null> {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const img = new Image()
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = dataUrl
  })
  if (!img.naturalWidth) return null
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}

type DecodedImage = { data: Uint8Array<ArrayBuffer>; type: 'png' | 'jpg' | 'gif' | 'bmp' }
type ImageMap = Map<string, DecodedImage>

async function decodeImage(dataUrl: string): Promise<DecodedImage> {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl)
  const mime = m?.[1] ?? 'image/png'
  const type =
    mime.includes('jpeg') || mime.includes('jpg') ? 'jpg'
    : mime.includes('gif') ? 'gif'
    : mime.includes('bmp') ? 'bmp'
    : mime.includes('png') ? 'png'
    : null
  if (!type) {
    // Unsupported direct-embed format (webp, svg, avif…) — re-encode to PNG
    // when a canvas is available, otherwise fail (image gets skipped upstream).
    const reencoded = await reencodePng(dataUrl)
    if (!reencoded) throw new Error('Unsupported image format for DOCX embedding')
    return decodeImage(reencoded)
  }
  if (!m) throw new Error('Invalid image data')
  const binary = atob(m[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { data: bytes, type }
}

/** Decode every unique embedded image to byte data once, before layout. */
export async function decodeImages(blocks: DocBlock[]): Promise<ImageMap> {
  const srcs = new Set<string>()
  const walk = (b: DocBlock) => {
    if (b.kind === 'image' && b.src) srcs.add(b.src)
    if (b.kind === 'grid')
      b.rows.forEach((row) => row.cells.forEach((c) => c.src && srcs.add(c.src)))
  }
  blocks.forEach(walk)
  const map: ImageMap = new Map()
  await Promise.all(
    [...srcs].map(async (src) => {
      try {
        map.set(src, await decodeImage(src))
      } catch {
        /* leave absent — caller skips images missing from the map */
      }
    })
  )
  return map
}

function imageRun(img: { src: string; widthMm?: number; heightMm?: number }, images: ImageMap): ImageRun | null {
  const decoded = images.get(img.src)
  if (!decoded) return null
  const wPx = px(img.widthMm ?? CONTENT.widthMm)
  const hPx = px(img.heightMm ?? 60)
  return new ImageRun({
    type: decoded.type,
    data: decoded.data,
    transformation: { width: wPx, height: hPx },
  })
}

function imageParagraph(img: Extract<DocBlock, { kind: 'image' }>, ctx: DocxContextData, images: ImageMap): Paragraph | null {
  const s = sp(ctx)
  const run = imageRun(img, images)
  if (!run) return null
  const border = img.border
    ? {
        top: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
        left: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
        right: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
      }
    : undefined
  // Apple Pages ignores `jc=center` on image-only paragraphs when importing
  // DOCX and drops the inline image to the left margin. Equal left/right
  // indents center a narrower image independent of paragraph alignment, while
  // Word (which honors `jc`) centers within the same indented box — identical
  // placement in both programs.
  const imgWTw = tw(Math.min(img.widthMm ?? CONTENT.widthMm, CONTENT.widthMm))
  const sideTw = Math.max(0, Math.round((tw(CONTENT.widthMm) - imgWTw) / 2))
  return new Paragraph({
    alignment: img.align === 'left' ? AlignmentType.LEFT : AlignmentType.CENTER,
    border,
    indent: sideTw > 0 ? { left: sideTw, right: sideTw } : undefined,
    spacing: { before: s.imageBefore * 20, after: s.imageAfter * 20 },
    children: [run],
  })
}

/* -------------------------------- grids ------------------------------- */

function gridParagraph(cell: DocImageGrid['rows'][number]['cells'][number], images: ImageMap): Paragraph | null {
  const run = imageRun({ src: cell.src, widthMm: cell.widthMm, heightMm: cell.heightMm }, images)
  if (!run) return null
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
      left: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
      right: { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border), space: 2 },
    },
    spacing: { before: 0, after: 30 },
    children: [run],
  })
}

function gridTables(grid: DocImageGrid, ctx: DocxContextData, images: ImageMap): (Paragraph | Table)[] {
  const s = sp(ctx)
  const tables = grid.rows.flatMap((row) => {
    const cells = row.cells
    const featured = cells.length >= 2 && cells[0].slotWidthMm > cells[1].slotWidthMm * 1.5

    if (!featured) {
      const colWidths = cells.map((c) => tw(c.slotWidthMm))
      const cellNodes: TableCell[] = []
      for (const cell of cells) {
        const paras: Paragraph[] = []
        const gp = gridParagraph(cell, images)
        if (gp) paras.push(gp)
        if (cell.caption) paras.push(captionParagraph(cell.caption, ctx))
        if (paras.length) cellNodes.push(new TableCell({ verticalAlign: VerticalAlign.TOP, children: paras }))
      }
      if (!cellNodes.length) return []
      return [new Table({
        layout: TableLayoutType.FIXED,
        width: { size: tw(CONTENT.widthMm), type: WidthType.DXA },
        columnWidths: colWidths,
        borders: TableBorders.NONE,
        rows: [new TableRow({ cantSplit: true, children: cellNodes })],
      })]
    }

    // Featured: big left column + stacked small images in a right column.
    const big = cells[0]
    const smalls = cells.slice(1)
    const smallColWidth = smalls[0]?.slotWidthMm ?? big.slotWidthMm / 2
    const smallParas: Paragraph[] = []
    for (const sm of smalls) {
      const gp = gridParagraph(sm, images)
      if (gp) smallParas.push(gp)
      if (sm.caption) smallParas.push(captionParagraph(sm.caption, ctx))
    }
    const bigParas: Paragraph[] = []
    const bigGp = gridParagraph(big, images)
    if (bigGp) bigParas.push(bigGp)
    if (big.caption) bigParas.push(captionParagraph(big.caption, ctx))
    if (!bigParas.length && !smallParas.length) return []
    return [new Table({
      layout: TableLayoutType.FIXED,
      width: { size: tw(CONTENT.widthMm), type: WidthType.DXA },
      columnWidths: [tw(big.slotWidthMm), tw(smallColWidth)],
      borders: TableBorders.NONE,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            ...(bigParas.length ? [new TableCell({ verticalAlign: VerticalAlign.TOP, children: bigParas })] : []),
            ...(smallParas.length ? [new TableCell({ verticalAlign: VerticalAlign.TOP, children: smallParas })] : []),
          ],
        }),
      ],
    })]
  })

  if (!tables.length) return []
  return [spacerBefore(s.imageBefore), ...tables, spacerBefore(s.imageAfter)]
}

/* ------------------------------- tables ------------------------------- */

function structuredTable(table: DocTable, ctx: DocxContextData): (Paragraph | Table)[] {
  const s = sp(ctx)
  const headers = table.headers ?? []
  const colCount = headers.length || (table.rows[0]?.length ?? 0) || 1
  const colWidth = tw(CONTENT.widthMm / colCount)

  const cellParas = (list: DocTextRun[], header: boolean): TableCell => {
    return new TableCell({
      shading: header ? { fill: color(COLOR.tableHeaderBg) } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          children: list.map(
            (r) =>
              new TextRun({
                text: r.text,
                bold: r.bold || header,
                italics: r.italic,
                underline: r.underline ? { type: 'single', color: '000000' } : undefined,
                size: half(TYPE.table),
                color: header ? color(COLOR.heading) : undefined,
                font: FONT_FAMILY.docx,
              })
          ),
          spacing: { before: 0, after: 0, line: Math.round(240 * 1.15), lineRule: 'auto' },
        }),
      ],
    })
  }

  const headerRow = headers.length
    ? [new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h) => cellParas([{ text: h }], true)) })]
    : []

  const bodyRows = table.rows.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children: Array.from({ length: colCount }, (_, ci) => cellParas(row[ci] ?? [{ text: '' }], false)),
      })
  )

  const borderStyle = { style: BorderStyle.SINGLE, size: 2, color: color(COLOR.border) }
  const tbl = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: tw(CONTENT.widthMm), type: WidthType.DXA },
    columnWidths: Array.from({ length: colCount }, () => colWidth),
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      insideHorizontal: borderStyle,
      insideVertical: borderStyle,
    },
    rows: [...headerRow, ...bodyRows],
  })

  // Word tables carry no paragraph spacing — reserve the PDF's margins around
  // the table (marginTop 8, marginBottom tableGapAfter) with invisible lines.
  return [spacerBefore(8), tbl, spacerBefore(s.tableGapAfter)]
}