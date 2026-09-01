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
  '3': 'grid-cols-3',
  '4': 'grid-cols-2',
  '6': 'grid-cols-3',
  'large-small': 'grid-cols-2',
  full: 'grid-cols-1',
}

export function GalleryGrid({ images, layout, onRemove, onCaption }: GalleryGridProps) {
  if (images.length === 0) return null

  if (layout === 'large-small') {
    const [first, ...rest] = images
    return (
      <div className="flex flex-col gap-2">
        <div className="relative">
          <img src={first.dataUrl} alt="" className="h-56 w-full rounded border border-border object-cover" />
          {onRemove && (
            <button
              onClick={() => onRemove(first.id)}
              className="absolute right-1.5 top-1.5 rounded bg-black/50 px-2 py-0.5 text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          )}
          {onCaption && (
            <input
              value={first.caption ?? ''}
              onChange={(e) => onCaption(first.id, e.target.value)}
              placeholder="Caption"
              className="mt-1 w-full rounded border border-border px-2 py-1 text-xs"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rest.map((img) => (
            <div key={img.id} className="relative">
              <img src={img.dataUrl} alt="" className="h-28 w-full rounded border border-border object-cover" />
              {onRemove && (
                <button
                  onClick={() => onRemove(img.id)}
                  className="absolute right-1 top-1 rounded bg-black/50 px-1.5 text-xs text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

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
                layout === '1' || layout === 'full' ? 'h-56' : 'h-32'
              )}
            />
            {onRemove && (
              <button
                onClick={() => onRemove(img.id)}
                className="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white cursor-pointer"
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
              className="w-full rounded border border-border px-2 py-1 text-xs"
            />
          )}
        </div>
      ))}
    </div>
  )
}
