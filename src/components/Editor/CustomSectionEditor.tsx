import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { Select } from '../UI/Select'
import { RichTextEditor } from './RichTextEditor'

export function CustomSectionEditor({ id }: { id: string }) {
  const custom = useReportStore((s) => s.report.customSections.find((c) => c.id === id))
  const { updateCustomSection, removeCustomSection } = useReportStore()

  if (!custom) return null

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Section Title"
        value={custom.title}
        onChange={(e) => updateCustomSection(id, { title: e.target.value })}
      />
      <Select
        label="Layout"
        value={custom.layout}
        onChange={(e) =>
          updateCustomSection(id, {
            layout: e.target.value as 'text' | 'gallery' | 'list' | 'quote' | 'table',
          })
        }
        options={[
          { value: 'text', label: 'Text' },
          { value: 'gallery', label: 'Gallery' },
          { value: 'list', label: 'Bullet List' },
          { value: 'quote', label: 'Quote' },
          { value: 'table', label: 'Table' },
        ]}
      />
      {custom.layout !== 'gallery' && (
        <div>
          <span className="text-xs font-medium text-text-muted">Content</span>
          <RichTextEditor
            value={custom.content}
            onChange={(html) => updateCustomSection(id, { content: html })}
            placeholder="Write content for this section..."
            className="mt-1"
          />
        </div>
      )}
      <button
        onClick={() => removeCustomSection(id)}
        className="self-start text-xs text-danger hover:underline cursor-pointer"
      >
        Delete section
      </button>
    </div>
  )
}
