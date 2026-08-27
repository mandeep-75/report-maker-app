import { Report, Section, GalleryLayout, CertificateLayout } from '../../data/reportSchema'
import { formatDateWithWeekday } from '../../utils/date'

const certCols: Record<CertificateLayout, string> = {
  '1': 'cols-1',
  '2': 'cols-2',
  '4': 'cols-4',
  '6': 'cols-3',
}

function galleryCols(layout: GalleryLayout): string {
  switch (layout) {
    case '1':
    case 'full':
      return 'cols-1'
    case '2':
      return 'cols-2'
    case '3':
    case '6':
      return 'cols-3'
    case '4':
      return 'cols-2'
    default:
      return 'cols-1'
  }
}

export function renderSectionPage(section: Section, report: Report) {
  switch (section.type) {
      case 'event-info':
      return <CoverPage report={report} />
    case 'theme':
      return (
        <div>
          <div className="section-title">Theme</div>
          <div style={{ textAlign: 'center', fontSize: 18, fontStyle: 'italic', color: '#1d4ed8', marginTop: 40, lineHeight: 1.6 }}>
            {report.eventInfo.theme || '—'}
          </div>
        </div>
      )
    case 'resource-person':
      return <ResourcePersonPage report={report} />
    case 'brochure':
      return <BrochurePage report={report} />
    case 'summary':
      return (
        <div>
          <div className="section-title">Summary</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: report.summary }} />
        </div>
      )
    case 'outcomes':
      return (
        <div>
          <div className="section-title">Key Outcomes</div>
          <ul className="outcomes-list">
            {report.outcomes.filter((o) => o.trim()).map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )
    case 'conclusion':
      return (
        <div>
          <div className="section-title">Conclusion</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: report.conclusion }} />
        </div>
      )
    case 'organized-by':
      return (
        <div>
          <div className="section-title">Organised By</div>
          <div className="organized-by">
            {report.organizedBy || report.eventInfo.organisedBy || `${report.eventInfo.department}\n${report.eventInfo.collegeName}`}
          </div>
        </div>
      )
    case 'snapshots':
      return <SnapshotsPage report={report} />
    case 'certificates':
      return <CertificatesPage report={report} />
    case 'press-coverage':
      return <PressPage report={report} />
    case 'custom': {
      const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
      if (!custom) return null
      return (
        <div>
          <div className="section-title">{custom.title}</div>
          {custom.layout === 'gallery' ? (
            <p className="prose">Gallery layout (images managed in editor).</p>
          ) : custom.layout === 'quote' ? (
            <div className="quote-block" dangerouslySetInnerHTML={{ __html: custom.content }} />
          ) : (
            <div className="prose" dangerouslySetInnerHTML={{ __html: custom.content }} />
          )}
        </div>
      )
    }
    default:
      return null
  }
}

function CoverPage({ report }: { report: Report }) {
  const { eventInfo, resourcePersons } = report
  return (
    <div className="cover">
      <div className="college">{eventInfo.collegeName || 'COLLEGE NAME'}</div>
      <div className="dept">{eventInfo.department || 'DEPARTMENT NAME'}</div>
      <div className="rule" />
      <div className="report-on">Report On</div>
      <div className="event-title">{eventInfo.eventName || 'EVENT TITLE'}</div>
      {eventInfo.academicSession && <div className="acad">{eventInfo.academicSession}</div>}
      {eventInfo.theme && <div className="theme">"{eventInfo.theme}"</div>}
      <div className="event-details">
        {eventInfo.date && (
          <div>
            <b>Date:</b> {formatDateWithWeekday(eventInfo.date)}
          </div>
        )}
        {eventInfo.time && (
          <div>
            <b>Time:</b> {eventInfo.time}
          </div>
        )}
        {eventInfo.venue && (
          <div>
            <b>Venue:</b> {eventInfo.venue}
          </div>
        )}
        {eventInfo.mode && (
          <div>
            <b>Mode:</b> {eventInfo.mode}
          </div>
        )}
        {(eventInfo.organisedBy || eventInfo.department) && (
          <div>
            <b>Organised by:</b> {eventInfo.organisedBy || eventInfo.department}
          </div>
        )}
        {resourcePersons.map((p, i) => (
          <div key={i}>
            <b>Resource Person:</b> {[p.name, p.institution, p.location].filter(Boolean).join(', ')}
          </div>
        ))}
      </div>
      {eventInfo.tagline && <div className="tagline">"{eventInfo.tagline}"</div>}
    </div>
  )
}

