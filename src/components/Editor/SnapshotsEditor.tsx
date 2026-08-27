import { useReportStore } from '../../store/reportStore'
import { Select } from '../UI/Select'
import { Button } from '../UI/Button'
import { GalleryGrid } from '../Gallery/PhotoGrid'
import { PhotoUpload } from '../Gallery/PhotoUpload'
import { GALLERY_LAYOUT_OPTIONS } from '../../data/templates'
import { Plus } from 'lucide-react'

export function SnapshotsEditor() {
  const snapshots = useReportStore((s) => s.report.snapshots)
  const snapshotLayout = useReportStore((s) => s.report.snapshotLayout)
  const setSnapshotLayout = useReportStore((s) => s.setSnapshotLayout)
  const addSnapshot = useReportStore((s) => s.addSnapshot)
  const removeSnapshot = useReportStore((s) => s.removeSnapshot)
  const updateSnapshotCaption = useReportStore((s) => s.updateSnapshotCaption)

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Gallery Layout"
        value={snapshotLayout}
        onChange={(e) => setSnapshotLayout(e.target.value as typeof snapshotLayout)}
        options={GALLERY_LAYOUT_OPTIONS}
      />
      {snapshots.length === 0 ? (
        <PhotoUpload onUpload={(url) => addSnapshot(url)} />
      ) : (
        <>
          <GalleryGrid
            images={snapshots}
            layout={snapshotLayout}
            onRemove={removeSnapshot}
            onCaption={updateSnapshotCaption}
          />
          <div className="flex items-center gap-2">
            <PhotoUpload onUpload={(url) => addSnapshot(url)} label="Add Photos" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSnapshot('')}
              title="Add empty slot"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
