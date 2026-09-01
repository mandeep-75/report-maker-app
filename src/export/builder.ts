/**
 * Report → shared document model.
 *
 * This is the single source of real business logic for exports: section
 * ordering, empty-section filtering, cover construction, image sizing, list
 * building and keep-together decisions. Neither the PDF nor the DOCX renderer
 * duplicates this logic — they only map blocks to their native primitives.
 */

import {
  Report,
  Section,
  ImageItem,
  PressCoverageItem,
  ResourcePerson,
} from '../data/reportSchema'
import { DocBlock, DocDocument, DocIssue, DocImage, DocImageGrid, DocTextRun } from './model'
import {
  CONTENT,
  GRID_GAP_MM,
  LayoutContext,
  PERSON_PHOTO_BOX,
  PRESS_IMAGE_MAX_HEIGHT_MM,
  singleImageMaxHeightMm,
  tallImageMaxHeightMm,
  gridRowMaxHeightMm,
  spacing,
} from './layout'
import { fitImage, ImageInfo, inspectImage, prepareImage } from './images'
import { htmlToDoc, htmlToPlainText } from './html'

const SECTION_TITLES: Record<string, string> = {
  theme: 'Theme',
  'resource-person': 'Resource Person',
  brochure: 'Brochure',
  photo: 'Photo',
  summary: 'Summary',
  outcomes: 'Key Outcomes',
  conclusion: 'Conclusion',
  'organized-by': 'Organised By',
  snapshots: 'Snapshots',
  certificates: 'Certificates',
  'press-coverage': 'Press Coverage',
}

const uidSeq = { n: 0 }
const uid = (p = 'b') => `${p}-${++uidSeq.n}`

export interface BuildOptions {
  compact?: boolean
}

function isEmpty(section: Section, report: Report): boolean {
  const { eventInfo, resourcePersons } = report
  switch (section.type) {
    case 'event-info':
      return false
    case 'theme':
      return !eventInfo.theme.trim()
    case 'resource-person':
      return !resourcePersons.length
    case 'brochure':
      return !report.brochure.dataUrl && !report.brochure.caption.trim()
    case 'summary':
      return !htmlToPlainText(report.summary)
    case 'outcomes':
      return !report.outcomes.some((o) => o.trim())
    case 'conclusion':
      return !htmlToPlainText(report.conclusion)
    case 'organized-by':
      return (
        !report.organizedBy.trim() &&
        !eventInfo.organisedBy.trim() &&
        !eventInfo.department.trim() &&
        !eventInfo.collegeName.trim()
      )
    case 'snapshots':
      return !report.snapshots.some((s) => s.dataUrl)
    case 'certificates':
      return !report.certificates.some((c) => c.dataUrl)
    case 'press-coverage':
      return !report.pressCoverage.some((p) => p.dataUrl)
    case 'photo':
      return !report.photo.dataUrl && !report.photo.caption.trim()
    case 'custom': {
      const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
      if (!custom) return true
      const hasImages = custom.images.some((i) => i.dataUrl)
      if (custom.layout === 'gallery' || custom.layout === 'photo') return !hasImages
      return !custom.title.trim() && !htmlToPlainText(custom.content)
    }
    default:
      return false
  }
}

function uniqueImageSources(report: Report): string[] {
  const set = new Set<string>()
  const add = (src?: string | null) => {
    if (src && src.startsWith('data:')) set.add(src)
  }
  add(report.brochure.dataUrl)
  add(report.photo.dataUrl)
  report.resourcePersons.forEach((p) => add(p.photo))
  report.snapshots.forEach((s) => add(s.dataUrl))
  report.certificates.forEach((c) => add(c.dataUrl))
  report.pressCoverage.forEach((p) => add(p.dataUrl))
  report.customSections.forEach((c) => c.images.forEach((i) => add(i.dataUrl)))
  // Images embedded inline in rich-text HTML (summary / conclusion / custom
  // section content) so their aspect ratio is available for layout.
  const htmls = [
    report.summary,
    report.conclusion,
    ...report.customSections.map((c) => c.content),
  ]
  const srcRe = /src="([^"]*)"/g
  for (const h of htmls) {
    if (!h) continue
    let m: RegExpExecArray | null
    while ((m = srcRe.exec(h))) add(m[1])
  }
  return [...set]
}

