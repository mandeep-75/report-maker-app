import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { PhotoUpload } from '../Gallery/PhotoUpload'
import { Trash2, Upload } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { uid } from '../../utils/cn'

export function PressCoverageEditor() {
  const pressCoverage = useReportStore((s) => s.report.pressCoverage)
  const addPressCoverage = useReportStore((s) => s.addPressCoverage)
  const removePressCoverage = useReportStore((s) => s.removePressCoverage)
  const updatePressCoverage = useReportStore((s) => s.updatePressCoverage)
  const { pick } = useImageUpload()

  const addOne = (dataUrl: string) => {
    addPressCoverage({
      id: uid(),
      dataUrl,
      publication: '',
      date: '',
      caption: '',
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {pressCoverage.length === 0 ? (
        <PhotoUpload onUpload={addOne} label="Upload Newspaper / Article Images" />
      ) : (
        pressCoverage.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-surface-alt p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-text-muted">Press Item</span>
              <button
                onClick={() => removePressCoverage(item.id)}
                className="text-danger hover:text-danger-hover cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {item.dataUrl ? (
              <img
                src={item.dataUrl}
                alt=""
                className="mb-2 max-h-48 w-full rounded border border-border object-contain"
              />
            ) : (
              <button
                onClick={() => pick((url) => updatePressCoverage(item.id, { dataUrl: url }))}
                className="mb-2 flex h-32 w-full flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-border text-text-muted hover:border-primary cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload image</span>
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Publication"
                value={item.publication}
                onChange={(e) => updatePressCoverage(item.id, { publication: e.target.value })}
              />
              <Input
                label="Date"
                value={item.date}
                onChange={(e) => updatePressCoverage(item.id, { date: e.target.value })}
              />
            </div>
            <Input
              label="Caption"
              value={item.caption}
              onChange={(e) => updatePressCoverage(item.id, { caption: e.target.value })}
              className="mt-2"
            />
          </div>
        ))
      )}
      {pressCoverage.length > 0 && (
        <PhotoUpload onUpload={addOne} label="Add Press Coverage" />
      )}
    </div>
  )
}
