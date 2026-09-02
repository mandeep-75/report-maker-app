import { useState, useRef, useCallback } from 'react'
import { Toolbar } from './Toolbar/Toolbar'
import { EditorPanel } from './Editor/EditorPanel'
import { PreviewPanel } from './Preview/PreviewPanel'

export function EditorWorkspace({ onBack }: { onBack: () => void }) {
  const [editorPct, setEditorPct] = useState(52)
  const dragging = useRef(false)

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

  return (
    <div className="flex h-full flex-col">
      <Toolbar onBack={onBack} />
      <div className="flex flex-1 overflow-hidden">
        <div className="overflow-hidden" style={{ width: `${editorPct}%` }}>
          <EditorPanel />
        </div>
        <div
          onMouseDown={onMouseDown}
          className="group relative flex w-1.5 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/60"
          title="Drag to resize"
        >
          <span className="absolute h-10 w-1 rounded-full bg-transparent transition-colors group-hover:bg-primary" />
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>
      </div>
    </div>
  )
}
