import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { Textarea } from '../UI/Textarea'
import { Select } from '../UI/Select'
import { ResourcePersonForm } from './ResourcePersonForm'
import { AIStubButton } from './AIStubButton'

export function EventInfoForm() {
  const eventInfo = useReportStore((s) => s.report.eventInfo)
  const updateEventInfo = useReportStore((s) => s.updateEventInfo)

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="College Name"
        value={eventInfo.collegeName}
        onChange={(e) => updateEventInfo({ collegeName: e.target.value })}
        placeholder="e.g. Govt. College"
      />
      <Input
        label="Department"
        value={eventInfo.department}
        onChange={(e) => updateEventInfo({ department: e.target.value })}
        placeholder="e.g. Department of Computer Science"
      />
      <Input
        label="Report Title"
        value={eventInfo.reportTitle}
        onChange={(e) => updateEventInfo({ reportTitle: e.target.value })}
        placeholder="e.g. Report on National Seminar"
      />
      <Input
        label="Event Name"
        value={eventInfo.eventName}
        onChange={(e) => updateEventInfo({ eventName: e.target.value })}
        placeholder="e.g. AI Workshop 2026"
      />
      <Input
        label="Theme"
        value={eventInfo.theme}
        onChange={(e) => updateEventInfo({ theme: e.target.value })}
        placeholder="e.g. Empowering Future with AI"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          icon="calendar"
          value={eventInfo.date}
          onChange={(e) => updateEventInfo({ date: e.target.value })}
        />
        <Input
          label="Time"
          value={eventInfo.time}
          onChange={(e) => updateEventInfo({ time: e.target.value })}
          placeholder="e.g. 10:00 AM"
        />
      </div>
      <Input
        label="Venue"
        value={eventInfo.venue}
        onChange={(e) => updateEventInfo({ venue: e.target.value })}
        placeholder="e.g. Seminar Hall, Block B"
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Mode"
          value={eventInfo.mode}
          onChange={(e) => updateEventInfo({ mode: e.target.value as 'Offline' | 'Online' | 'Hybrid' })}
          options={[
            { value: 'Offline', label: 'Offline' },
            { value: 'Online', label: 'Online' },
            { value: 'Hybrid', label: 'Hybrid' },
          ]}
        />
        <Input
          label="Academic Session"
          value={eventInfo.academicSession}
          onChange={(e) => updateEventInfo({ academicSession: e.target.value })}
          placeholder="2026–27"
        />
      </div>
      <Input
        label="Organised By"
        value={eventInfo.organisedBy}
        onChange={(e) => updateEventInfo({ organisedBy: e.target.value })}
        placeholder="e.g. Dept. of CS, Govt. College"
      />
      <Textarea
        label="Tagline / Message"
        value={eventInfo.tagline}
        onChange={(e) => updateEventInfo({ tagline: e.target.value })}
        placeholder="A short motivational line for the cover"
      />
      <AIStubButton
        label="AI Suggest Tagline"
        context={`Event: ${eventInfo.eventName || 'a college event'}. Theme: ${eventInfo.theme || 'unspecified'}.`}
        prompt="Suggest one short, motivational tagline for an event report cover. Return only the tagline text, no quotes or explanation."
        onResult={(text) => updateEventInfo({ tagline: text })}
      />
      <div className="mt-2 border-t border-border pt-3">
        <h3 className="mb-2 text-sm font-semibold text-text">Resource Person</h3>
        <ResourcePersonForm />
      </div>
    </div>
  )
}
