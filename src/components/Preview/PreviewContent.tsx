import { useReportStore } from '../../store/reportStore'
import { sortedSections } from '../../utils/sectionOrder'
import { renderSectionPage } from './PageRenderer'
import { isSectionEmpty } from '../../utils/sectionEmpty'
import { useRef, useState, useLayoutEffect, useMemo } from 'react'
import type { Report, Section } from '../../data/reportSchema'

export function PreviewContent() {
  const report = useReportStore((s) => s.report)
  const compact = useReportStore((s) => s.compact)

  const sections = useMemo(() => {
    let s = sortedSections(report.sections).filter((x) => x.visible)
    if (compact) s = s.filter((x) => !isSectionEmpty(x, report))
    return s
  }, [report, compact])

  if (!compact) {
    return (
      <>
        {sections.map((section) => {
          const content = renderSectionPage(section, report)
          if (content === null) return null
          return (
            <div className="page page-single" id={`sec-${section.id}`} key={section.id}>
              {content}
            </div>
          )
        })}
      </>
    )
  }

  return <PaginatedFlow sections={sections} report={report} />
}

function PaginatedFlow({ sections, report }: { sections: Section[]; report: Report }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageW, setPageW] = useState(0)
  const [pages, setPages] = useState<string[][]>([])

  const content = sections.map((s) => {
    const c = renderSectionPage(s, report)
    if (c === null) return null
    return (
      <div className="section-block paginate-item" id={`sec-${s.id}`} key={s.id}>
        {c}
      </div>
    )
  })

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const update = () => setPageW(wrap.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const root = measureRef.current
    if (!root || pageW === 0) {
      setPages([])
      return
    }
    setPages(paginate(root, pageW))
  }, [pageW, sections])

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div
        ref={measureRef}
        className="page"
        style={{ position: 'absolute', left: -99999, top: 0, visibility: 'hidden', width: pageW || '100%' }}
      >
        {content}
      </div>
      {pages.map((pg, i) => (
        <div className="page" key={i}>
          {pg.map((html, j) => (
            <div key={j} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function cloneEl(n: HTMLElement): HTMLElement {
  return n.cloneNode(true) as HTMLElement
}

// Split `node` into cloned fragments that each fit within pageH, preserving
// wrapper elements so descendant-selector styles (.prose p, .gallery-grid img…) survive.
function fragmentNode(node: HTMLElement, pageH: number, scratch: HTMLElement, out: HTMLElement[]) {
  if (node.offsetHeight <= pageH) {
    out.push(cloneEl(node))
    return
  }
  const kids = Array.from(node.children) as HTMLElement[]
  if (kids.length === 0) {
    out.push(cloneEl(node))
    return
  }

  const childFrags: { el: HTMLElement; h: number }[] = []
  for (const k of kids) {
    const frags: HTMLElement[] = []
    fragmentNode(k, pageH, scratch, frags)
    for (const f of frags) {
      scratch.appendChild(f)
      const h = f.offsetHeight
      scratch.removeChild(f)
      childFrags.push({ el: f, h })
    }
  }

  let i = 0
  while (i < childFrags.length) {
    const wrapper = cloneEl(node)
    wrapper.innerHTML = ''
    let used = 0
    while (i < childFrags.length && (used === 0 || used + childFrags[i].h <= pageH)) {
      wrapper.appendChild(childFrags[i].el)
      used += childFrags[i].h
      i++
    }
    out.push(wrapper)
  }
}

function paginate(root: HTMLElement, pageW: number): string[][] {
  const contentW = pageW * 0.86
  const pageH = Math.round(pageW * (297 / 210) - pageW * 0.12 - 4)

  const scratch = document.createElement('div')
  scratch.style.cssText = `position:absolute;left:-99999px;top:0;visibility:hidden;width:${contentW}px;`
  root.appendChild(scratch)

  const blocks = Array.from(root.querySelectorAll(':scope > .section-block')) as HTMLElement[]
  const frags: HTMLElement[] = []
  for (const b of blocks) {
    const fs: HTMLElement[] = []
    fragmentNode(b, pageH, scratch, fs)
    if (fs.length && b.id) fs[0].id = b.id
    frags.push(...fs)
  }

  const heights = frags.map((f) => {
    scratch.appendChild(f)
    const h = f.offsetHeight
    scratch.removeChild(f)
    return h
  })

  const pages: string[][] = [[]]
  let pi = 0
  let used = 0
  for (let i = 0; i < frags.length; i++) {
    const h = heights[i]
    if (used > 0 && used + h > pageH) {
      pi++
      used = 0
      pages.push([])
    }
    pages[pi].push(frags[i].outerHTML)
    used += h
  }

  root.removeChild(scratch)
  return pages
}
