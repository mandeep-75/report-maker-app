import { useReportStore } from '../../store/reportStore'
import { Sidebar } from './Sidebar'
import { EventInfoForm } from './EventInfoForm'
import { ThemeEditor } from './ThemeEditor'
import { ResourcePersonForm } from './ResourcePersonForm'
import { BrochureEditor } from './BrochureEditor'
import { SummaryEditor } from './SummaryEditor'
import { OutcomesEditor } from './OutcomesEditor'
import { ConclusionEditor } from './ConclusionEditor'
import { SnapshotsEditor } from './SnapshotsEditor'
import { CertificatesEditor } from './CertificatesEditor'
import { PressCoverageEditor } from './PressCoverageEditor'
import { CustomSectionEditor } from './CustomSectionEditor'
import { Input } from '../UI/Input'
import { ScrollArea } from '../UI/ScrollArea'

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
      case 'custom':
        return <CustomSectionEditor id={active.id.replace('section-custom-', '')} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-border bg-surface">
        <Sidebar />
      </div>
      <ScrollArea className="flex-1 p-4">
        <h2 className="mb-3 text-base font-semibold text-text">
          {active?.label ?? 'Editor'}
        </h2>
        {renderContent()}
      </ScrollArea>
    </div>
  )
}
