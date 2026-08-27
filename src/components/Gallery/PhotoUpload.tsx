import { useState } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { fileToDataUrl } from '../../utils/imageHelpers'

export function PhotoUpload({
  onUpload,
  label = 'Select Photos',
}: {
  onUpload: (dataUrl: string) => void
  label?: string
}) {
  const { pickMany } = useImageUpload()
  const [drag, setDrag] = useState(false)

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    for (const file of files) onUpload(await fileToDataUrl(file))
  }

  return (
    <button
      type="button"
      onClick={() => pickMany(onUpload)}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed py-8 text-text-muted hover:border-primary hover:text-primary cursor-pointer ${
        drag ? 'border-primary bg-primary/5 text-primary' : 'border-border'
      }`}
    >
      <ImagePlus className="h-7 w-7" />
      <span className="flex items-center gap-1.5 text-sm">
        <Upload className="h-4 w-4" /> {label}
      </span>
      <span className="text-xs">or drag photos here</span>
    </button>
  )
}
