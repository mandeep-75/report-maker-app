/**
 * Build a dense, realistic report exercising every export feature, then run
 * both the PDF and DOCX export backends and write the results to test/out.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { makePng } from './harness.mjs'
import { buildPdfBlob } from '../src/export/pdf/index.ts'
import { buildDocxBlob } from '../src/export/docx/index.ts'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(process.cwd(), 'test/out')

/* ------------------------------- images -------------------------------- */

const I = {
  landscape: makePng(1200, 800, '#7c5cff', '#4f8cff'), // 3:2 photo
  portrait: makePng(700, 1100, '#f59e0b', '#ef4444'), // 7:11 poster
  square: makePng(900, 900, '#22d3ee', '#0ea5e9'),
  wide: makePng(1600, 620, '#10b981', '#065f46'), // banner
  tall: makePng(620, 1400, '#8b5cf6', '#1e1b4b'), // tall portrait
  tiny: makePng(64, 48, '#64748b', '#0f172a'), // low-res, must not upscale
  cert: makePng(1800, 1250, '#facc15', '#b45309'), // landscape certificate
  brochure: makePng(560, 800, '#f472b6', '#831843'),
  person: makePng(300, 400, '#38bdf8', '#0c4a6e'),
  press: makePng(520, 700, '#94a3b8', '#334155'),
}

function item(png, caption) {
  return { id: `img-${Math.random().toString(36).slice(2, 8)}`, dataUrl: png, caption }
}

/* --------------------------- report builder ---------------------------- */

const SUMMARY_HTML = `
<p>The Department of History, Khalsa College Garhdiwala, organised a special programme to commemorate <strong>Partition Horrors Remembrance Day 2026</strong> on <em>14 August 2026</em> in the Seminar Hall.</p>
<p>The programme was organised to commemorate the memories of people who suffered during the Partition of India in 1947 and to create awareness among the younger generation about this significant historical event.</p>
<ul>
  <li>Themes like remembering the pain of Partition</li>
  <li>Honouring the resilience of survivors</li>
  <li>Inspiring a peaceful, harmonious tomorrow</li>
</ul>
<p>The major highlight was an enlightening lecture delivered by Ms. Anurada from Swami Premanand Mahavidyalaya, Mukerian. She discussed the historical circumstances surrounding Partition and elaborated on experiences of displacement, separation and loss. The lecture helped students understand the <u>human dimension</u> of this history.</p>
<blockquote>Never Forget, Always Remember — the resilience of those affected by Partition must guide our future.</blockquote>
<p>Students also participated in the National Quiz organised through MyGov and the Ministry of Culture, receiving Certificates of Participation. The hybrid mode of organisation facilitated wider participation and engagement with the programme's activities.</p>
<p>This second paragraph of body text ensures the summary flows over multiple pages together with the outcomes, images and certificates that follow it in the report.</p>
<p>The programme emphasised learning from history and nurturing the values of peace, compassion, communal harmony, unity and mutual understanding in the younger generation.</p>
`

const HIGHLIGHTS_HTML = `
<h2>Expert Lecture</h2>
<p>An informative and enlightening lecture was delivered by Ms. Anurada from Swami Premanand Mahavidyalaya, Mukerian, covering the human dimension of Partition and its lasting social and emotional impact.</p>
<h2>National Quiz</h2>
<p>Students participated in the National Quiz on Partition Horrors Remembrance Day, receiving Certificates of Participation from the Ministry of Culture and MyGov.</p>
<h2>Values &amp; Awareness</h2>
<p>The programme reinforced values of peace, compassion, communal harmony, unity and mutual understanding among participants.</p>
`

const SCHEDULE_TABLE = `
<table><thead><tr><th>Time</th><th>Activity</th><th>Venue</th></tr></thead>
<tbody><tr><td>11:00 AM</td><td>Welcome &amp; Introduction</td><td>Seminar Hall</td></tr>
<tr><td>11:30 AM</td><td>Expert Lecture</td><td>Seminar Hall</td></tr>
<tr><td>1:00 PM</td><td>National Quiz</td><td>Computer Lab</td></tr>
<tr><td>2:00 PM</td><td>Vote of Thanks</td><td>Seminar Hall</td></tr></tbody></table>
`

const QUOTES = `<blockquote>The event concluded with a powerful message of remembering the past, honouring resilience and working for a peaceful and harmonious future.</blockquote>`

/* ------------------------------ build report --------------------------- */

