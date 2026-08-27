import { useState, useRef, useCallback, useEffect } from 'react'
import { Toolbar, StartScreen } from './components/Toolbar/Toolbar'
import { EditorPanel } from './components/Editor/EditorPanel'
import { PreviewPanel } from './components/Preview/PreviewPanel'
import { ToastContainer } from './components/UI/Toast'
import { useReportStore } from './store/reportStore'
import { useAutosave } from './hooks/useAutosave'
import { loadAutosave } from './utils/storage'
import { TEMPLATES, buildTemplate, createDefaultReport } from './data/templates'

export default function App() {
  const [started, setStarted] = useState(false)
  const [hasAutosave, setHasAutosave] = useState(false)
  const setReport = useReportStore((s) => s.setReport)
  useAutosave()

  useEffect(() => {
    loadAutosave().then((saved) => {
      if (saved && saved.sections && saved.sections.length > 0) {
        setHasAutosave(true)
      }
    })
  }, [])

  const [editorPct, setEditorPct] = useState(52)
  const dragging = useRef(false)

  const handleChoose = (id: string) => {
    const report = buildTemplate(id)
    if (report) {
      setReport(report)
      setStarted(true)
    }
  }

  const handleResume = () => {
    loadAutosave().then((saved) => {
      if (saved && saved.sections && saved.sections.length > 0) {
        setReport(saved)
        setStarted(true)
      }
    })
  }

  const handleNew = () => {
    setReport(createDefaultReport())
    setStarted(true)
  }

  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const pct = (e.clientX / window.innerWidth) * 100
      setEditorPct(Math.min(80, Math.max(20, pct)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  if (!started) {
    return (
      <>
        <StartScreen
          templates={TEMPLATES}
          onChoose={handleChoose}
          onNew={handleNew}
          onResume={hasAutosave ? handleResume : undefined}
        />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="overflow-hidden" style={{ width: `${editorPct}%` }}>
          <EditorPanel />
        </div>
        <div
          onMouseDown={onMouseDown}
          className="w-1.5 cursor-col-resize bg-border transition-colors hover:bg-primary"
          title="Drag to resize"
        />
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
