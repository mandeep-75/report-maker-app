/**
 * Rich-text HTML (produced by TipTap) → shared document blocks.
 *
 * Runs keep inline emphasis (bold/italic/underline) so both renderers preserve
 * user formatting. Empty / whitespace-only blocks are dropped.
 */

import { DocAlign, DocTextRun, DocBlock } from './model'

export interface HtmlParseResult {
  blocks: DocBlock[]
  /** Number of <table> blocks parsed (rendered as tables). */
  tables: number
}

let idSeq = 0
function nextId(prefix: string): string {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

/** Inline containers we do not descend into from run collection. */
const BLOCK_TAGS = new Set(['ul', 'ol', 'table', 'blockquote'])

function runStyles(node: Element, inherited: Partial<DocTextRun>): {
  bold?: boolean
  italic?: boolean
  underline?: boolean
} {
  const tag = node.tagName.toLowerCase()
  return {
    bold: inherited.bold || tag === 'b' || tag === 'strong',
    italic: inherited.italic || tag === 'i' || tag === 'em',
    underline: inherited.underline || tag === 'u',
  }
}

function collectRuns(el: HTMLElement, inherited: Partial<DocTextRun> = {}): DocTextRun[] {
  const out: DocTextRun[] = []
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? ''
      if (text) out.push({ text, ...inherited })
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const c = child as HTMLElement
      const tag = c.tagName.toLowerCase()
      if (tag === 'br') {
        out.push({ text: '\n', ...inherited })
        return
      }
      if (BLOCK_TAGS.has(tag)) return
      out.push(...collectRuns(c, runStyles(c, inherited)))
    }
  })
  return out
}

function blockAlign(el: HTMLElement): DocAlign | undefined {
  const style = el.getAttribute?.('style') ?? ''
  const m = /text-align\s*:\s*(left|center|right|justify)/i.exec(style)
  if (m) return m[1] as DocAlign
  const cls = (el.className as string | undefined) ?? ''
  if (/text-align-center/.test(cls)) return 'center'
  if (/text-align-justify/.test(cls)) return 'justify'
  return undefined
}

function textContent(el: HTMLElement): string {
  return el.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function hasText(run: DocTextRun): boolean {
  return run.text.trim().length > 0
}

function parseTable(table: HTMLTableElement): DocBlock {
  const headers: string[] = []
  const rows: DocTextRun[][][] = []
  const cellRuns = (cell: HTMLElement): DocTextRun[] => {
    const runs = collectRuns(cell).filter(hasText)
    return runs.length ? runs : [{ text: cell.textContent?.trim() ?? '' }]
  }

  table.querySelectorAll('tr').forEach((tr) => {
    const isHeader = tr.closest('thead') !== null || tr.querySelectorAll('th').length > 0
    const cells = Array.from(tr.children).filter(
      (c): c is HTMLTableCellElement => c.tagName === 'TD' || c.tagName === 'TH'
    )
    if (cells.length === 0) return
    if (isHeader) {
      headers.length = 0
      cells.forEach((c) => headers.push(textContent(c)))
    } else {
      rows.push(cells.map(cellRuns))
    }
  })

  return {
    kind: 'table',
    id: nextId('table'),
    headers: headers.length ? headers : undefined,
    rows,
  }
}

/** Convert TipTap HTML into shared blocks. Order-preserving. */
export function htmlToDoc(html: string): HtmlParseResult {
  const blocks: DocBlock[] = []
  let tables = 0
  if (!html || !html.trim()) return { blocks, tables: 0 }

  const root = document.createElement('div')
  root.innerHTML = html

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? ''
      if (t.trim()) blocks.push({ kind: 'paragraph', id: nextId('p'), runs: [{ text: t }] })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    switch (tag) {
      case 'p':
      case 'div': {
        const runs = collectRuns(el).filter(hasText)
        if (!runs.length) return
        const align = blockAlign(el)
        blocks.push({ kind: 'paragraph', id: nextId('p'), runs, align })
        return
      }
      case 'h1':
      case 'h2':
      case 'h3': {
        const runs = collectRuns(el).filter(hasText)
        if (!runs.length) return
        blocks.push({
          kind: 'heading',
          id: nextId('h'),
          text: runs.map((r) => r.text).join(''),
          level: tag === 'h1' ? 1 : 2,
        })
        return
      }
      case 'ul': {
        const items = Array.from(el.querySelectorAll(':scope > li'))
          .map((li) => {
            const runs = collectRuns(li as HTMLElement).filter(hasText)
            return { id: nextId('li'), runs }
          })
          .filter((it) => it.runs.length)
        if (items.length) blocks.push({ kind: 'list', id: nextId('list'), ordered: false, items })
        return
      }
      case 'ol': {
        const items = Array.from(el.querySelectorAll(':scope > li'))
          .map((li) => {
            const runs = collectRuns(li as HTMLElement).filter(hasText)
            return { id: nextId('li'), runs }
          })
          .filter((it) => it.runs.length)
        if (items.length) blocks.push({ kind: 'list', id: nextId('list'), ordered: true, items })
        return
      }
      case 'blockquote':
      case 'quote': {
        const runs = collectRuns(el).filter(hasText)
        if (runs.length) blocks.push({ kind: 'quote', id: nextId('q'), runs })
        return
      }
      case 'table': {
        tables += 1
        blocks.push(parseTable(el as HTMLTableElement))
        return
      }
      case 'li': {
        const runs = collectRuns(el).filter(hasText)
        if (runs.length)
          blocks.push({
            kind: 'list',
            id: nextId('list'),
            ordered: false,
            items: [{ id: nextId('li'), runs }],
          })
        return
      }
      case 'br':
      case 'img':
        return
      default: {
        // Unwrap container content, preserving block children when present.
        let hasBlockChild = false
        for (const child of el.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const ctag = (child as HTMLElement).tagName.toLowerCase()
            if (['p', 'div', 'h1', 'h2', 'h3', 'ul', 'ol', 'blockquote', 'table', 'li'].includes(ctag)) {
              visit(child)
              hasBlockChild = true
            }
          }
        }
        if (!hasBlockChild) {
          const runs = collectRuns(el).filter(hasText)
          if (runs.length) blocks.push({ kind: 'paragraph', id: nextId('p'), runs })
        }
        return
      }
    }
  }

  for (const child of Array.from(root.childNodes)) visit(child)
  return { blocks, tables }
}

/** Plain-text extraction (used for empty-section checks without a re-parse). */
export function htmlToPlainText(html: string): string {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}