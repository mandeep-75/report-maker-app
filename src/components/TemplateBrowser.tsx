import { useState } from 'react'
import { TEMPLATES, ReportTemplate } from '../data/templates'
import { TemplateCard, TemplatePreviewModal } from './TemplateCard'

export function TemplateBrowser({ onUse }: { onUse: (id: string) => void }) {
  const [preview, setPreview] = useState<ReportTemplate | null>(null)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onPreview={() => setPreview(t)}
          />
        ))}
      </div>

      {preview && (
        <TemplatePreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onUse={() => {
            onUse(preview.id)
            setPreview(null)
          }}
        />
      )}
    </div>
  )
}
