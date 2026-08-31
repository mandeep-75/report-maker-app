import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { Select } from '../UI/Select'
import { RichTextEditor } from './RichTextEditor'
import { Button } from '../UI/Button'
import { Upload, Trash2 } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'

export function CustomSectionEditor({ id }: { id: string }) {
  const custom = useReportStore((s) => s.report.customSections.find((c) => c.id === id))
  const { updateCustomSection, removeCustomSection, addCustomSectionImage, removeCustomSectionImage, updateCustomSectionImageCaption } = useReportStore()
  const { pick } = useImageUpload()

  if (!custom) return null

  return (
    <div className="flex h-full flex-col gap-3">
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
            layout: e.target.value as 'text' | 'gallery' | 'photo' | 'list' | 'quote' | 'table',
          })
        }
        options={[
          { value: 'text', label: 'Text' },
          { value: 'gallery', label: 'Gallery' },
          { value: 'photo', label: 'Photo' },
          { value: 'list', label: 'Bullet List' },
          { value: 'quote', label: 'Quote' },
          { value: 'table', label: 'Table' },
        ]}
      />
      {custom.layout === 'photo' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Photo</span>
          {custom.images.length > 0 ? (
            <div className="flex flex-col gap-2">
              <img
                src={custom.images[0].dataUrl}
                alt={custom.title}
                className="max-h-48 rounded border border-border object-contain"
              />
              {custom.images[0].caption !== undefined && (
                <Input
                  label="Caption"
                  value={custom.images[0].caption || ''}
                  onChange={(e) => updateCustomSectionImageCaption(id, custom.images[0].id, e.target.value)}
                  placeholder="Optional caption"
                />
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => pick((url) => {
                    removeCustomSectionImage(id, custom.images[0].id)
                    addCustomSectionImage(id, url, custom.images[0].caption)
                  })}
                >
                  <Upload className="h-4 w-4" /> Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomSectionImage(id, custom.images[0].id)}
                  className="text-danger hover:text-danger-hover"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => pick((url) => addCustomSectionImage(id, url))}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-text-muted hover:border-primary hover:text-primary cursor-pointer"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs">Click to upload photo</span>
            </button>
          )}
        </div>
      )}
      {custom.layout === 'gallery' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Gallery Images</span>
          <div className="grid grid-cols-2 gap-2">
            {custom.images.map((img) => (
              <div key={img.id} className="flex flex-col gap-1">
                <img
                  src={img.dataUrl}
                  alt=""
                  className="h-24 rounded border border-border object-cover"
                />
                <Input
                  value={img.caption || ''}
                  onChange={(e) => updateCustomSectionImageCaption(id, img.id, e.target.value)}
                  placeholder="Caption"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomSectionImage(id, img.id)}
                  className="text-danger hover:text-danger-hover"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </Button>
              </div>
            ))}
          </div>
          <button
            onClick={() => pick((url) => addCustomSectionImage(id, url))}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-text-muted hover:border-primary hover:text-primary cursor-pointer"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Add image</span>
          </button>
        </div>
      )}
      {custom.layout !== 'gallery' && custom.layout !== 'photo' && (
        <div className="flex flex-1 flex-col">
          <span className="mb-1 text-xs font-medium text-text-muted">Content</span>
          <RichTextEditor
            value={custom.content}
            onChange={(html) => updateCustomSection(id, { content: html })}
            placeholder="Write content for this section..."
            className="flex-1"
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
