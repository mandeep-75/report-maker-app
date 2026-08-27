import { useReportStore } from '../../store/reportStore'
import { Select } from '../UI/Select'
import { Input } from '../UI/Input'
import { PhotoUpload } from '../Gallery/PhotoUpload'
import { CERTIFICATE_LAYOUT_OPTIONS } from '../../data/templates'
import { CertificateLayout } from '../../data/reportSchema'
import { Trash2 } from 'lucide-react'

export function CertificatesEditor() {
  const certificates = useReportStore((s) => s.report.certificates)
  const certificateLayout = useReportStore((s) => s.report.certificateLayout)
  const setCertificateLayout = useReportStore((s) => s.setCertificateLayout)
  const addCertificate = useReportStore((s) => s.addCertificate)
  const removeCertificate = useReportStore((s) => s.removeCertificate)
  const updateCertificateCaption = useReportStore((s) => s.updateCertificateCaption)

  const perPage = Number(certificateLayout)

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Layout"
        value={certificateLayout}
        onChange={(e) => setCertificateLayout(e.target.value as CertificateLayout)}
        options={CERTIFICATE_LAYOUT_OPTIONS}
      />

      {certificates.length === 0 ? (
        <PhotoUpload onUpload={(url) => addCertificate(url)} label="Upload Certificates" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {certificates.map((c) => (
            <div key={c.id} className="relative rounded border border-border bg-surface p-2">
              <img src={c.dataUrl} alt="Certificate" className="h-36 w-full rounded object-contain" />
              <button
                onClick={() => removeCertificate(c.id)}
                className="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <Input
                value={c.caption ?? ''}
                onChange={(e) => updateCertificateCaption(c.id, e.target.value)}
                placeholder="Caption (optional)"
                className="mt-1"
              />
            </div>
          ))}
        </div>
      )}

      <PhotoUpload onUpload={(url) => addCertificate(url)} label="Add Certificates" />

      {certificates.length > 0 && (
        <p className="text-xs text-text-muted">
          {perPage} per page · {Math.ceil(certificates.length / perPage)} page(s)
        </p>
      )}
    </div>
  )
}
