import { useReportStore } from '../../store/reportStore'
import { GalleryEditor } from './GalleryEditor'

export function CertificatesEditor() {
  const certificates = useReportStore((s) => s.report.certificates)
  const certificateLayout = useReportStore((s) => s.report.certificateLayout)
  const setCertificateLayout = useReportStore((s) => s.setCertificateLayout)
  const addCertificate = useReportStore((s) => s.addCertificate)
  const removeCertificate = useReportStore((s) => s.removeCertificate)
  const updateCertificateCaption = useReportStore((s) => s.updateCertificateCaption)

  const perPage = Number(certificateLayout)

  return (
    <GalleryEditor
      images={certificates}
      layout={certificateLayout}
      onSetLayout={(l) => setCertificateLayout(l)}
      onAdd={(url) => addCertificate(url)}
      onRemove={removeCertificate}
      onCaption={updateCertificateCaption}
      uploadLabel="Add Certificates"
      perPage={perPage}
    />
  )
}
