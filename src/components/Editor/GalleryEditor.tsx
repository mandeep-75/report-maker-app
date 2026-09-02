import { Select } from '../UI/Select'
import { Button } from '../UI/Button'
import { GalleryGrid } from '../Gallery/PhotoGrid'
import { PhotoUpload } from '../Gallery/PhotoUpload'
import { IMAGE_LAYOUT_OPTIONS } from '../../data/templates'
import { GalleryLayout } from '../../data/reportSchema'
import { Plus } from 'lucide-react'

interface GalleryEditorProps {
  images: { id: string; dataUrl: string; caption?: string }[]
  layout: GalleryLayout
  onSetLayout: (layout: GalleryLayout) => void
  onAdd: (dataUrl: string) => void
  onAddEmpty?: () => void
  onRemove: (id: string) => void
  onCaption: (id: string, caption: string) => void
  uploadLabel?: string
  layoutLabel?: string
  perPage?: number
}

export function GalleryEditor({
  images,
  layout,
  onSetLayout,
  onAdd,
  onAddEmpty,
  onRemove,
  onCaption,
  uploadLabel = 'Add Photos',
  layoutLabel = 'Layout',
  perPage,
}: GalleryEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label={layoutLabel}
        value={layout}
        onChange={(e) => onSetLayout(e.target.value as GalleryLayout)}
        options={IMAGE_LAYOUT_OPTIONS}
      />

      {images.length > 0 && (
        <GalleryGrid images={images} layout={layout} onRemove={onRemove} onCaption={onCaption} />
      )}

      <div className="flex items-center gap-2">
        <PhotoUpload onUpload={onAdd} label={uploadLabel} />
        {onAddEmpty && (
          <Button variant="outline" size="sm" onClick={onAddEmpty} title="Add empty slot">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {images.length > 0 && perPage != null && !Number.isNaN(perPage) && (
        <p className="text-xs text-text-muted">
          {perPage} per page · {Math.ceil(images.length / perPage)} page(s)
        </p>
      )}
    </div>
  )
}
