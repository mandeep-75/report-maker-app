import { useReportStore } from '../../store/reportStore'
import { Button } from '../UI/Button'
import { Textarea } from '../UI/Textarea'
import { Upload } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { cn } from '../../utils/cn'

export function PhotoEditor() {
  const photo = useReportStore((s) => s.report.photo)
  const updatePhoto = useReportStore((s) => s.updatePhoto)
  const { pick } = useImageUpload()

  return (
    <div className="flex flex-col gap-3">
      {photo.dataUrl ? (
        <img
          src={photo.dataUrl}
          alt="Photo"
          className="max-h-72 rounded border border-border object-contain"
        />
      ) : (
        <button
          onClick={() => pick((url) => updatePhoto({ dataUrl: url }))}
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-text-muted hover:border-primary hover:text-primary cursor-pointer"
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">Click to upload photo</span>
        </button>
      )}
      {photo.dataUrl && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => pick((url) => updatePhoto({ dataUrl: url }))}
          >
            <Upload className="h-4 w-4" /> Replace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePhoto({ dataUrl: null })}
            className={cn('text-danger hover:text-danger-hover')}
          >
            Remove
          </Button>
        </div>
      )}
      <Textarea
        label="Photo Caption"
        value={photo.caption}
        onChange={(e) => updatePhoto({ caption: e.target.value })}
        placeholder="Write a caption for the photo"
        rows={3}
      />
    </div>
  )
}
