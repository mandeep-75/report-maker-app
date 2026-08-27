import { useState, useEffect } from 'react'
import { TopNav } from './components/TopNav'
import { EditorWorkspace } from './components/EditorWorkspace'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ToastContainer } from './components/UI/Toast'
import { useReportStore } from './store/reportStore'
import { useAutosave } from './hooks/useAutosave'
import { useSettings } from './store/settingsStore'
import {
  listRecentReports,
  loadRecentReport,
  deleteRecentReport,
  RecentMeta,
} from './utils/storage'
import { createBlankReport, buildTemplate } from './data/templates'

type Screen = 'home' | 'settings' | 'editor'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [recent, setRecent] = useState<RecentMeta[]>([])
  const setReport = useReportStore((s) => s.setReport)
  const applyInstitution = useSettings((s) => s.applyInstitution)
  const appearance = useSettings((s) => s.appearance)
  useAutosave()

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', appearance === 'dark')
  }, [appearance])

  const refreshRecent = () => listRecentReports().then(setRecent)
  useEffect(() => {
    refreshRecent()
  }, [])

  const goEditor = () => setScreen('editor')

  const handleNew = () => {
    const report = createBlankReport()
    applyInstitution(report)
    setReport(report)
    goEditor()
  }

  const handleUseTemplate = (id: string) => {
    const report = buildTemplate(id)
    if (report) {
      setReport(report)
      goEditor()
    }
  }

  const handleOpenRecent = (id: string) => {
    loadRecentReport(id).then((report) => {
      if (report) {
        setReport(report)
        goEditor()
      }
    })
  }

  const handleDeleteRecent = (id: string) => {
    deleteRecentReport(id).then(refreshRecent)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-alt">
      {screen === 'editor' ? (
        <EditorWorkspace onBack={() => setScreen('home')} />
      ) : (
        <>
          <TopNav active={screen} onNavigate={setScreen} onNew={handleNew} />
          <main className="flex-1 overflow-hidden">
            {screen === 'home' && (
              <HomeScreen
                onNew={handleNew}
                onUseTemplate={handleUseTemplate}
                onOpenRecent={handleOpenRecent}
                onDeleteRecent={handleDeleteRecent}
                recent={recent}
              />
            )}
            {screen === 'settings' && <SettingsScreen />}
          </main>
        </>
      )}
      <ToastContainer />
    </div>
  )
}
