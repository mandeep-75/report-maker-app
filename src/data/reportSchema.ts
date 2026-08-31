export type SectionType =
  | 'event-info'
  | 'theme'
  | 'resource-person'
  | 'brochure'
  | 'summary'
  | 'outcomes'
  | 'conclusion'
  | 'organized-by'
  | 'snapshots'
  | 'certificates'
  | 'press-coverage'
  | 'photo'
  | 'custom'

export interface Section {
  id: string
  type: SectionType
  visible: boolean
  label: string
  order: number
  showHeading?: boolean
}

export interface EventInfo {
  collegeName: string
  department: string
  reportTitle: string
  eventName: string
  theme: string
  date: string
  time: string
  venue: string
  mode: 'Offline' | 'Online' | 'Hybrid'
  academicSession: string
  organisedBy: string
  tagline: string
}

export interface ResourcePerson {
  id: string
  name: string
  designation: string
  department: string
  institution: string
  location: string
  photo: string | null
}

export interface ImageItem {
  id: string
  dataUrl: string
  caption?: string
}

export interface PressCoverageItem {
  id: string
  dataUrl: string
  publication: string
  date: string
  caption: string
}

export type GalleryLayout = '1' | '2' | '3' | '4' | '6' | 'large-small' | 'full'

export type CertificateLayout = '1' | '2' | '4' | '6'

export interface Brochure {
  type: 'auto' | 'upload'
  dataUrl: string | null
  caption: string
}

export interface Photo {
  dataUrl: string | null
  caption: string
}

export interface CustomSection {
  id: string
  title: string
  content: string
  layout: 'text' | 'gallery' | 'photo' | 'list' | 'quote' | 'table'
  images: ImageItem[]
}

export interface Report {
  id: string
  createdAt: string
  updatedAt: string
  sections: Section[]
  eventInfo: EventInfo
  resourcePersons: ResourcePerson[]
  brochure: Brochure
  photo: Photo
  summary: string
  outcomes: string[]
  conclusion: string
  organizedBy: string
  snapshots: ImageItem[]
  snapshotLayout: GalleryLayout
  certificates: ImageItem[]
  certificateLayout: CertificateLayout
  pressCoverage: PressCoverageItem[]
  customSections: CustomSection[]
}

export const SECTION_LABELS: Record<SectionType, string> = {
  'event-info': 'Event Information',
  theme: 'Theme',
  'resource-person': 'Resource Person',
  brochure: 'Brochure',
  summary: 'Summary',
  outcomes: 'Key Outcomes',
  conclusion: 'Conclusion',
  'organized-by': 'Organised By',
  snapshots: 'Snapshots',
  certificates: 'Certificates',
  'press-coverage': 'Press Coverage',
  photo: 'Photo',
  custom: 'Custom Section',
}

export const DEFAULT_SECTION_ORDER: SectionType[] = [
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
]
