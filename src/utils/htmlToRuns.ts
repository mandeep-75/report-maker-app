export interface Run {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export interface Block {
  type: 'paragraph' | 'heading1' | 'heading2' | 'bullet' | 'numbered' | 'quote'
  runs: Run[]
}

export function htmlToBlocks(html: string): Block[] {
  if (!html) return []
  const div = document.createElement('div')
  div.innerHTML = html
  return robustParse(div)
}

// Parser that collects runs per block and preserves inline emphasis.
function robustParse(root: HTMLElement): Block[] {
  const blocks: Block[] = []
  const inlineRuns = (el: HTMLElement): Run[] => {
    const runs: Run[] = []
    const collect = (node: ChildNode, style: Partial<Run> = {}) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent ?? ''
          if (t) runs.push({ text: t, ...style })
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const c = child as HTMLElement
          const tag = c.tagName.toLowerCase()
          const s: Partial<Run> = {
            bold: style.bold || ['B', 'STRONG'].includes(c.tagName),
            italic: style.italic || tag === 'em' || tag === 'i',
            underline: style.underline || tag === 'u',
          }
          collect(c, s)
        }
      })
    }
    collect(el)
    return runs.length ? runs : [{ text: el.textContent ?? '' }]
  }

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? ''
      if (t.trim()) blocks.push({ type: 'paragraph', runs: [{ text: t }] })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    if (tag === 'p' || tag === 'div') {
      blocks.push({ type: 'paragraph', runs: inlineRuns(el) })
    } else if (tag === 'h1') {
      blocks.push({ type: 'heading1', runs: inlineRuns(el) })
    } else if (tag === 'h2') {
      blocks.push({ type: 'heading2', runs: inlineRuns(el) })
    } else if (tag === 'blockquote' || tag === 'quote') {
      blocks.push({ type: 'quote', runs: inlineRuns(el) })
    } else if (tag === 'ul') {
      el.querySelectorAll('li').forEach((li) => {
        blocks.push({ type: 'bullet', runs: inlineRuns(li as HTMLElement) })
      })
    } else if (tag === 'ol') {
      el.querySelectorAll('li').forEach((li) => {
        blocks.push({ type: 'numbered', runs: inlineRuns(li as HTMLElement) })
      })
    } else if (tag === 'li') {
      blocks.push({ type: 'bullet', runs: inlineRuns(el) })
    } else {
      blocks.push({ type: 'paragraph', runs: [{ text: el.textContent ?? '' }] })
    }
  })

  return blocks
}
