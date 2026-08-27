import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { Report } from '../data/reportSchema'
import { sortedSections } from '../utils/sectionOrder'
import { htmlToBlocks } from '../utils/htmlToRuns'
import { isSectionEmpty } from '../utils/sectionEmpty'
import { formatDateWithWeekday } from '../utils/date'
import { exportFileName } from './filename'
import { useReportStore } from '../store/reportStore'

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    color: '#0f172a',
  },
  center: { textAlign: 'center' },
  college: { fontSize: 20, fontFamily: 'Times-Bold', textTransform: 'uppercase', textAlign: 'center' },
  dept: { fontSize: 13, textAlign: 'center', marginTop: 4, color: '#334155' },
  rule: { height: 2, width: 120, backgroundColor: '#2563eb', marginVertical: 24, alignSelf: 'center' },
  reportOn: { fontSize: 12, textAlign: 'center', color: '#64748b', letterSpacing: 3 },
  eventTitle: { fontSize: 24, fontFamily: 'Times-Bold', textAlign: 'center', marginTop: 10 },
  theme: { fontSize: 13, fontFamily: 'Times-Italic', textAlign: 'center', marginTop: 14, color: '#1d4ed8' },
  meta: { textAlign: 'center', marginTop: 28, fontSize: 11, lineHeight: 1.8, color: '#334155' },
  tagline: { textAlign: 'center', fontFamily: 'Times-Italic', marginTop: 32, fontSize: 12, color: '#475569' },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 14,
    borderBottom: '1pt solid #0f172a',
    paddingBottom: 6,
  },
  detailLine: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
    color: '#334155',
  },
  para: { marginBottom: 8, textAlign: 'justify', lineHeight: 1.6 },
  h1: { fontSize: 15, fontFamily: 'Times-Bold', marginVertical: 8 },
  h2: { fontSize: 13, fontFamily: 'Times-Bold', marginVertical: 6 },
  bullet: { marginLeft: 14, marginBottom: 4, lineHeight: 1.6 },
  quote: { marginLeft: 18, fontFamily: 'Times-Italic', color: '#334155', marginVertical: 6 },
  person: { marginBottom: 8 },
  personName: { fontFamily: 'Times-Bold', fontSize: 12 },
  galleryRow: { flexDirection: 'row', gap: 10, marginVertical: 6, flexWrap: 'wrap' },
  galleryImg: { flex: 1, objectFit: 'cover', borderWidth: 1, borderColor: '#e2e8f0' },
  caption: { fontSize: 9, color: '#64748b', textAlign: 'center', marginTop: 3 },
  organizedBy: { textAlign: 'center', fontFamily: 'Times-Bold', fontSize: 13, marginTop: 32, lineHeight: 1.8 },
  pressImg: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 6 },
  pub: { fontFamily: 'Times-Bold', fontSize: 11 },
})

function RichText({ html }: { html: string }) {
  const blocks = htmlToBlocks(html)
  let counter = 0
  const ordinals = blocks.map((b) => {
    if (b.type === 'numbered') {
      counter += 1
      return counter
    }
    counter = 0
    return 0
  })
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'heading1') return <Text key={i} style={styles.h1}>{b.runs.map((r) => r.text).join('')}</Text>
        if (b.type === 'heading2') return <Text key={i} style={styles.h2}>{b.runs.map((r) => r.text).join('')}</Text>
        if (b.type === 'bullet') return <Text key={i} style={styles.bullet}>• {b.runs.map((r) => r.text).join('')}</Text>
        if (b.type === 'numbered') return <Text key={i} style={styles.bullet}>{ordinals[i]}. {b.runs.map((r) => r.text).join('')}</Text>
        if (b.type === 'quote') return <Text key={i} style={styles.quote}>{b.runs.map((r) => r.text).join('')}</Text>
        return (
          <Text key={i} style={styles.para}>
            {b.runs.map((r, j) => (
              <Text key={j} style={{ fontFamily: r.bold ? 'Times-Bold' : 'Times-Roman', fontStyle: r.italic ? 'italic' : 'normal' }}>
                {r.text}
              </Text>
            ))}
          </Text>
        )
      })}
    </>
  )
}

function Gallery({ images, perRow }: { images: string[]; perRow: number }) {
  const rows: string[][] = []
  for (let i = 0; i < images.length; i += perRow) rows.push(images.slice(i, i + perRow))
  return (
    <>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.galleryRow}>
          {row.map((src, ci) => (
            <Image key={ci} src={src} style={[styles.galleryImg, { aspectRatio: 4 / 3 }]} />
          ))}
        </View>
      ))}
    </>
  )
}