/** Single (non-grid) image sizing, width-preferred but height-capped. */
function singleImageSize(info: ImageInfo, ctx: LayoutContext) {
  const isTall = info.height > info.width * 1.18
  const maxH = isTall ? tallImageMaxHeightMm(ctx.compact) : singleImageMaxHeightMm(ctx.compact)
  return fitImage(info.width, info.height, CONTENT.widthMm, maxH)
}

function personImageSize(info: ImageInfo) {
  return fitImage(info.width, info.height, PERSON_PHOTO_BOX.widthMm, PERSON_PHOTO_BOX.heightMm)
}

function pressImageSize(info: ImageInfo) {
  return fitImage(info.width, info.height, CONTENT.widthMm, PRESS_IMAGE_MAX_HEIGHT_MM)
}

/** Group cells into rows of `columns` (equal slots) sized to fit content. */
function equalGrid(
  images: ImageItem[],
  columns: number,
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext
): DocImageGrid | null {
  const valid = images.filter((i) => sizes.has(i.dataUrl))
  if (!valid.length) return null
  const slotW = (CONTENT.widthMm - GRID_GAP_MM * (columns - 1)) / columns
  const maxRowH = gridRowMaxHeightMm(ctx.compact)
  const rows = []
  for (let i = 0; i < valid.length; i += columns) {
    const batch = valid.slice(i, i + columns)
    rows.push({
      cells: batch.map((img) => {
        const info = sizes.get(img.dataUrl)!
        const { widthMm, heightMm } = fitImage(info.width, info.height, slotW, maxRowH)
        return {
          id: img.id || uid('c'),
          src: img.dataUrl,
          caption: img.caption,
          widthMm,
          heightMm,
          slotWidthMm: slotW,
        }
      }),
    })
  }
  return { kind: 'grid', id: uid('grid'), rows }
}

/** "Large + small" layout: ⅔ width feature with two ⅓-width images stacked. */
function featuredGrid(
  images: ImageItem[],
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext
): DocImageGrid | null {
  const valid = images.filter((i) => sizes.has(i.dataUrl))
  if (!valid.length) return null
  const bigSlot = (CONTENT.widthMm - GRID_GAP_MM) * (2 / 3)
  const smallSlot = CONTENT.widthMm - GRID_GAP_MM - bigSlot
  const maxRowH = gridRowMaxHeightMm(ctx.compact)
  const rows = []
  for (let i = 0; i < valid.length; i += 3) {
    const group = valid.slice(i, i + 3)
    if (!group.length) break
    const make = (img: ImageItem, slot: number) => {
      const info = sizes.get(img.dataUrl)!
      const { widthMm, heightMm } = fitImage(info.width, info.height, slot, maxRowH)
      return {
        id: img.id || uid('c'),
        src: img.dataUrl,
        caption: img.caption,
        widthMm,
        heightMm,
        slotWidthMm: slot,
      }
    }
    rows.push({
      cells: [make(group[0], bigSlot), ...group.slice(1).map((g) => make(g, smallSlot))],
    })
  }
  return { kind: 'grid', id: uid('grid'), rows }
}

function coverLineBuilder(report: Report): DocCoverLineBuilder {
  return new DocCoverLineBuilder(report)
}

function heading(text: string, level: 1 | 2): DocBlock {
  return { kind: 'heading', id: uid('h'), text, level, rule: level === 1, keepNext: true }
}

function paragraph(runs: DocTextRun[], partial: Partial<Extract<DocBlock, { kind: 'paragraph' }>> = {}): DocBlock {
  return { kind: 'paragraph', id: uid('p'), runs, ...partial }
}

function run(text: string, style: Partial<DocTextRun> = {}): DocTextRun {
  return { text, ...style }
}

/**
 * A single, centered image sized to fill the full content width (aspect
 * preserved) — used for one-per-page / full-width photo flows so both PDF
 * and DOCX render the image large, centered and undistorted.
 */
