import {
  Report,
  Section,
  SectionType,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  GalleryLayout,
  CertificateLayout,
} from './reportSchema'

export function createDefaultEventInfo(): Report['eventInfo'] {
  return {
    collegeName: '',
    department: '',
    reportTitle: '',
    eventName: '',
    theme: '',
    date: '',
    time: '',
    venue: '',
    mode: 'Offline',
    academicSession: '2026–27',
    organisedBy: '',
    tagline: '',
  }
}

export function createDefaultSections(order: SectionType[] = DEFAULT_SECTION_ORDER): Section[] {
  return order.map((type, index) => ({
    id: `section-${type}`,
    type,
    visible: true,
    label: SECTION_LABELS[type],
    showHeading: true,
    order: index,
  }))
}

export function createDefaultReport(): Report {
  const now = new Date().toISOString()
  return {
    id: `report-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    sections: createDefaultSections(),
    eventInfo: createDefaultEventInfo(),
    resourcePersons: [],
    brochure: { type: 'auto', dataUrl: null, caption: '' },
    photo: { dataUrl: null, caption: '' },
    summary: '',
    outcomes: ['', '', '', ''],
    conclusion: '',
    organizedBy: '',
    snapshots: [],
    snapshotLayout: '6',
    certificates: [],
    certificateLayout: '2',
    pressCoverage: [],
    customSections: [],
  }
}

export const GALLERY_LAYOUT_OPTIONS: { value: GalleryLayout; label: string }[] = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
  { value: '6', label: '6 images' },
  { value: 'large-small', label: 'Large + small' },
  { value: 'full', label: 'Full page' },
]

export const CERTIFICATE_LAYOUT_OPTIONS: { value: CertificateLayout; label: string }[] = [
  { value: '1', label: '1 per page' },
  { value: '2', label: '2 per page' },
  { value: '4', label: '4 per page' },
  { value: '6', label: '6 per page' },
]

export type TemplateCategory =
  | 'academic'
  | 'seminar'
  | 'workshop'
  | 'competition'
  | 'celebration'
  | 'awareness'
  | 'webinar'
  | 'activity'
  | 'custom'

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  academic: 'Academic',
  seminar: 'Seminar',
  workshop: 'Workshop',
  competition: 'Competition',
  celebration: 'Celebration',
  awareness: 'Awareness',
  webinar: 'Webinar',
  activity: 'Activity',
  custom: 'Custom',
}

export const TEMPLATE_FILTERS: { value: 'all' | TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'custom', label: 'Custom' },
]

export interface TemplateCover {
  title: string
  subtitle: string
  college: string
  from: string
  to: string
}

interface TemplateConfig {
  eventInfo?: Partial<Report['eventInfo']>
  resourcePersons?: Report['resourcePersons']
  brochure?: Partial<Report['brochure']>
  summary?: string
  outcomes?: string[]
  conclusion?: string
  organizedBy?: string
  sectionOrder?: SectionType[]
  hiddenSections?: SectionType[]
  snapshotLayout?: GalleryLayout
  certificateLayout?: CertificateLayout
  customSections?: { title: string; content: string; layout: 'text' | 'list' | 'quote' }[]
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  cover: TemplateCover
  included: string[]
  build: () => Report
}

function makeReport(cfg: TemplateConfig = {}): Report {
  const r = createDefaultReport()
  const order = cfg.sectionOrder ?? DEFAULT_SECTION_ORDER
  const hidden = new Set(cfg.hiddenSections ?? [])
  r.sections = order.map((type, index) => ({
    id: `section-${type}`,
    type,
    visible: !hidden.has(type),
    label: SECTION_LABELS[type],
    showHeading: true,
    order: index,
  }))
  if (cfg.customSections?.length) {
    cfg.customSections.forEach((c, i) => {
      const id = `tpl-custom-${i}`
      r.customSections.push({ id, title: c.title, content: c.content, layout: c.layout, images: [] })
      r.sections.push({
        id: `section-custom-${id}`,
        type: 'custom',
        visible: true,
        label: c.title,
        showHeading: true,
        order: r.sections.length,
      })
    })
  }
  if (cfg.eventInfo) r.eventInfo = { ...r.eventInfo, ...cfg.eventInfo }
  if (cfg.resourcePersons) r.resourcePersons = cfg.resourcePersons
  if (cfg.brochure) r.brochure = { ...r.brochure, ...cfg.brochure }
  if (cfg.summary !== undefined) r.summary = cfg.summary
  if (cfg.outcomes) r.outcomes = cfg.outcomes
  if (cfg.conclusion !== undefined) r.conclusion = cfg.conclusion
  if (cfg.organizedBy !== undefined) r.organizedBy = cfg.organizedBy
  if (cfg.snapshotLayout) r.snapshotLayout = cfg.snapshotLayout
  if (cfg.certificateLayout) r.certificateLayout = cfg.certificateLayout
  return r
}

const PARTITION_SUMMARY = `The Department of History, Khalsa College Garhdiwala, organised a special programme to commemorate Partition Horrors Remembrance Day on 14 August 2026 at 11:00 AM in the Seminar Hall of the college. The programme was conducted in hybrid mode, allowing students and faculty members to participate both physically and online.

The programme was organised to commemorate the memories of the people who suffered during the Partition of India in 1947 and to create awareness among the younger generation about this significant historical event. The theme of the programme, “Remembering the Pain, Honouring the Resilience, Inspiring a Peaceful Tomorrow,” highlighted the importance of remembering the past while promoting peace, harmony and mutual understanding.

The major highlight of the programme was an informative and enlightening lecture delivered by Ms. Anurada from Swami Premanand Mahavidyalaya, Mukerian. She discussed the historical circumstances surrounding the Partition and elaborated on the experiences of people who faced displacement, separation, suffering and loss during this period. The lecture helped students understand the human dimension of Partition and its lasting social and emotional impact.

As part of the awareness and educational initiatives, students were also encouraged to participate in the “National Quiz on Partition Horrors Remembrance Day 2026” organised through MyGov and the Ministry of Culture. Student participation in the online quiz provided an additional opportunity to enhance their knowledge and understanding of the historical significance of Partition. A Certificate of Participation was also received by participating students, acknowledging their involvement in the National Quiz.

The programme emphasised the importance of learning from history and nurturing the values of peace, compassion, communal harmony, unity and mutual understanding. Students were encouraged to reflect upon the consequences of division and violence and to contribute towards building a peaceful and harmonious society.

The programme witnessed active participation of students and faculty members. The hybrid mode of organisation facilitated wider participation and engagement with the programme. The lecture, awareness activities and participation in the National Quiz together provided students with a meaningful and educational experience.

The event concluded with a message of “Never Forget, Always Remember”, honouring the resilience of those affected by Partition and reaffirming the importance of peace, unity and harmony for future generations.`

const PARTITION_CONCLUSION = `The observance of Partition Horrors Remembrance Day 2026 at Khalsa College Garhdiwala was a meaningful academic and awareness initiative. The special lecture by Ms. Anurada, Swami Premanand Mahavidyalaya, Mukerian, along with student participation in the National Quiz on Partition Horrors Remembrance Day 2026, provided an enriching platform for students to understand and reflect upon the historical and human dimensions of Partition. The programme successfully conveyed the message of remembering the past, honouring resilience and working towards a peaceful and harmonious future.`

const PARTITION_OUTCOMES = [
  'Created awareness among students about the historical significance of Partition.',
  'Helped students understand the suffering, displacement and hardships associated with Partition.',
  'Provided students with valuable historical insights through an expert lecture.',
  'Encouraged students to participate in the National Quiz on Partition Horrors Remembrance Day 2026.',
  'Enhanced students’ knowledge and awareness through online participation in the MyGov quiz.',
  'Recognised student participation through Certificates of Participation issued by the Ministry of Culture and MyGov.',
  'Promoted the values of peace, unity, compassion and communal harmony.',
  'Encouraged the younger generation to remember the experiences of Partition and learn meaningful lessons from history.',
]

const PARTITION_HIGHLIGHTS = `<h2>Expert Lecture</h2><p>An informative and enlightening lecture was delivered by Ms. Anurada from Swami Premanand Mahavidyalaya, Mukerian. She discussed the historical circumstances surrounding the Partition and elaborated on the experiences of people who faced displacement, separation, suffering and loss during this period, focusing on the human dimension of Partition and its lasting social and emotional impact.</p>
<h2>National Quiz</h2><p>Students were encouraged to participate in the “National Quiz on Partition Horrors Remembrance Day 2026”, organised through MyGov and the Ministry of Culture. The quiz provided an additional learning opportunity, enhanced students’ understanding of the historical significance of Partition, and resulted in Certificates of Participation for participating students.</p>
<h2>Values and Awareness</h2><p>The programme emphasised the values of peace, compassion, communal harmony, unity and mutual understanding. Students were encouraged to reflect on the consequences of division and violence and to contribute towards a peaceful and harmonious society.</p>
<h2>Participation</h2><p>The programme witnessed active participation by students and faculty members. The hybrid mode of organisation facilitated wider participation and engagement, and the lecture, awareness activities and National Quiz together provided a meaningful educational experience.</p>
<h2>Closing Message</h2><p>The event concluded with the message “Never Forget, Always Remember”, honouring the resilience of people affected by Partition and reaffirming the importance of peace, unity and harmony for future generations.</p>`

const SEMINAR_SUMMARY = `The Department of History, Khalsa College Garhdiwala, organised a National Seminar on the Indian Freedom Struggle to acquaint students with the rich legacy of India’s independence movement. The seminar was held in the Seminar Hall of the college and witnessed enthusiastic participation from students and faculty members.

Renowned academicians and historians shared their insights on the contributions of freedom fighters, the role of Punjab in the national movement, and the relevance of these lessons for the present generation. The sessions encouraged critical thinking and a deeper appreciation of the sacrifices made for the nation.

Interactive discussions and a documentary presentation helped students connect with the historical narrative beyond textbooks. The programme reinforced the department’s commitment to preserving historical memory and nurturing patriotic and constitutional values among youth.`

const SEMINAR_CONCLUSION = `The National Seminar on the Indian Freedom Struggle at Khalsa College Garhdiwala was an enriching academic exercise that brought history alive for the students. The expert sessions, combined with discussions and visual material, successfully inspired the younger generation to value the hard-earned freedom and contribute responsibly to the nation’s future.`

const SEMINAR_OUTCOMES = [
  'Created awareness among students about the Indian Freedom Struggle and its key milestones.',
  'Helped students appreciate the contributions of freedom fighters from Punjab and across India.',
  'Provided valuable historical insights through expert sessions by eminent historians.',
  'Encouraged critical thinking and research interest among students in modern Indian history.',
  'Promoted patriotic, constitutional and democratic values among the participants.',
  'Strengthened the department’s culture of academic engagement and historical inquiry.',
]

const placeholderSummary = (event: string) =>
  `${event} was organised by the department with the active participation of students and faculty members. The programme was designed to engage participants through interactive sessions, discussions and activities that enriched their learning experience.

Replace this text with a detailed account of your event — what happened, who was involved, and why it mattered.`

const placeholderOutcomes = [
  'Engaged students in meaningful, experience-based learning.',
  'Provided exposure to new ideas and perspectives.',
  'Encouraged participation, teamwork and collaboration.',
  'Strengthened the department’s academic and co-curricular culture.',
]

export const TEMPLATES: ReportTemplate[] = [
  {
    id: 'academic-event-report',
    name: 'Academic Event Report',
    description:
      'Complete sample report with cover, resource person, summary, outcomes, photo gallery, certificates and press coverage. The reusable structure for most college events.',
    category: 'academic',
    cover: { title: 'REPORT COVER', subtitle: 'EVENT TITLE', college: 'COLLEGE NAME', from: '#7c5cff', to: '#4f8cff' },
    included: ['Cover', 'Event Information', 'Resource Person', 'Theme', 'Photo', 'Brochure', 'Summary', 'Programme Highlights', 'Key Outcomes', 'Conclusion', 'Organised By', 'Snapshots', 'Certificates', 'Press Coverage'],
    build: () =>
      makeReport({
        eventInfo: {
          collegeName: 'KHALSA COLLEGE GARHDIWALA',
          department: 'DEPARTMENT OF HISTORY',
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
            photo: null,
          },
        ],
        brochure: {
          type: 'upload',
          dataUrl: null,
          caption:
            'Date: 14 August 2026 (Friday)\nTime: 11:00 AM onwards\nVenue: Seminar Hall, Khalsa College Garhdiwala\nMode: Hybrid (Offline + Online)\nOrganised by: Department of History, Khalsa College Garhdiwala\nResource Person: Ms. Anurada, Swami Premanand Mahavidyalaya, Mukerian',
        },
        summary: PARTITION_SUMMARY,
        outcomes: PARTITION_OUTCOMES,
        conclusion: PARTITION_CONCLUSION,
        organizedBy: 'Department of History\nKhalsa College Garhdiwala',
        customSections: [
          {
            title: 'Programme Highlights',
            content: PARTITION_HIGHLIGHTS,
            layout: 'text',
          },
        ],
      }),
  },
  {
    id: 'national-seminar',
    name: 'National Seminar Report',
    description:
      'Ready-to-edit seminar template — guest lectures, expert talks and academic discussions. Replace the content with your own event details.',
    category: 'seminar',
    cover: { title: 'SEMINAR', subtitle: 'REPORT', college: 'COLLEGE NAME', from: '#6366f1', to: '#22d3ee' },
    included: ['Cover', 'Event Information', 'Resource Person', 'Summary', 'Key Outcomes', 'Conclusion', 'Snapshots', 'Certificates'],
    build: () =>
      makeReport({
        hiddenSections: ['theme', 'brochure', 'organized-by', 'press-coverage'],
        eventInfo: {
          collegeName: 'KHALSA COLLEGE GARHDIWALA',
          department: 'DEPARTMENT OF HISTORY',
          eventName: 'NATIONAL SEMINAR ON INDIAN FREEDOM STRUGGLE',
          theme: 'Revisiting the Sacrifices, Rekindling the Patriotism',
          date: '2026-09-25',
          time: '10:00 AM – 1:00 PM',
          venue: 'Seminar Hall, Khalsa College Garhdiwala',
          mode: 'Offline',
          academicSession: '2026–27',
          organisedBy: 'Department of History, Khalsa College Garhdiwala',
          tagline: 'Azadi Ka Amrit Mahotsav',
        },
        resourcePersons: [
          {
            id: 'rp-1',
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
          dataUrl: null,
          caption:
            'Date: 25 September 2026\nTime: 10:00 AM – 1:00 PM\nVenue: Seminar Hall, Khalsa College Garhdiwala\nMode: Offline\nOrganised by: Department of History, Khalsa College Garhdiwala\nResource Person: Dr. Harjeet Singh, Guru Nanak Dev University, Amritsar',
        },
        summary: SEMINAR_SUMMARY,
        outcomes: SEMINAR_OUTCOMES,
        conclusion: SEMINAR_CONCLUSION,
        organizedBy: 'Department of History\nKhalsa College Garhdiwala',
      }),
  },
  {
    id: 'workshop-report',
    name: 'Workshop Report',
    description:
      'Hands-on workshop template — skill sessions, demonstrations and participant outputs.',
    category: 'workshop',
    cover: { title: 'WORKSHOP', subtitle: 'REPORT', college: 'COLLEGE NAME', from: '#f59e0b', to: '#ef4444' },
    included: ['Cover', 'Event Information', 'Resource Person', 'Summary', 'Key Outcomes', 'Conclusion', 'Snapshots', 'Certificates'],
    build: () =>
      makeReport({
        hiddenSections: ['theme', 'brochure', 'organized-by', 'press-coverage'],
        eventInfo: {
          collegeName: 'KHALSA COLLEGE GARHDIWALA',
          department: 'DEPARTMENT OF COMPUTER SCIENCE',
          eventName: 'HANDS-ON WORKSHOP ON WEB DEVELOPMENT',
          theme: 'Learning by Building',
          date: '2026-10-10',
          time: '9:30 AM – 4:00 PM',
          venue: 'Computer Lab, Khalsa College Garhdiwala',
          mode: 'Offline',
          academicSession: '2026–27',
          organisedBy: 'Department of Computer Science',
          tagline: 'Code. Create. Collaborate.',
        },
        resourcePersons: [
          {
            id: 'rp-1',
            name: 'Mr. Ravinder Singh',
            designation: 'Industry Mentor',
            department: 'Software Engineering',
            institution: 'TechNova Solutions',
            location: 'Jalandhar',
            photo: null,
          },
        ],
        summary: placeholderSummary('The Hands-on Workshop on Web Development'),
        outcomes: placeholderOutcomes,
        conclusion:
          'The workshop successfully combined theory with practice, leaving participants confident in building their own web projects.',
      }),
  },
  {
    id: 'custom-report',
    name: 'Custom Blank Report',
    description:
      'Start from the full structure with every section included — hide or reorder anything later.',
    category: 'custom',
    cover: { title: 'BLANK', subtitle: 'REPORT', college: 'COLLEGE NAME', from: '#64748b', to: '#0f172a' },
    included: ['Cover', 'Event Information', 'Resource Person', 'Theme', 'Photo', 'Brochure', 'Summary', 'Key Outcomes', 'Conclusion', 'Organised By', 'Snapshots', 'Certificates', 'Press Coverage'],
    build: () => makeReport({}),
  },
]

export function buildTemplate(id: string): Report | null {
  const t = TEMPLATES.find((t) => t.id === id)
  return t ? t.build() : null
}

export function createBlankReport(): Report {
  return makeReport({})
}

export function mergeReport(input: unknown): Report | null {
  if (!input || typeof input !== 'object') return null
  const base = createBlankReport()
  const src = input as Partial<Report>
  const merged: Report = {
    ...base,
    ...src,
    eventInfo: { ...base.eventInfo, ...(src.eventInfo ?? {}) },
    sections: Array.isArray(src.sections)
      ? src.sections.map((s, i) => ({
          ...base.sections[i % base.sections.length],
          ...s,
          order: typeof s.order === 'number' ? s.order : i,
        }))
      : base.sections,
    resourcePersons: Array.isArray(src.resourcePersons) ? src.resourcePersons : base.resourcePersons,
    outcomes: Array.isArray(src.outcomes) ? src.outcomes : base.outcomes,
    snapshots: Array.isArray(src.snapshots) ? src.snapshots : base.snapshots,
    certificates: Array.isArray(src.certificates) ? src.certificates : base.certificates,
    pressCoverage: Array.isArray(src.pressCoverage) ? src.pressCoverage : base.pressCoverage,
    customSections: Array.isArray(src.customSections) ? src.customSections : base.customSections,
    updatedAt: new Date().toISOString(),
  }
  return merged
}
