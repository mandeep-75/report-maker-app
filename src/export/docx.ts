import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageBreak,
  LevelFormat,
} from 'docx'
import { saveAs } from 'file-saver'
import { Report } from '../data/reportSchema'
import { sortedSections } from '../utils/sectionOrder'
import { htmlToBlocks } from '../utils/htmlToRuns'
import { formatDateWithWeekday } from '../utils/date'
import { exportFileName } from './filename'
import { useReportStore } from '../store/reportStore'

function base64ToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function imageRun(dataUrl: string, width: number, height: number): ImageRun {
  return new ImageRun({
    data: base64ToUint8Array(dataUrl),
    type: 'png',
    transformation: { width, height },
  })
}

function blocksToParagraphs(html: string): Paragraph[] {
  return htmlToBlocks(html).map((b) => {
    if (b.type === 'heading1')
      return new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(b.runs) })
    if (b.type === 'heading2')
      return new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(b.runs) })
    if (b.type === 'bullet')
      return new Paragraph({ bullet: { level: 0 }, children: runs(b.runs) })
    if (b.type === 'numbered')
      return new Paragraph({ numbering: { reference: 'numbers', level: 0 }, children: runs(b.runs) })
    if (b.type === 'quote')
      return new Paragraph({
        indent: { left: 360 },
        children: runs(b.runs),
        spacing: { before: 80 },
      })
    return new Paragraph({ children: runs(b.runs), spacing: { after: 120 } })
  })
}

function runs(rs: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[]): TextRun[] {
  if (rs.length === 0) return [new TextRun('')]
  return rs.map((r) => {
    const opts: any = { text: r.text }
    if (r.bold) opts.bold = true
    if (r.italic) opts.italics = true
    if (r.underline) opts.underline = true
    return new TextRun(opts)
  })
}

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
}

function imageTable(
  images: { id: string; dataUrl: string }[],
  perRow: number,
  cellW: number,
  cellH: number
): Table {
  const rows: TableRow[] = []
  for (let i = 0; i < images.length; i += perRow) {
    const slice = images.slice(i, i + perRow)
    const cells = slice.map(
      (img) =>
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          width: { size: cellW, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(img.dataUrl, cellW * 5, cellH)] })],
        })
    )
    rows.push(new TableRow({ children: cells }))
  }
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
}