function fullImageBlock(src: string, caption: string | undefined, sizes: Map<string, ImageInfo>): DocImage {
  const info = sizes.get(src)
  const { widthMm, heightMm } = info
    ? fitImage(info.width, info.height, CONTENT.widthMm, CONTENT.heightMm)
    : { widthMm: CONTENT.widthMm, heightMm: CONTENT.heightMm }
  return {
    kind: 'image',
    id: uid('img'),
    src,
    caption: caption || undefined,
    widthMm,
    heightMm,
    align: 'center',
  }
}

function splitMultiline(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function captionPara(text: string): DocBlock {
  return paragraph([run(text)], { role: 'caption' })
}

export async function buildDocument(report: Report | null, options: BuildOptions = {}): Promise<DocDocument> {
  const issues: DocIssue[] = []
  if (!report || typeof report !== 'object') {
    return { blocks: [], issues: [{ level: 'error', message: 'No report data was provided.' }] }
  }

  const ctx: LayoutContext = { compact: options.compact ?? true }

  // 1. Resolve image metadata up front so layout math is synchronous below.
  const sizes = new Map<string, ImageInfo>()
  await Promise.all(
    uniqueImageSources(report).map(async (src) => {
      try {
        const info = await inspectImage(src)
        if (info) sizes.set(src, info)
        else issues.push({ level: 'warning', message: 'An image could not be read and was skipped.' })
      } catch {
        issues.push({ level: 'warning', message: 'An image could not be read and was skipped.' })
      }
    })
  )

  // 2. Build the ordered section flow.
  const blocks: DocBlock[] = []
  const sections = [...report.sections].sort((a, b) => a.order - b.order).filter((s) => s.visible)

  const seenCover = { yes: false }
  const addSection = (section: Section) => {
    const content = renderSection(section, report, sizes, ctx, issues)
    if (!content || !content.length) return

    if (section.type === 'event-info') {
      if (seenCover.yes) return
      seenCover.yes = true
      blocks.push(...content)
      // The cover is a deliberate major-document boundary.
      blocks.push({ kind: 'pageBreak', id: uid('pb') })
      return
    }

    const prev = blocks[blocks.length - 1]
    const first = content[0]
    if (first?.kind === 'heading' && (prev?.kind === 'image' || prev?.kind === 'grid')) {
      (first as Extract<DocBlock, { kind: 'heading' }>).precededByMedia = true
    }
    blocks.push(...content)
  }

  for (const section of sections) {
    if (isEmpty(section, report)) continue
    addSection(section)
  }

  // 3. Resolve any html-parsed image blocks (summary/conclusion/custom prose).
  resolveInlineImages(blocks, sizes, ctx)

  // 4. Downsample oversized images before embedding (browser only).
  await optimizeImageData(blocks)

  // 5. Re-key every block with a single unique counter — builder.ts and
  //    html.ts each start numbered ids at 1, so ids must be unified here.
  rekeyBlocks(blocks)

  return { blocks, issues }
}

let rekeySeq = 0
const rekeyId = (p = 'b') => `${p}-${++rekeySeq}`
function rekeyBlocks(blocks: DocBlock[]) {
  for (const block of blocks) {
    block.id = rekeyId('b')
    if (block.kind === 'grid') {
      block.rows.forEach((row) => row.cells.forEach((c) => (c.id = rekeyId('c'))))
    }
  }
}

function resolveInlineImages(blocks: DocBlock[], sizes: Map<string, ImageInfo>, ctx: LayoutContext) {
  for (const block of blocks) {
    if (block.kind === 'image' && (block.widthMm == null || block.heightMm == null)) {
      const info = sizes.get(block.src)
      if (!info) continue
      const { widthMm, heightMm } = singleImageSize(info, ctx)
      block.widthMm = widthMm
      block.heightMm = heightMm
    }
  }
}

/** Downsample huge images to roughly their display size × 2. Browser-only. */
async function optimizeImageData(blocks: DocBlock[]) {
  const targets = new Map<string, number>()
  const collect = (src: string, widthMm: number) => {
    if (!widthMm || typeof document === 'undefined') return
    const px = Math.ceil(widthMm * (96 / 25.4) * 2)
    const prev = targets.get(src)
    if (!prev || px > prev) targets.set(src, px)
  }
  const walk = (b: DocBlock) => {
    if (b.kind === 'image' && b.src && b.widthMm) collect(b.src, b.widthMm)
    if (b.kind === 'grid')
      b.rows.forEach((row) => row.cells.forEach((c) => collect(c.src, c.widthMm)))
  }
  blocks.forEach(walk)

  const prepared = new Map<string, string>()
  await Promise.all(
    [...targets.entries()].map(async ([src, px]) => {
      try {
        const out = await prepareImage(src, px)
        prepared.set(src, out.src)
      } catch {
        /* keep original src */
      }
    })
  )

  const swap = (src: string) => prepared.get(src) ?? src
  for (const b of blocks) {
    if (b.kind === 'image') b.src = swap(b.src)
    if (b.kind === 'grid')
      b.rows.forEach((row) => row.cells.forEach((c) => (c.src = swap(c.src))))
  }
}

function renderSection(
  section: Section,
  report: Report,
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext,
  issues: DocIssue[]
): DocBlock[] {
  const sp = spacing(ctx)
  const out: DocBlock[] = []
  const titleOf = (): string | null => {
    if (section.showHeading === false) return null
    const t = SECTION_TITLES[section.type] ?? section.label
    return t || null
  }

  switch (section.type) {
    case 'event-info':
      return coverLineBuilder(report).blocksOut()
    case 'theme': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      out.push(
        paragraph([run(report.eventInfo.theme.trim() || '—')], {
          role: 'theme',
          spacingBefore: t ? undefined : 6,
        })
      )
      return out
    }
    case 'resource-person':
      return resourcePersonBlocks(report.resourcePersons, sizes, ctx)
    case 'brochure': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      const b = report.brochure
      if (b.dataUrl && sizes.has(b.dataUrl)) {
        const info = sizes.get(b.dataUrl)!
        const { widthMm, heightMm } = singleImageSize(info, ctx)
        out.push({
          kind: 'image',
          id: uid('img'),
          src: b.dataUrl,
          caption: b.caption || undefined,
          widthMm,
          heightMm,
          align: 'center',
        })
      } else if (b.caption.trim()) {
        out.push(captionPara(b.caption))
      }
      return out
    }
    case 'photo': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      const p = report.photo
      if (p.dataUrl && sizes.has(p.dataUrl)) {
        const info = sizes.get(p.dataUrl)!
        const { widthMm, heightMm } = singleImageSize(info, ctx)
        out.push({
          kind: 'image',
          id: uid('img'),
          src: p.dataUrl,
          caption: p.caption || undefined,
          widthMm,
          heightMm,
          align: 'center',
        })
      } else if (p.caption.trim()) {
        out.push(captionPara(p.caption))
      }
      return out
    }
    case 'summary':
    case 'conclusion': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      const html = section.type === 'summary' ? report.summary : report.conclusion
      return out.concat(parseHtml(html, sizes))
    }
    case 'outcomes': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      const items = report.outcomes
        .map((o) => o.trim())
        .filter(Boolean)
        .map((o) => ({ id: uid('li'), runs: [run(o)] }))
      if (items.length) {
        out.push({
          kind: 'list',
          id: uid('list'),
          ordered: false,
          items,
          keepNext: items.length <= 3,
        })
      }
      return out
    }
    case 'organized-by': {
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      const raw =
        report.organizedBy.trim() ||
        report.eventInfo.organisedBy.trim() ||
        [report.eventInfo.department, report.eventInfo.collegeName].filter(Boolean).join('\n')
      splitMultiline(raw).forEach((lineText) => {
        out.push(
          paragraph([run(lineText)], {
            role: 'centeredBold',
            spacingBefore: sp.organizedByGap,
            spacingAfter: sp.organizedByGap,
          })
        )
      })
      return out
    }
    case 'snapshots':
      return snapshotBlocks(report, sizes, ctx)
    case 'certificates':
      return certificateBlocks(report, sizes, ctx)
    case 'press-coverage':
      return pressBlocks(report.pressCoverage, sizes)
    case 'custom': {
      const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
      if (!custom) return []
      const t = titleOf()
      if (t) out.push(heading(t, 1))
      if (custom.layout === 'gallery') {
        const grid = equalGrid(custom.images, 2, sizes, ctx)
        if (grid) out.push(grid)
      } else if (custom.layout === 'photo') {
        for (const img of custom.images) {
          if (!sizes.has(img.dataUrl)) continue
          out.push(fullImageBlock(img.dataUrl, img.caption, sizes))
        }
      } else if (custom.layout === 'quote') {
        const parsed = htmlToDoc(custom.content)
        const quoteRuns = parsed.blocks
          .map((b) => (b.kind === 'paragraph' || b.kind === 'quote' ? b.runs : []))
          .flat()
        if (quoteRuns.length) out.push({ kind: 'quote', id: uid('q'), runs: quoteRuns })
      } else {
        out.push(...parseHtml(custom.content, sizes))
      }
      return out
    }
    default:
      issues.push({ level: 'warning', message: 'A section type was not recognised and was skipped.' })
      return []
  }
}

