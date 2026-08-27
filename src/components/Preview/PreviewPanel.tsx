import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { PreviewContent } from './PreviewContent'
import { PREVIEW_CSS } from './previewCss'

const A4_RATIO = 297 / 210

export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const report = useReportStore((s) => s.report)
  const zoom = useReportStore((s) => s.previewZoom)
  const setZoom = useReportStore((s) => s.setPreviewZoom)
  const page = useReportStore((s) => s.previewPage)
  const setPage = useReportStore((s) => s.setPreviewPage)
  const activeSectionId = useReportStore((s) => s.activeSectionId)

  const [doc, setDoc] = useState<Document | null>(null)
  const [paneWidth, setPaneWidth] = useState(794)
  const [pageCount, setPageCount] = useState(1)
  const [docHeight, setDocHeight] = useState(paneWidth * A4_RATIO)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setPaneWidth(Math.max(280, el.clientWidth - 32))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const idoc = iframe.contentDocument
    if (!idoc) return
    idoc.open()
    idoc.write(
      `<!doctype html><html><head><style>${PREVIEW_CSS}</style></head><body><div id="root"></div></body></html>`
    )
    idoc.close()
    setDoc(idoc)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    const container = containerRef.current
    if (!iframe || !iframe.contentDocument || !container) return
    const idoc = iframe.contentDocument
    iframe.style.height = `${idoc.body.scrollHeight}px`
    const pageH = paneWidth * A4_RATIO
    const pages = Math.max(1, Math.ceil(idoc.body.scrollHeight / pageH))
    setPageCount(pages)
    setDocHeight(idoc.body.scrollHeight)
    container.scrollTo({ top: Math.max(0, page * pageH * zoom - 12), behavior: 'smooth' })
  }, [page, doc, report, zoom, paneWidth])

  useEffect(() => {
    const iframe = iframeRef.current
    const container = containerRef.current
    if (!iframe || !iframe.contentDocument || !container || !activeSectionId) return
    const idoc = iframe.contentDocument
    const el = idoc.getElementById(`sec-${activeSectionId}`)
    if (!el) return
    const pageH = paneWidth * A4_RATIO
    const offset = el.offsetTop
    setPage(Math.max(0, Math.floor(offset / pageH)))
    container.scrollTo({ top: Math.max(0, offset * zoom - 12), behavior: 'smooth' })
  }, [activeSectionId, doc, report, zoom, paneWidth, setPage])

  const clampPage = (p: number) => Math.max(0, Math.min(pageCount - 1, p))

  return (
    <div className="flex h-full flex-col bg-surface-alt">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Preview
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(clampPage(page - 1))}
            className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-text-muted">
            Page {Math.min(page + 1, pageCount)} / {pageCount}
          </span>
          <button
            onClick={() => setPage(clampPage(page + 1))}
            className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="mx-1 h-4 w-px bg-border" />
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-xs text-text-muted">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="ml-2 rounded bg-surface px-2 py-0.5 text-[10px] text-text-muted">
            A4 · Portrait
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        <div
          style={{
            width: paneWidth * zoom,
            height: docHeight * zoom,
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Report Preview"
            scrolling="no"
            style={{
              width: paneWidth,
              display: 'block',
              border: 'none',
              borderRadius: 4,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
            }}
          />
        </div>
      </div>
      {doc && createPortal(<PreviewContent />, doc.getElementById('root')!)}
    </div>
  )
}
