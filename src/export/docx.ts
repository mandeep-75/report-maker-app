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
  LevelFormat,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx'
import { saveAs } from 'file-saver'
import { Report, Section } from '../data/reportSchema'
import { sortedSections } from '../utils/sectionOrder'
import { htmlToBlocks } from '../utils/htmlToRuns'
import { formatDateWithWeekday } from '../utils/date'
import { exportFileName } from './filename'

const FONT = 'Times New Roman'
const DEFAULT_SIZE = 24
const HEADING_SIZE = 30
const HEADING2_SIZE = 28
const LINE_SPACING = 276
const PARAGRAPH_AFTER = 120

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
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: runs(b.runs, { size: HEADING_SIZE, bold: true }),
        spacing: { before: 240, after: 120, line: LINE_SPACING },
      })
    if (b.type === 'heading2')
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: runs(b.runs, { size: HEADING2_SIZE, bold: true }),
        spacing: { before: 200, after: 100, line: LINE_SPACING },
      })
    if (b.type === 'bullet')
      return new Paragraph({
        bullet: { level: 0 },
        indent: { left: 720, hanging: 360 },
        spacing: { after: 60, line: LINE_SPACING },
        children: runs(b.runs),
      })
    if (b.type === 'numbered')
      return new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        indent: { left: 720, hanging: 360 },
        spacing: { after: 60, line: LINE_SPACING },
        children: runs(b.runs),
      })
    if (b.type === 'quote')
      return new Paragraph({
        indent: { left: 360 },
        children: runs(b.runs),
        spacing: { before: 60, after: 60, line: LINE_SPACING },
      })
    return new Paragraph({
      children: runs(b.runs),
      spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
      alignment: AlignmentType.JUSTIFIED,
    })
  })
}

function runs(
  rs: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[],
  opts: { size?: number; bold?: boolean; color?: string } = {}
): TextRun[] {
  if (rs.length === 0) return [new TextRun({ text: '', font: FONT, size: opts.size ?? DEFAULT_SIZE })]
  return rs.map((r) => {
    const o: any = { text: r.text, font: FONT, size: opts.size ?? DEFAULT_SIZE }
    if (opts.bold || r.bold) o.bold = true
    if (r.italic) o.italics = true
    if (r.underline) o.underline = true
    if (opts.color) o.color = opts.color
    return new TextRun(o)
  })
}

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
}

