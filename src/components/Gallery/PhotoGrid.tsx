import { GalleryLayout } from '../../data/reportSchema'
import { cn } from '../../utils/cn'

interface GalleryGridProps {
  images: { id: string; dataUrl: string; caption?: string }[]
  layout: GalleryLayout
  onRemove?: (id: string) => void
  onCaption?: (id: string, caption: string) => void
}

const gridClass: Record<GalleryLayout, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '4': 'grid-cols-2',
}

export function GalleryGrid({ images, layout, onRemove, onCaption }: GalleryGridProps) {
  if (images.length === 0) return null

  return (
    <div className={cn('grid gap-2', gridClass[layout])}>
      {images.map((img) => (
        <div key={img.id} className="relative flex flex-col gap-1">
          <div className="relative">
            <img
              src={img.dataUrl}
              alt=""
              className={cn(
                'w-full rounded border border-border object-cover',
                layout === '1' ? 'h-56' : 'h-32'
              )}
            />
            {onRemove && (
              <button
                onClick={() => onRemove(img.id)}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-danger cursor-pointer"
                title="Remove image"
              >
                ✕
              </button>
            )}
          </div>
          {onCaption && (
            <input
              value={img.caption ?? ''}
              onChange={(e) => onCaption(img.id, e.target.value)}
              placeholder="Caption"
              className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-muted/60 transition-all hover:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </div>
      ))}
    </div>
  )
}