function ReportDoc({ report }: { report: Report }) {
  const sections = sortedSections(report.sections).filter((s) => s.visible)
  const compact = useReportStore.getState().compact
  const activeSections = compact ? sections.filter((s) => !isSectionEmpty(s, report)) : sections
  const { eventInfo, resourcePersons } = report

  const blocks: React.ReactNode[] = []

  for (const section of activeSections) {
    let content: React.ReactNode = null
    switch (section.type) {
      case 'event-info':
        content = (
          <View>
            <Text style={styles.college}>{eventInfo.collegeName || 'COLLEGE NAME'}</Text>
            <Text style={styles.dept}>{eventInfo.department || 'DEPARTMENT NAME'}</Text>
            <View style={styles.rule} />
            <Text style={styles.reportOn}>REPORT ON</Text>
            <Text style={styles.eventTitle}>{eventInfo.eventName || 'EVENT TITLE'}</Text>
            {eventInfo.academicSession && (
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>{eventInfo.academicSession}</Text>
            )}
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              {eventInfo.date && (
                <Text style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Date: </Text>
                  {formatDateWithWeekday(eventInfo.date)}
                </Text>
              )}
              {eventInfo.time && (
                <Text style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Time: </Text>
                  {eventInfo.time}
                </Text>
              )}
              {eventInfo.venue && (
                <Text style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Venue: </Text>
                  {eventInfo.venue}
                </Text>
              )}
              {eventInfo.mode && (
                <Text style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Mode: </Text>
                  {eventInfo.mode}
                </Text>
              )}
              {(eventInfo.organisedBy || eventInfo.department) && (
                <Text style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Organised by: </Text>
                  {eventInfo.organisedBy || eventInfo.department}
                </Text>
              )}
              {resourcePersons.map((p, i) => (
                <Text key={i} style={styles.detailLine}>
                  <Text style={{ fontFamily: 'Times-Bold' }}>Resource Person: </Text>
                  {[p.name, p.institution, p.location].filter(Boolean).join(', ')}
                </Text>
              ))}
            </View>
            {eventInfo.tagline && <Text style={styles.tagline}>"{eventInfo.tagline}"</Text>}
          </View>
        )
        break
      case 'resource-person':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Resource Person</Text>
            {resourcePersons.map((p, i) => (
              <View key={i} style={styles.person}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text>{[p.designation, p.department].filter(Boolean).join(', ')}</Text>
                {p.institution && <Text>{p.institution}</Text>}
                {p.location && <Text>{p.location}</Text>}
              </View>
            ))}
          </View>
        )
        break
      case 'theme':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Theme</Text>
            <Text style={{ textAlign: 'center', fontFamily: 'Times-Italic', fontSize: 15, color: '#1d4ed8', marginTop: 30, lineHeight: 1.6 }}>
              {report.eventInfo.theme || '—'}
            </Text>
          </View>
        )
        break
      case 'brochure':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Brochure</Text>
            {report.brochure.dataUrl ? (
              <View>
                <Image src={report.brochure.dataUrl} style={{ width: '100%', objectFit: 'contain' }} />
                {report.brochure.caption && (
                  <Text style={{ textAlign: 'center', fontFamily: 'Times-Italic', fontSize: 11, marginTop: 8 }}>
                    {report.brochure.caption}
                  </Text>
                )}
              </View>
            ) : (
              report.brochure.caption && (
                <Text style={{ textAlign: 'center', fontSize: 12 }}>{report.brochure.caption}</Text>
              )
            )}
          </View>
        )
        break
      case 'summary':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <RichText html={report.summary} />
          </View>
        )
        break
      case 'outcomes':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Key Outcomes</Text>
            {report.outcomes.filter((o) => o.trim()).map((o, i) => (
              <Text key={i} style={styles.bullet}>• {o}</Text>
            ))}
          </View>
        )
        break
      case 'conclusion':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Conclusion</Text>
            <RichText html={report.conclusion} />
          </View>
        )
        break
      case 'organized-by':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Organised By</Text>
            <Text style={styles.organizedBy}>
              {report.organizedBy || eventInfo.organisedBy || `${eventInfo.department}\n${eventInfo.collegeName}`}
            </Text>
          </View>
        )
        break
      case 'snapshots': {
        const imgs = report.snapshots.filter((s) => s.dataUrl).map((s) => s.dataUrl)
        const perRow = report.snapshotLayout === 'full' ? 1 : report.snapshotLayout === 'large-small' ? 2 : Number(report.snapshotLayout)
        content = (
          <View>
            <Text style={styles.sectionTitle}>Snapshots</Text>
            <Gallery images={imgs} perRow={perRow} />
          </View>
        )
        break
      }
      case 'certificates': {
        const imgs = report.certificates.filter((c) => c.dataUrl).map((c) => c.dataUrl)
        const perRow = Number(report.certificateLayout)
        content = (
          <View>
            <Text style={styles.sectionTitle}>Certificates</Text>
            <Gallery images={imgs} perRow={perRow} />
          </View>
        )
        break
      }
      case 'press-coverage':
        content = (
          <View>
            <Text style={styles.sectionTitle}>Press Coverage</Text>
            {report.pressCoverage.filter((p) => p.dataUrl).map((p) => (
              <View key={p.id} style={{ marginBottom: 12 }}>
                <Image src={p.dataUrl} style={styles.pressImg} />
                {p.publication && <Text style={styles.pub}>{p.publication}</Text>}
                {p.caption && <Text style={styles.caption}>{p.caption}</Text>}
              </View>
            ))}
          </View>
        )
        break
      case 'custom': {
        const custom = report.customSections.find((c) => `section-custom-${c.id}` === section.id)
        if (custom) {
          content = (
            <View>
              <Text style={styles.sectionTitle}>{custom.title}</Text>
              {custom.layout !== 'gallery' && <RichText html={custom.content} />}
            </View>
          )
        }
        break
      }
    }
    if (content) blocks.push(<View key={section.id} style={{ marginBottom: 28 }}>{content}</View>)
  }

  if (compact) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {blocks}
        </Page>
      </Document>
    )
  }

  return (
    <Document>
      {blocks.map((b, i) => (
        <Page key={i} size="A4" style={styles.page}>
          {b}
        </Page>
      ))}
    </Document>
  )
}

export async function exportPdf(report: Report) {
  const blob = await pdf(<ReportDoc report={report} />).toBlob()
  saveAs(blob, `${exportFileName(report.eventInfo.eventName, report.eventInfo.date)}.pdf`)
}