function buildDocument(report: Report): Document {
  const sections = sortedSections(report.sections).filter((s) => s.visible)
  const compact = useReportStore.getState().compact
  const activeSections = sections
  const { eventInfo, resourcePersons } = report
  const children: (Paragraph | Table | typeof PageBreak)[] = []

  const sectionTitle = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true })],
      spacing: { before: 240, after: 160 },
    })

  for (const section of activeSections) {
    switch (section.type) {
      case 'theme':
        children.push(sectionTitle('Theme'))
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: report.eventInfo.theme || '—', italics: true, size: 28 })],
          })
        )
        break
      case 'event-info': {
        children.push(
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: eventInfo.collegeName.toUpperCase(), bold: true, size: 32 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: eventInfo.department, size: 22 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '────────────', color: '2563EB' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'REPORT ON', size: 20, color: '64748B' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: eventInfo.eventName, bold: true, size: 36 })] })
        )
        if (eventInfo.academicSession)
          children.push(
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: eventInfo.academicSession, size: 14, color: '64748B' })] })
          )
        const detailLines: { label: string; value: string }[] = []
        if (eventInfo.date) detailLines.push({ label: 'Date', value: formatDateWithWeekday(eventInfo.date) })
        if (eventInfo.time) detailLines.push({ label: 'Time', value: eventInfo.time })
        if (eventInfo.venue) detailLines.push({ label: 'Venue', value: eventInfo.venue })
        if (eventInfo.mode) detailLines.push({ label: 'Mode', value: eventInfo.mode })
        if (eventInfo.organisedBy || eventInfo.department)
          detailLines.push({ label: 'Organised by', value: eventInfo.organisedBy || eventInfo.department })
        resourcePersons.forEach((p) =>
          detailLines.push({ label: 'Resource Person', value: [p.name, p.institution, p.location].filter(Boolean).join(', ') })
        )
        detailLines.forEach((l) =>
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: `${l.label}: `, bold: true }), new TextRun(l.value)],
            })
          )
        )
        if (eventInfo.tagline)
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `"${eventInfo.tagline}"`, italics: true })] }))
        break
      }
      case 'resource-person':
        children.push(sectionTitle('Resource Person'))
        resourcePersons.forEach((p) => {
          children.push(
            new Paragraph({ children: [new TextRun({ text: p.name, bold: true })] }),
            new Paragraph({ children: [new TextRun(`${[p.designation, p.department].filter(Boolean).join(', ')}`)] }),
            new Paragraph({ children: [new TextRun(`${[p.institution, p.location].filter(Boolean).join(', ')}`)] })
          )
        })
        break
      case 'brochure':
        children.push(sectionTitle('Brochure'))
        if (report.brochure.dataUrl) {
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(report.brochure.dataUrl, 400, 500)] }))
          if (report.brochure.caption) {
            children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: report.brochure.caption, italics: true })] }))
          }
        } else if (report.brochure.caption) {
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: report.brochure.caption })] }))
        }
        break
      case 'summary':
        children.push(sectionTitle('Summary'), ...blocksToParagraphs(report.summary))
        break
      case 'outcomes':
        children.push(sectionTitle('Key Outcomes'))
        report.outcomes.filter((o) => o.trim()).forEach((o) =>
          children.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun(o)] }))
        )
        break
      case 'conclusion':
        children.push(sectionTitle('Conclusion'), ...blocksToParagraphs(report.conclusion))
        break
      case 'organized-by':
        children.push(sectionTitle('Organised By'))
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: report.organizedBy || eventInfo.organisedBy || `${eventInfo.department}\n${eventInfo.collegeName}`, bold: true })],
          })
        )
        break
      case 'snapshots': {
        children.push(sectionTitle('Snapshots'))
        const imgs = report.snapshots.filter((s) => s.dataUrl).map((s) => ({ id: s.id, dataUrl: s.dataUrl }))
        const perRow = report.snapshotLayout === 'full' ? 1 : report.snapshotLayout === 'large-small' ? 1 : Number(report.snapshotLayout)
        if (imgs.length) children.push(imageTable(imgs, Math.min(perRow, 3), 45, 200))
        break
      }
      case 'certificates': {
        children.push(sectionTitle('Certificates'))
        const imgs = report.certificates.filter((c) => c.dataUrl).map((c) => ({ id: c.id, dataUrl: c.dataUrl }))
        const perRow = Number(report.certificateLayout)
        if (imgs.length) children.push(imageTable(imgs, perRow > 4 ? 3 : perRow, perRow >= 4 ? 45 : perRow === 2 ? 45 : 80, 240))
        break
      }
      case 'press-coverage':
        children.push(sectionTitle('Press Coverage'))
        report.pressCoverage.filter((p) => p.dataUrl).forEach((p) => {
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(p.dataUrl, 450, 300)] }))
          if (p.publication) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p.publication, bold: true })] }))
          if (p.caption) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(p.caption)] }))
        })
        break
      case 'custom': {
        const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
        if (custom) {
          children.push(sectionTitle(custom.title))
          if (custom.layout !== 'gallery') children.push(...blocksToParagraphs(custom.content))
        }
        break
      }
    }
    if (!compact) children.push(new Paragraph({ children: [new PageBreak()] }))
  }

  return new Document({
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•' }] },
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.' }] },
      ],
    },
    sections: [{ children: children as any }],
  })
}

export async function exportDocx(report: Report) {
  const doc = buildDocument(report)
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${exportFileName(report.eventInfo.eventName, report.eventInfo.date)}.docx`)
}