function buildReport() {
  const now = new Date().toISOString()
  const section = (type, i) => ({
    id: `section-${type}`,
    type,
    visible: true,
    label: String(type).toUpperCase(),
    showHeading: true,
    order: i,
  })
  const types = [
    'event-info',
    'resource-person',
    'theme',
    'photo',
    'brochure',
    'summary',
    'outcomes',
    'conclusion',
    'organized-by',
    'snapshots',
    'certificates',
    'press-coverage',
    'custom',
  ]
  const customMeta = {
  'cs-1': 'Programme Highlights',
  'cs-2': 'Schedule',
  'cs-3': 'Closing Words',
  'cs-4': 'Photo Booth',
}
const sections = types.map(section)
  for (const [cid, ctitle] of Object.entries(customMeta)) {
    sections.push({
      id: `section-custom-${cid}`,
      type: 'custom',
      visible: true,
      label: ctitle,
      showHeading: true,
      order: sections.length,
    })
  }

  return {
    id: 'test-report',
    createdAt: now,
    updatedAt: now,
    sections,
    eventInfo: {
      collegeName: 'KHALSA COLLEGE GARHDIWALA',
      department: 'DEPARTMENT OF HISTORY',
      reportTitle: 'EVENT REPORT',
      eventName: 'PARTITION HORRORS REMEMBRANCE DAY 2026',
      theme: 'Remembering the Pain, Honouring the Resilience, Inspiring a Peaceful Tomorrow',
      date: '2026-08-14',
      time: '11:00 AM onwards',
      venue: 'Seminar Hall, Khalsa College Garhdiwala',
      mode: 'Hybrid',
      academicSession: '2026–27',
      organisedBy: 'Department of History, Khalsa College Garhdiwala',
      tagline: 'Never Forget, Always Remember',
    },
    resourcePersons: [
      {
        id: 'rp-1',
        name: 'Ms. Anurada',
        designation: 'HoD',
        department: 'Department of History',
        institution: 'Swami Premanand Mahavidyalaya',
        location: 'Mukerian',
        photo: I.person,
      },
      {
        id: 'rp-2',
        name: 'Dr. Harjeet Singh',
        designation: 'Professor',
        department: 'Department of History',
        institution: 'Guru Nanak Dev University',
        location: 'Amritsar',
        photo: null,
      },
    ],
    brochure: {
      type: 'upload',
      dataUrl: I.brochure,
      caption:
        'Date: 14 August 2026 (Friday)\nTime: 11:00 AM onwards\nVenue: Seminar Hall\nMode: Hybrid (Offline + Online)\nOrganised by: Department of History',
    },
    photo: { dataUrl: I.wide, caption: 'Students and faculty at the event' },
    summary: SUMMARY_HTML,
    outcomes: [
      'Created awareness among students about the historical significance of Partition.',
      'Helped students understand the suffering, displacement and hardships associated with Partition.',
      'Provided students with valuable historical insights through an expert lecture.',
      'Encouraged students to participate in the National Quiz on Partition Horrors Remembrance Day 2026.',
      'Enhanced students’ knowledge through online participation in the MyGov quiz.',
      'Recognised student participation through Certificates of Participation.',
      'Promoted the values of peace, unity, compassion and communal harmony.',
      'Encouraged the younger generation to remember and learn from history.',
    ],
    conclusion:
      'The observance of Partition Horrors Remembrance Day 2026 at Khalsa College Garhdiwala was a meaningful academic and awareness initiative. The special lecture by Ms. Anurada, along with student participation in the National Quiz, provided an enriching platform for students to understand the historical and human dimensions of Partition. The programme successfully conveyed the message of remembering the past, honouring resilience and working towards a peaceful and harmonious future.',
    organizedBy: 'Department of History\nKhalsa College Garhdiwala\nIn collaboration with the IQAC Cell',
    snapshots: [
      item(I.landscape, 'Session in progress'),
      item(I.portrait, 'Student presenting'),
      item(I.square, 'Group discussion'),
      item(I.landscape, 'Audience view'),
      item(I.tall, 'Inauguration'),
      item(I.square, 'Closing ceremony'),
      item(I.tiny, 'Low-res notice board'),
    ],
    snapshotLayout: '6',
    certificates: [item(I.cert, 'Participation Award'), item(I.cert, 'Merit Certificate'), item(I.cert, 'Appreciation'), item(I.cert, 'Certificate of Participation')],
    certificateLayout: '4',
    pressCoverage: [
      { id: 'pc-1', dataUrl: I.press, publication: 'The Tribune', date: '16 August 2026', caption: 'Coverage in the local daily' },
      { id: 'pc-2', dataUrl: I.press, publication: 'Daily Newsline', date: '17 August 2026', caption: 'Regional edition report' },
    ],
    customSections: [
      { id: 'cs-1', title: 'Programme Highlights', content: HIGHLIGHTS_HTML, layout: 'text', images: [] },
      { id: 'cs-2', title: 'Schedule', content: SCHEDULE_TABLE, layout: 'table', images: [] },
      { id: 'cs-3', title: 'Closing Words', content: QUOTES, layout: 'quote', images: [] },
      { id: 'cs-4', title: 'Photo Booth', content: '', layout: 'gallery', images: [item(I.square, 'Booth snap'), item(I.portrait, 'Group photo')] },
    ],
  }
}

/* -------------------------------- main -------------------------------- */

async function main() {
  const report = buildReport()
  console.log('Report built:', report.sections.length, 'sections')

  const compact = process.env.COMPACT !== '0'
  console.log('compact =', compact)

  const pdfResult = await buildPdfBlob(report, { compact })
  console.log('PDF issues:', JSON.stringify(pdfResult.issues))
  if (pdfResult.blob) {
    const p = path.join(outDir, 'sample.pdf')
    fs.writeFileSync(p, Buffer.from(await pdfResult.blob.arrayBuffer()))
    console.log('Wrote', p, fs.statSync(p).size, 'bytes')
  }

  const docxResult = await buildDocxBlob(report, { compact })
  console.log('DOCX issues:', JSON.stringify(docxResult.issues))
  if (docxResult.blob) {
    const p = path.join(outDir, 'sample.docx')
    fs.writeFileSync(p, Buffer.from(await docxResult.blob.arrayBuffer()))
    console.log('Wrote', p, fs.statSync(p).size, 'bytes')
  }
}

main().catch((err) => {
  console.error('HARNESS FAILED')
  console.error(err)
  process.exit(1)
})