function resourcePersonBlocks(
  persons: ResourcePerson[],
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext
): DocBlock[] {
  const out: DocBlock[] = []
  const sp = spacing(ctx)
  const photo = (p: ResourcePerson): DocImage | null => {
    if (!p.photo || !sizes.has(p.photo)) return null
    const info = sizes.get(p.photo)!
    const { widthMm, heightMm } = personImageSize(info)
    return {
      kind: 'image',
      id: uid('img'),
      src: p.photo,
      widthMm,
      heightMm,
      align: 'center',
      border: true,
    }
  }
  persons.forEach((p, i) => {
    const img = photo(p)
    if (img) out.push(img)
    out.push(
      paragraph([run(p.name || 'Resource Person')], {
        role: 'centered',
        spacingBefore: img ? 4 : i === 0 ? undefined : sp.personGap,
        spacingAfter: 2,
      })
    )
    const meta: string[] = []
    if (p.designation?.trim()) meta.push(p.designation.trim())
    if (p.department?.trim()) meta.push(p.department.trim())
    if (p.institution?.trim()) meta.push(p.institution.trim())
    if (p.location?.trim()) meta.push(p.location.trim())
    if (meta.length)
      out.push(
        paragraph([run(meta.join(', '))], {
          role: 'centered',
          spacingAfter: sp.personGap,
        })
      )
  })
  return out
}