function ResourcePersonPage({ report }: { report: Report }) {
  return (
    <div>
      <div className="section-title">Resource Person</div>
      {report.resourcePersons.map((p, i) => (
        <div className="person-block" key={i}>
          {p.photo && <img className="photo" src={p.photo} alt="" />}
          <div className="name">{p.name}</div>
          <div>
            {p.designation}
            {p.department ? `, ${p.department}` : ''}
          </div>
          {p.institution && <div>{p.institution}</div>}
          {p.location && <div>{p.location}</div>}
        </div>
      ))}
    </div>
  )
}

function BrochurePage({ report }: { report: Report }) {
  const { brochure } = report
  return (
    <div>
      <div className="section-title">Brochure</div>
      {brochure.dataUrl ? (
        <div>
          <img src={brochure.dataUrl} alt="Brochure" style={{ width: '100%', border: '1px solid #e2e8f0' }} />
          {brochure.caption && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 10 }}>
              {brochure.caption}
            </div>
          )}
        </div>
      ) : (
        brochure.caption && (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#334155' }}>{brochure.caption}</div>
        )
      )}
    </div>
  )
}

function SnapshotsPage({ report }: { report: Report }) {
  const { snapshots, snapshotLayout } = report
  const visible = snapshots.filter((s) => s.dataUrl)
  if (visible.length === 0) return <div className="section-title">Snapshots</div>
  if (snapshotLayout === 'large-small') {
    const [first, ...rest] = visible
    return (
      <div>
        <div className="section-title">Snapshots</div>
        <div className="gallery-large-small">
          <div>
            <img src={first.dataUrl} alt="" />
            {first.caption && <div className="caption">{first.caption}</div>}
          </div>
          <div className="small-col">
            {rest.slice(0, 2).map((s) => (
              <div key={s.id}>
                <img src={s.dataUrl} alt="" />
                {s.caption && <div className="caption">{s.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  const limit = snapshotLayout === 'full' ? 1 : Number(snapshotLayout)
  const shown = visible.slice(0, limit)
  return (
    <div>
      <div className="section-title">Snapshots</div>
      <div className={`gallery-grid ${galleryCols(snapshotLayout)}`}>
        {shown.map((s) => (
          <div key={s.id}>
            <img src={s.dataUrl} alt="" />
            {s.caption && <div className="caption">{s.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CertificatesPage({ report }: { report: Report }) {
  const { certificates, certificateLayout } = report
  const visible = certificates.filter((c) => c.dataUrl)
  if (visible.length === 0) return <div className="section-title">Certificates</div>
  return (
    <div>
      <div className="section-title">Certificates</div>
      <div className={`cert-grid ${certCols[certificateLayout]}`}>
        {visible.map((c) => (
          <div key={c.id}>
            <img src={c.dataUrl} alt="" />
            {c.caption && <div className="caption">{c.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function PressPage({ report }: { report: Report }) {
  const visible = report.pressCoverage.filter((p) => p.dataUrl)
  if (visible.length === 0) return <div className="section-title">Press Coverage</div>
  return (
    <div>
      <div className="section-title">Press Coverage</div>
      {visible.map((p) => (
        <div className="press-item" key={p.id}>
          <img src={p.dataUrl} alt="" />
          {p.publication && <div className="pub">{p.publication}</div>}
          {p.date && <div className="cap">{p.date}</div>}
          {p.caption && <div className="cap">{p.caption}</div>}
        </div>
      ))}
    </div>
  )
}

export function formatDisplayDate(date: string): string {
  if (!date) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}
