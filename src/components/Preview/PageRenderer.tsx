import { Report, Section, GalleryLayout } from '../../data/reportSchema'
import { formatDateWithWeekday } from '../../utils/date'

function galleryCols(layout: GalleryLayout): string {
  switch (layout) {
    case '1':
      return 'cols-1'
    case '2':
    case '4':
      return 'cols-2'
    default:
      return 'cols-1'
  }
}

function SectionHeading({ section }: { section: Section }) {
  if (section.showHeading === false) return null
  return <div className="section-title">{section.label}</div>
}

export function renderSectionPage(section: Section, report: Report) {
  switch (section.type) {
      case 'event-info':
      return <CoverPage report={report} />
    case 'theme':
      return (
        <div>
          <SectionHeading section={section} />
          <div style={{ textAlign: 'center', fontSize: 18, fontStyle: 'italic', color: '#1d4ed8', marginTop: 40, lineHeight: 1.6 }}>
            {report.eventInfo.theme || '—'}
          </div>
        </div>
      )
    case 'resource-person':
      return <ResourcePersonPage report={report} section={section} />
    case 'brochure':
      return <BrochurePage report={report} section={section} />
    case 'photo':
      return <PhotoPage report={report} section={section} />
    case 'summary':
      return (
        <div>
          <SectionHeading section={section} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: report.summary }} />
        </div>
      )
    case 'outcomes':
      return (
        <div>
          <SectionHeading section={section} />
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
          <SectionHeading section={section} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: report.conclusion }} />
        </div>
      )
    case 'organized-by':
      return (
        <div>
          <SectionHeading section={section} />
          <div className="organized-by">
            {report.organizedBy || report.eventInfo.organisedBy || `${report.eventInfo.department}\n${report.eventInfo.collegeName}`}
          </div>
        </div>
      )
    case 'snapshots':
      return <SnapshotsPage report={report} section={section} />
    case 'certificates':
      return <CertificatesPage report={report} section={section} />
    case 'press-coverage':
      return <PressPage report={report} section={section} />
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

function ResourcePersonPage({ report, section }: { report: Report; section: Section }) {
  return (
    <div>
      <SectionHeading section={section} />
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

function BrochurePage({ report, section }: { report: Report; section: Section }) {
  const { brochure } = report
  return (
    <div>
      <SectionHeading section={section} />
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

function PhotoPage({ report, section }: { report: Report; section: Section }) {
  const { photo } = report
  return (
    <div>
      <SectionHeading section={section} />
      {photo.dataUrl ? (
        <div>
          <img src={photo.dataUrl} alt="Photo" style={{ width: '100%', border: '1px solid #e2e8f0' }} />
          {photo.caption && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 10 }}>
              {photo.caption}
            </div>
          )}
        </div>
      ) : (
        photo.caption && (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#334155' }}>{photo.caption}</div>
        )
      )}
    </div>
  )
}

function SnapshotsPage({ report, section }: { report: Report; section: Section }) {
  const { snapshots, snapshotLayout } = report
  const visible = snapshots.filter((s) => s.dataUrl)
  if (visible.length === 0) return <SectionHeading section={section} />
  const perPage = Number(snapshotLayout)
  return (
    <div>
      <SectionHeading section={section} />
      {chunk(visible, perPage).map((group, gi) => (
        <div
          key={gi}
          className={`gallery-grid ${galleryCols(snapshotLayout)}`}
          style={gi > 0 ? { pageBreakBefore: 'always', breakBefore: 'page' } : undefined}
        >
          {group.map((s) => (
            <div key={s.id}>
              <img src={s.dataUrl} alt="" />
              {s.caption && <div className="caption">{s.caption}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function CertificatesPage({ report, section }: { report: Report; section: Section }) {
  const { certificates, certificateLayout } = report
  const visible = certificates.filter((c) => c.dataUrl)
  if (visible.length === 0) return <SectionHeading section={section} />
  const perPage = Number(certificateLayout)
  return (
    <div>
      <SectionHeading section={section} />
      {chunk(visible, perPage).map((group, gi) => (
        <div
          key={gi}
          className={`gallery-grid ${galleryCols(certificateLayout)}`}
          style={gi > 0 ? { pageBreakBefore: 'always', breakBefore: 'page' } : undefined}
        >
          {group.map((c) => (
            <div key={c.id}>
              <img src={c.dataUrl} alt="" />
              {c.caption && <div className="caption">{c.caption}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function PressPage({ report, section }: { report: Report; section: Section }) {
  const visible = report.pressCoverage.filter((p) => p.dataUrl)
  if (visible.length === 0) return <SectionHeading section={section} />
  return (
    <div>
      <SectionHeading section={section} />
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