function buildDocument(report: Report): Document {
  const sections = sortedSections(report.sections).filter((s) => s.visible)
  const activeSections = sections
  const { eventInfo, resourcePersons } = report
  const children: (Paragraph | Table)[] = []

  const sectionTitle = (section: Section, text: string): Paragraph[] => {
    if (section.showHeading === false) return []
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: text.toUpperCase(), bold: true, font: FONT, size: HEADING_SIZE })],
        spacing: { before: 240, after: 120, line: LINE_SPACING },
      }),
    ]
  }

  for (const section of activeSections) {
    switch (section.type) {
      case 'theme':
        children.push(...sectionTitle(section, 'Theme'))
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
            children: [new TextRun({ text: report.eventInfo.theme || '—', italics: true, color: '1D4ED8', font: FONT, size: 26 })],
          })
        )
        break
      case 'event-info': {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60, line: LINE_SPACING },
            children: [new TextRun({ text: eventInfo.collegeName.toUpperCase(), bold: true, font: FONT, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60, line: LINE_SPACING },
            children: [new TextRun({ text: eventInfo.department.toUpperCase(), font: FONT, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: LINE_SPACING },
            children: [new TextRun({ text: '────────────', color: '2563EB', font: FONT })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60, line: LINE_SPACING },
            children: [new TextRun({ text: 'REPORT ON', font: FONT, size: 30 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: LINE_SPACING },
            children: [new TextRun({ text: eventInfo.eventName.toUpperCase(), bold: true, font: FONT, size: 32 })],
          })
        )
        if (eventInfo.academicSession)
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60, line: LINE_SPACING },
              children: [new TextRun({ text: `Academic Session: ${eventInfo.academicSession}`, font: FONT, size: 24 })],
            })
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
              alignment: AlignmentType.LEFT,
              spacing: { after: 40, line: LINE_SPACING },
              children: [
                new TextRun({ text: `${l.label}: `, font: FONT, size: DEFAULT_SIZE }),
                new TextRun({ text: l.value, font: FONT, size: DEFAULT_SIZE }),
              ],
            })
          )
        )
        if (eventInfo.tagline)
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
              children: [new TextRun({ text: `"${eventInfo.tagline}"`, italics: true, color: '475569', font: FONT, size: 26 })],
            })
          )
        break
      }
      case 'resource-person':
        children.push(...sectionTitle(section, 'Resource Person'))
        resourcePersons.forEach((p) => {
          children.push(
            new Paragraph({
              spacing: { after: 20, line: LINE_SPACING },
              children: [new TextRun({ text: p.name, font: FONT, size: DEFAULT_SIZE })],
            }),
            new Paragraph({
              spacing: { after: 20, line: LINE_SPACING },
              children: [new TextRun({ text: [p.designation, p.department].filter(Boolean).join(', '), font: FONT, size: DEFAULT_SIZE })],
            }),
            new Paragraph({
              spacing: { after: 100, line: LINE_SPACING },
              children: [new TextRun({ text: [p.institution, p.location].filter(Boolean).join(', '), font: FONT, size: DEFAULT_SIZE })],
            })
          )
        })
        break
      case 'brochure':
        children.push(...sectionTitle(section, 'Brochure'))
        if (report.brochure.dataUrl) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60, line: LINE_SPACING },
              children: [imageRun(report.brochure.dataUrl, 400, 500)],
            })
          )
          if (report.brochure.caption) {
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
                children: [new TextRun({ text: report.brochure.caption, italics: true, font: FONT, size: 20 })],
              })
            )
          }
        } else if (report.brochure.caption) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
              children: [new TextRun({ text: report.brochure.caption, font: FONT, size: DEFAULT_SIZE })],
            })
          )
        }
        break
      case 'photo':
        children.push(...sectionTitle(section, 'Photo'))
        if (report.photo.dataUrl) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60, line: LINE_SPACING },
              children: [imageRun(report.photo.dataUrl, 400, 300)],
            })
          )
          if (report.photo.caption) {
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
                children: [new TextRun({ text: report.photo.caption, italics: true, font: FONT, size: 20 })],
              })
            )
          }
        } else if (report.photo.caption) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
              children: [new TextRun({ text: report.photo.caption, font: FONT, size: DEFAULT_SIZE })],
            })
          )
        }
        break
      case 'summary':
        children.push(...sectionTitle(section, 'Summary'), ...blocksToParagraphs(report.summary))
        break
      case 'outcomes':
        children.push(...sectionTitle(section, 'Key Outcomes'))
        report.outcomes.filter((o) => o.trim()).forEach((o) =>
          children.push(
            new Paragraph({
              numbering: { reference: 'bullets', level: 0 },
              indent: { left: 720, hanging: 360 },
              spacing: { after: 60, line: LINE_SPACING },
              children: [new TextRun({ text: o, font: FONT, size: DEFAULT_SIZE })],
            })
          )
        )
        break
      case 'conclusion':
        children.push(...sectionTitle(section, 'Conclusion'), ...blocksToParagraphs(report.conclusion))
        break
      case 'organized-by':
        children.push(...sectionTitle(section, 'Organised By'))
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
            children: [
              new TextRun({
                text: report.organizedBy || eventInfo.organisedBy || `${eventInfo.department}\n${eventInfo.collegeName}`,
                font: FONT,
                size: DEFAULT_SIZE,
              }),
            ],
          })
        )
        break
      case 'snapshots': {
        children.push(...sectionTitle(section, 'Snapshots'))
        const imgs = report.snapshots.filter((s) => s.dataUrl)
        if (imgs.length) {
          const rows: TableRow[] = []
          for (let i = 0; i < imgs.length; i += 2) {
            const slice = imgs.slice(i, i + 2)
            const cells = slice.map(
              (img) =>
                new TableCell({
                  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 40, line: LINE_SPACING },
                      children: [imageRun(img.dataUrl, 280, 200)],
                    }),
                    img.caption
                      ? new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 60, line: LINE_SPACING },
                          children: [new TextRun({ text: img.caption, font: FONT, size: 20, italics: true })],
                        })
                      : new Paragraph({ spacing: { after: 60 }, children: [] }),
                  ],
                })
            )
            rows.push(new TableRow({ children: cells }))
          }
          children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
        }
        break
      }
      case 'certificates': {
        children.push(...sectionTitle(section, 'Certificates'))
        const imgs = report.certificates.filter((c) => c.dataUrl)
        if (imgs.length) {
          const rows: TableRow[] = []
          for (let i = 0; i < imgs.length; i += 2) {
            const slice = imgs.slice(i, i + 2)
            const cells = slice.map(
              (img) =>
                new TableCell({
                  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 40, line: LINE_SPACING },
                      children: [imageRun(img.dataUrl, 280, 240)],
                    }),
                    img.caption
                      ? new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 60, line: LINE_SPACING },
                          children: [new TextRun({ text: img.caption, font: FONT, size: 20, italics: true })],
                        })
                      : new Paragraph({ spacing: { after: 60 }, children: [] }),
                  ],
                })
            )
            rows.push(new TableRow({ children: cells }))
          }
          children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
        }
        break
      }
      case 'press-coverage': {
        children.push(...sectionTitle(section, 'Press Coverage'))
        const coverage = report.pressCoverage.filter((p) => p.dataUrl)
        if (coverage.length) {
          const rows: TableRow[] = []
          for (let i = 0; i < coverage.length; i += 2) {
            const slice = coverage.slice(i, i + 2)
            const cells = slice.map(
              (p) =>
                new TableCell({
                  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 40, line: LINE_SPACING },
                      children: [imageRun(p.dataUrl, 280, 200)],
                    }),
                    p.publication
                      ? new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 20, line: LINE_SPACING },
                          children: [new TextRun({ text: p.publication, font: FONT, size: 20 })],
                        })
                      : new Paragraph({ spacing: { after: 20 }, children: [] }),
                    p.caption
                      ? new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 60, line: LINE_SPACING },
                          children: [new TextRun({ text: p.caption, font: FONT, size: 20, italics: true })],
                        })
                      : new Paragraph({ spacing: { after: 60 }, children: [] }),
                  ],
                })
            )
            rows.push(new TableRow({ children: cells }))
          }
          children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
        }
        break
      }
      case 'custom': {
        const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
        if (custom) {
          children.push(...sectionTitle(section, custom.title))
          if (custom.layout === 'photo') {
            const img = custom.images.find((i) => i.dataUrl)
            if (img) {
              children.push(
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 60, line: LINE_SPACING },
                  children: [imageRun(img.dataUrl, 400, 300)],
                })
              )
              if (img.caption) {
                children.push(
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING },
                    children: [new TextRun({ text: img.caption, italics: true, font: FONT, size: 20 })],
                  })
                )
              }
            }
          } else if (custom.layout === 'gallery') {
            const imgs = custom.images.filter((i) => i.dataUrl)
            if (imgs.length) {
              const rows: TableRow[] = []
              for (let i = 0; i < imgs.length; i += 2) {
                const slice = imgs.slice(i, i + 2)
                const cells = slice.map(
                  (img) =>
                    new TableCell({
                      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                      width: { size: 45, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 40, line: LINE_SPACING },
                          children: [imageRun(img.dataUrl, 280, 200)],
                        }),
                        img.caption
                          ? new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { after: 60, line: LINE_SPACING },
                              children: [new TextRun({ text: img.caption, font: FONT, size: 20, italics: true })],
                            })
                          : new Paragraph({ spacing: { after: 60 }, children: [] }),
                      ],
                    })
                )
                rows.push(new TableRow({ children: cells }))
              }
              children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
            }
          } else {
            children.push(...blocksToParagraphs(custom.content))
          }
        }
        break
      }
    }
  }

  return new Document({
    creator: 'Khalsa College Event Report',
    title: report.eventInfo.eventName,
    description: 'Event Report',
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
        },
        {
          reference: 'numbers',
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: DEFAULT_SIZE },
          paragraph: { spacing: { after: PARAGRAPH_AFTER, line: LINE_SPACING } },
        },
        heading1: {
          run: { font: FONT, size: HEADING_SIZE, bold: true },
          paragraph: { spacing: { before: 240, after: 120, line: LINE_SPACING } },
        },
        heading2: {
          run: { font: FONT, size: HEADING2_SIZE, bold: true },
          paragraph: { spacing: { before: 200, after: 100, line: LINE_SPACING } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.85),
              right: convertInchesToTwip(0.85),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
                ],
              }),
            ],
          }),
        },
        children: children as any,
      },
    ],
  })
}

export async function exportDocx(report: Report) {
  const doc = buildDocument(report)
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${exportFileName(report.eventInfo.eventName, report.eventInfo.date)}.docx`)
}
