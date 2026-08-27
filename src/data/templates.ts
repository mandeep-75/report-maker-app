import {
  Report,
  Section,
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

export function createDefaultSections(): Section[] {
  return DEFAULT_SECTION_ORDER.map((type, index) => ({
    id: `section-${type}`,
    type,
    visible: true,
    label: SECTION_LABELS[type],
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

export interface ReportTemplate {
  id: string
  name: string
  description: string
  build: () => Report
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

export const TEMPLATES: ReportTemplate[] = [
  {
    id: 'partition-horrors-2026',
    name: 'Partition Horrors Remembrance Day 2026',
    description:
      'Complete sample report — Department of History, Khalsa College Garhdiwala, commemorating Partition Horrors Remembrance Day with a guest lecture and National Quiz.',
    build: () => {
      const r = createDefaultReport()
      r.eventInfo = {
        ...r.eventInfo,
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
      }
      r.resourcePersons = [
        {
          id: 'rp-1',
          name: 'Ms. Anurada',
          designation: 'HoD',
          department: 'Department of History',
          institution: 'Swami Premanand Mahavidyalaya',
          location: 'Mukerian',
          photo: null,
        },
      ]
      r.brochure = {
        type: 'upload',
        dataUrl: null,
        caption:
          'Date: 14 August 2026 (Friday)\nTime: 11:00 AM onwards\nVenue: Seminar Hall, Khalsa College Garhdiwala\nMode: Hybrid (Offline + Online)\nOrganised by: Department of History, Khalsa College Garhdiwala\nResource Person: Ms. Anurada, Swami Premanand Mahavidyalaya, Mukerian',
      }
      r.summary = PARTITION_SUMMARY
      r.outcomes = PARTITION_OUTCOMES
      r.conclusion = PARTITION_CONCLUSION
      r.organizedBy = 'Department of History\nKhalsa College Garhdiwala'
      return r
    },
  },
  {
    id: 'freedom-struggle-seminar',
    name: 'National Seminar on Indian Freedom Struggle',
    description:
      'Ready-to-edit template — Department of History, Khalsa College Garhdiwala, for seminars, guest lectures and awareness programmes. Replace the content with your own event details.',
    build: () => {
      const r = createDefaultReport()
      r.eventInfo = {
        ...r.eventInfo,
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
      }
      r.resourcePersons = [
        {
          id: 'rp-1',
          name: 'Dr. Harjeet Singh',
          designation: 'Professor',
          department: 'Department of History',
          institution: 'Guru Nanak Dev University',
          location: 'Amritsar',
          photo: null,
        },
      ]
      r.brochure = {
        type: 'upload',
        dataUrl: null,
        caption:
          'Date: 25 September 2026\nTime: 10:00 AM – 1:00 PM\nVenue: Seminar Hall, Khalsa College Garhdiwala\nMode: Offline\nOrganised by: Department of History, Khalsa College Garhdiwala\nResource Person: Dr. Harjeet Singh, Guru Nanak Dev University, Amritsar',
      }
      r.summary = SEMINAR_SUMMARY
      r.outcomes = SEMINAR_OUTCOMES
      r.conclusion = SEMINAR_CONCLUSION
      r.organizedBy = 'Department of History\nKhalsa College Garhdiwala'
      return r
    },
  },
]

export function buildTemplate(id: string): Report | null {
  const t = TEMPLATES.find((t) => t.id === id)
  return t ? t.build() : null
}

