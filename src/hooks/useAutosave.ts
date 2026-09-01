import { useEffect, useRef } from 'react'
import { useReportStore } from '../store/reportStore'
import { saveAutosave, saveRecentReport } from '../utils/storage'

export function useAutosave() {
  const report = useReportStore((s) => s.report)
  const hydrated = useReportStore((s) => s.hydrated)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveAutosave(report).catch(() => {
        /* ignore storage errors */
      })
      saveRecentReport(report).catch(() => {
        /* ignore storage errors */
      })
    }, 800)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [report, hydrated])
}