function snapshotBlocks(
  report: Report,
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext
): DocBlock[] {
  const out: DocBlock[] = []
  const visible = report.snapshots.filter((s) => s.dataUrl)
  if (!visible.length) return out
  out.push(heading('Snapshots', 1))
  const layout = report.snapshotLayout
  if (layout === 'large-small') {
    const grid = featuredGrid(visible, sizes, ctx)
    if (grid) out.push(grid)
} else if (layout === 'full' || layout === '1') {
        // Flow each image full-width, no forced page breaks.
        for (const img of visible) {
          if (!sizes.has(img.dataUrl)) continue
          out.push(fullImageBlock(img.dataUrl, img.caption, sizes))
        }
  } else {
    const cols = layout === '4' ? 2 : layout === '6' ? 3 : Number(layout) || 2
    const grid = equalGrid(visible, cols, sizes, ctx)
    if (grid) out.push(grid)
  }
  return out
}

function certificateBlocks(
  report: Report,
  sizes: Map<string, ImageInfo>,
  ctx: LayoutContext
): DocBlock[] {
  const out: DocBlock[] = []
  const visible = report.certificates.filter((c) => c.dataUrl)
  if (!visible.length) return out
  out.push(heading('Certificates', 1))
  if (report.certificateLayout === '1') {
    // "1 per page": flow each certificate at full content width, centered,
    // one per page.
    visible.forEach((c, i) => {
      const info = sizes.get(c.dataUrl)
      if (!info) return
      if (i > 0) out.push({ kind: 'pageBreak', id: uid('pb') })
      const { widthMm, heightMm } = fitImage(info.width, info.height, CONTENT.widthMm, CONTENT.heightMm)
      out.push({
        kind: 'image',
        id: uid('img'),
        src: c.dataUrl,
        caption: c.caption || undefined,
        widthMm,
        heightMm,
        align: 'center',
        keepNext: true,
      })
    })
    return out
  }
  const cols = report.certificateLayout === '4' ? 2 : Number(report.certificateLayout) || 3
  const grid = equalGrid(visible, cols, sizes, ctx)
  if (grid) out.push(grid)
  return out
}

