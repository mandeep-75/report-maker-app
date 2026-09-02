import { useReportStore } from '../../store/reportStore'
import { Button } from '../UI/Button'
import { Textarea } from '../UI/Textarea'
import { Upload } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { cn } from '../../utils/cn'
import { AIStubButton } from './AIStubButton'

export function BrochureEditor() {
  const brochure = useReportStore((s) => s.report.brochure)
  const updateBrochure = useReportStore((s) => s.updateBrochure)
  const { pick } = useImageUpload()

  return (
    <div className="flex flex-col gap-3">
      {brochure.dataUrl ? (
        <img
          src={brochure.dataUrl}
          alt="Brochure"
          className="max-h-72 rounded border border-border object-contain"
        />
      ) : (
        <button
          onClick={() => pick((url) => updateBrochure({ dataUrl: url }))}
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-text-muted hover:border-primary hover:text-primary cursor-pointer"
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">Click to upload brochure image</span>
        </button>
      )}
      {brochure.dataUrl && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => pick((url) => updateBrochure({ dataUrl: url }))}
          >
            <Upload className="h-4 w-4" /> Replace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateBrochure({ dataUrl: null })}
            className={cn('text-danger hover:text-danger-hover')}
          >
            Remove
          </Button>
        </div>
      )}
      <Textarea
        label="Brochure Text / Description"
        value={brochure.caption}
        onChange={(e) => updateBrochure({ caption: e.target.value })}
        placeholder="Write details or a description to appear with the brochure"
        rows={4}
      />
      <AIStubButton label="AI Generate Description" />
    </div>
  )
}
