import { useReportStore } from '../../store/reportStore'
import { GalleryEditor } from './GalleryEditor'

export function SnapshotsEditor() {
  const snapshots = useReportStore((s) => s.report.snapshots)
  const snapshotLayout = useReportStore((s) => s.report.snapshotLayout)
  const setSnapshotLayout = useReportStore((s) => s.setSnapshotLayout)
  const addSnapshot = useReportStore((s) => s.addSnapshot)
  const removeSnapshot = useReportStore((s) => s.removeSnapshot)
  const updateSnapshotCaption = useReportStore((s) => s.updateSnapshotCaption)

  return (
    <GalleryEditor
      images={snapshots}
      layout={snapshotLayout}
      onSetLayout={(l) => setSnapshotLayout(l)}
      onAdd={(url) => addSnapshot(url)}
      onRemove={removeSnapshot}
      onCaption={updateSnapshotCaption}
      layoutLabel="Gallery Layout"
    />
  )
}