function pressBlocks(
  items: PressCoverageItem[],
  sizes: Map<string, ImageInfo>
): DocBlock[] {
  const out: DocBlock[] = []
  const visible = items.filter((i) => i.dataUrl)
  if (!visible.length) return out
  out.push(heading('Press Coverage', 1))
  visible.forEach((p, i) => {
    const info = sizes.get(p.dataUrl)
    if (info) {
      const { widthMm, heightMm } = pressImageSize(info)
      out.push({
        kind: 'image',
        id: uid('img'),
        src: p.dataUrl,
        caption: undefined,
        widthMm,
        heightMm,
        align: 'center',
        keepNext: Boolean(p.publication || p.date || p.caption),
      })
    }
    if (p.publication) out.push(paragraph([run(p.publication)], { role: 'centeredBold', spacingBefore: 2, spacingAfter: 2 }))
    if (p.date) out.push(paragraph([run(p.date)], { role: 'centered', spacingAfter: 2 }))
    if (p.caption) out.push(paragraph([run(p.caption)], { role: 'caption', spacingAfter: i === visible.length - 1 ? undefined : 10 }))
  })
  return out
}

/** Parse user rich-text HTML into blocks, preserving images/emphasis. */
function parseHtml(html: string, sizes: Map<string, ImageInfo>): DocBlock[] {
  const { blocks } = htmlToDoc(html)
  return blocks.map((b) => {
    if (b.kind === 'heading') return { ...b, rule: b.level === 1, keepNext: true }
    if (b.kind === 'image') return fullImageBlock(b.src, b.caption, sizes)
    return b
  })
}

/** Line builder used for the cover page. */
class DocCoverLineBuilder {
  private linesOut: DocBlock[]
  private report: Report
  constructor(report: Report) {
    this.report = report
    this.linesOut = this.build()
  }
  blocksOut(): DocBlock[] {
    return this.linesOut
  }
  private build(): DocBlock[] {
    const { eventInfo, resourcePersons } = this.report
    if (
      !eventInfo.collegeName.trim() &&
      !eventInfo.department.trim() &&
      !eventInfo.eventName.trim() &&
      !eventInfo.theme.trim() &&
      !eventInfo.date &&
      !eventInfo.time &&
      !eventInfo.venue &&
      !eventInfo.organisedBy.trim() &&
      !eventInfo.tagline.trim() &&
      !resourcePersons.length
    ) {
      return []
    }
    const lines: NonNullable<DocBlock & { kind: 'cover' }>['lines'] = []
    lines.push({ text: eventInfo.collegeName || 'COLLEGE NAME', style: 'college' })
    lines.push({ text: eventInfo.department || 'DEPARTMENT NAME', style: 'dept' })
    lines.push({ text: '', style: 'rule' })
    lines.push({ text: 'Report On', style: 'reportOn' })
    lines.push({ text: eventInfo.eventName || 'EVENT TITLE', style: 'eventTitle' })
    if (eventInfo.academicSession) lines.push({ text: eventInfo.academicSession, style: 'acad' })
    if (eventInfo.theme) lines.push({ text: `"${eventInfo.theme}"`, style: 'theme' })
    const detail = (label: string, value: string) => {
      if (value) lines.push({ text: value, style: 'detail', label })
    }
    detail('Date', eventInfo.date ? formatCoverDate(eventInfo.date) : '')
    detail('Time', eventInfo.time)
    detail('Venue', eventInfo.venue)
    detail('Mode', eventInfo.mode)
    detail('Organised by', eventInfo.organisedBy || eventInfo.department)
    resourcePersons.forEach((p) => {
      const bits = [p.name, p.institution, p.location].filter(Boolean)
      if (bits.length) lines.push({ text: bits.join(', '), style: 'detail', label: 'Resource Person' })
    })
    if (eventInfo.tagline) lines.push({ text: `"${eventInfo.tagline}"`, style: 'tagline' })
    return [{ kind: 'cover', id: uid('cover'), lines }]
  }
}

function formatCoverDate(date: string): string {
  if (!date) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(date)
  if (isNaN(d.getTime())) return date
  const base = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  return `${base} (${weekday})`
}