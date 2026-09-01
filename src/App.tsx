import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
  loadAutosave,
  deleteRecentReport,
  RecentMeta,
} from './utils/storage'
import { createBlankReport, buildTemplate, mergeReport } from './data/templates'

function AppContent() {
  useAutosave()
  const navigate = useNavigate()
  const location = useLocation()
  const setReport = useReportStore((s) => s.setReport)
  const setHydrated = useReportStore((s) => s.setHydrated)
  const applyInstitution = useSettings((s) => s.applyInstitution)
  const appearance = useSettings((s) => s.appearance)
  const [recent, setRecent] = useState<RecentMeta[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', appearance === 'dark')
  }, [appearance])

  useEffect(() => {
    loadAutosave()
      .then((saved) => {
        if (saved) {
          setReport(saved)
        }
      })
      .catch(() => {})
      .finally(() => {
        setHydrated(true)
      })
  }, [])

  const refreshRecent = () => listRecentReports().then(setRecent)
  useEffect(() => {
    refreshRecent()
  }, [])

  const goEditor = () => navigate('/editor')

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

  const handleImportJson = (text: string) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      alert('The file is not valid JSON. Please choose a report .json file.')
      return
    }
    const report = mergeReport(parsed)
    if (!report) {
      alert('Could not read this file as a report. Please choose a valid report .json file.')
      return
    }
    setReport(report)
    goEditor()
  }

  const onTopNav = (s: 'home' | 'settings') => navigate(s === 'settings' ? '/settings' : '/')

  if (location.pathname === '/editor') {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-surface-alt">
        <EditorWorkspace onBack={() => navigate('/')} />
        <ToastContainer />
        <CreditTag />
      </div>
    )
  }

  const activeScreen: 'home' | 'settings' = location.pathname === '/settings' ? 'settings' : 'home'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-alt">
      <TopNav active={activeScreen} onNavigate={onTopNav} />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <HomeScreen
                onNew={handleNew}
                onUseTemplate={handleUseTemplate}
                onOpenRecent={handleOpenRecent}
                onDeleteRecent={handleDeleteRecent}
                onImportJson={handleImportJson}
                recent={recent}
              />
            }
          />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
      <ToastContainer />
      <CreditTag />
    </div>
  )
}

function CreditTag() {
  return (
    <a
      href="https://mandeep-75.github.io/Mandeep.dev/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 right-3 text-xs text-text-muted opacity-80 hover:opacity-100"
      title="View portfolio"
    >
      made by Mandeep
    </a>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
