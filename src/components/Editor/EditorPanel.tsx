import { useReportStore } from '../../store/reportStore'
import { useEffect, useState } from 'react'
import { Section } from '../../data/reportSchema'
import { Sidebar } from './Sidebar'
import { EventInfoForm } from './EventInfoForm'
import { ThemeEditor } from './ThemeEditor'
import { ResourcePersonForm } from './ResourcePersonForm'
import { BrochureEditor } from './BrochureEditor'
import { PhotoEditor } from './PhotoEditor'
import { SummaryEditor } from './SummaryEditor'
import { OutcomesEditor } from './OutcomesEditor'
import { ConclusionEditor } from './ConclusionEditor'
import { SnapshotsEditor } from './SnapshotsEditor'
import { CertificatesEditor } from './CertificatesEditor'
import { PressCoverageEditor } from './PressCoverageEditor'
import { Input } from '../UI/Input'
import { ScrollArea } from '../UI/ScrollArea'
import { Toggle } from '../UI/Toggle'

function SectionHeadingEditor({ section }: { section: Section }) {
  const updateSectionLabel = useReportStore((s) => s.updateSectionLabel)
  const toggleSectionHeading = useReportStore((s) => s.toggleSectionHeading)
  const [draft, setDraft] = useState(section.label)

  useEffect(() => setDraft(section.label), [section.id, section.label])

  const commit = () => updateSectionLabel(section.id, draft)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(section.label)
            e.currentTarget.blur()
          }
        }}
        aria-label="Section name"
        className="focus-ring w-full max-w-xs rounded-lg border border-border bg-surface px-3 py-1.5 text-base font-semibold text-text"
      />
      <span className="text-xs text-text-muted">Section heading name</span>
      {section.type !== 'event-info' && (
        <Toggle
          checked={section.showHeading !== false}
          onChange={() => toggleSectionHeading(section.id)}
          label="Show heading"
        />
      )}
    </div>
  )
}

function OrganisedByEditor() {
  const organizedBy = useReportStore((s) => s.report.organizedBy)
  const updateEventInfo = useReportStore((s) => s.updateEventInfo)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-muted">
        This text appears on the dedicated "Organised By" page.
      </p>
      <Input
        label="Organised By"
        value={organizedBy}
        onChange={(e) => updateEventInfo({ organisedBy: e.target.value })}
        placeholder="Department Name, College Name"
      />
    </div>
  )
}

export function EditorPanel() {
  const report = useReportStore((s) => s.report)
  const activeSectionId = useReportStore((s) => s.activeSectionId)
  const active = report.sections.find((s) => s.id === activeSectionId)

  const renderContent = () => {
    if (!active) {
      return (
        <p className="text-sm text-text-muted">Select a section from the left to edit.</p>
      )
    }
    switch (active.type) {
      case 'event-info':
        return <EventInfoForm />
      case 'theme':
        return <ThemeEditor />
      case 'resource-person':
        return <ResourcePersonForm />
      case 'brochure':
        return <BrochureEditor />
      case 'photo':
        return <PhotoEditor />
      case 'summary':
        return <SummaryEditor />
      case 'outcomes':
        return <OutcomesEditor />
      case 'conclusion':
        return <ConclusionEditor />
      case 'organized-by':
        return <OrganisedByEditor />
      case 'snapshots':
        return <SnapshotsEditor />
      case 'certificates':
        return <CertificatesEditor />
      case 'press-coverage':
        return <PressCoverageEditor />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-border bg-surface">
        <Sidebar />
      </div>
      <ScrollArea className="flex-1 p-5">
        <div className="flex min-h-full flex-col">
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-3">
            {active ? (
              <SectionHeadingEditor key={active.id} section={active} />
            ) : (
              <>
                <h2 className="text-base font-semibold text-text">Editor</h2>
                <span className="h-1 w-1 rounded-full bg-border-dark" />
                <span className="text-xs text-text-muted">No section selected</span>
              </>
            )}
          </div>
          <div className="flex flex-1 flex-col">{renderContent()}</div>
        </div>
      </ScrollArea>
    </div>
  )
}
