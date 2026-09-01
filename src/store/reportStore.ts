import { create } from 'zustand'
import { Report, SectionType, CustomSection, SECTION_LABELS } from '../data/reportSchema'
import { createDefaultReport } from '../data/templates'

interface ReportStore {
  report: Report
  activeSectionId: string | null
  previewZoom: number
  previewPage: number
  hasLoadedProject: boolean
  hydrated: boolean

  setReport: (report: Report) => void
  resetReport: () => void
  markLoaded: () => void
  setHydrated: (v: boolean) => void

  updateEventInfo: (updates: Partial<Report['eventInfo']>) => void

  addResourcePerson: () => void
  updateResourcePerson: (id: string, updates: Partial<Report['resourcePersons'][number]>) => void
  removeResourcePerson: (id: string) => void

  addSection: (type: SectionType, label?: string) => void
  removeSection: (id: string) => void
  toggleSectionVisibility: (id: string) => void
  toggleSectionHeading: (id: string) => void
  reorderSections: (fromIndex: number, toIndex: number) => void

  updateSummary: (html: string) => void
  updateConclusion: (html: string) => void

  addOutcome: () => void
  updateOutcome: (index: number, text: string) => void
  removeOutcome: (index: number) => void
  reorderOutcomes: (from: number, to: number) => void

  updateBrochure: (updates: Partial<Report['brochure']>) => void

  updatePhoto: (updates: Partial<Report['photo']>) => void

  addSnapshot: (dataUrl: string, caption?: string) => void
  removeSnapshot: (id: string) => void
  updateSnapshotCaption: (id: string, caption: string) => void
  setSnapshotLayout: (layout: Report['snapshotLayout']) => void

  addCertificate: (dataUrl: string, caption?: string) => void
  removeCertificate: (id: string) => void
  updateCertificateCaption: (id: string, caption: string) => void
  setCertificateLayout: (layout: Report['certificateLayout']) => void

  addPressCoverage: (item: Report['pressCoverage'][number]) => void
  removePressCoverage: (id: string) => void
  updatePressCoverage: (id: string, updates: Partial<Report['pressCoverage'][number]>) => void

  addCustomSection: (title: string, layout: CustomSection['layout']) => void
  updateCustomSection: (id: string, updates: Partial<Pick<CustomSection, 'title' | 'content' | 'layout'>>) => void
  removeCustomSection: (id: string) => void
  addCustomSectionImage: (id: string, dataUrl: string, caption?: string) => void
  removeCustomSectionImage: (id: string, imageId: string) => void
  updateCustomSectionImageCaption: (id: string, imageId: string, caption: string) => void

  setActiveSection: (id: string | null) => void
  setPreviewZoom: (zoom: number) => void
  setPreviewPage: (page: number) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useReportStore = create<ReportStore>()(
  (set) => ({
    report: createDefaultReport(),
    activeSectionId: 'section-event-info',
    previewZoom: 1,
      previewPage: 0,
      hasLoadedProject: false,
      hydrated: false,

      setReport: (report) => set({ report, hasLoadedProject: true, previewPage: 0 }),
      resetReport: () =>
        set({
          report: createDefaultReport(),
          activeSectionId: 'section-event-info',
          previewPage: 0,
          hasLoadedProject: false,
        }),
      markLoaded: () => set({ hasLoadedProject: true }),

      setHydrated: (v) => set({ hydrated: v }),

      updateEventInfo: (updates) =>
        set((state) => ({
          report: {
            ...state.report,
            eventInfo: { ...state.report.eventInfo, ...updates },
            updatedAt: new Date().toISOString(),
          },
        })),

      addResourcePerson: () =>
        set((state) => ({
          report: {
            ...state.report,
            resourcePersons: [
              ...state.report.resourcePersons,
              {
                id: uid(),
                name: '',
                designation: '',
                department: '',
                institution: '',
                location: '',
                photo: null,
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        })),

      updateResourcePerson: (id, updates) =>
        set((state) => ({
          report: {
            ...state.report,
            resourcePersons: state.report.resourcePersons.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeResourcePerson: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            resourcePersons: state.report.resourcePersons.filter((p) => p.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      addSection: (type, label) =>
        set((state) => {
          const id = `section-${type}-${uid()}`
          const section = {
            id,
            type,
            visible: true,
            label: label ?? SECTION_LABELS[type],
            showHeading: true,
            order: state.report.sections.length,
          }
          return {
            report: {
              ...state.report,
              sections: [...state.report.sections, section],
              updatedAt: new Date().toISOString(),
            },
            activeSectionId: id,
          }
        }),

      removeSection: (id) =>
        set((state) => {
          const section = state.report.sections.find((s) => s.id === id)
          const sections = state.report.sections.filter((s) => s.id !== id)
          let customSections = state.report.customSections
          if (section?.type === 'custom' && section.id.startsWith('section-custom-')) {
            const customId = section.id.replace('section-custom-', '')
            customSections = state.report.customSections.filter((c) => c.id !== customId)
          }
          return {
            report: { ...state.report, sections, customSections, updatedAt: new Date().toISOString() },
            activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
          }
        }),

      toggleSectionVisibility: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            sections: state.report.sections.map((s) =>
              s.id === id ? { ...s, visible: !s.visible } : s
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      toggleSectionHeading: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            sections: state.report.sections.map((s) =>
              s.id === id ? { ...s, showHeading: !s.showHeading } : s
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      reorderSections: (fromIndex, toIndex) =>
        set((state) => {
          const sections = [...state.report.sections]
          const [moved] = sections.splice(fromIndex, 1)
          sections.splice(toIndex, 0, moved)
          const reordered = sections.map((s, i) => ({ ...s, order: i }))
          return {
            report: { ...state.report, sections: reordered, updatedAt: new Date().toISOString() },
          }
        }),

      updateSummary: (html) =>
        set((state) => ({
          report: { ...state.report, summary: html, updatedAt: new Date().toISOString() },
        })),

      updateConclusion: (html) =>
        set((state) => ({
          report: { ...state.report, conclusion: html, updatedAt: new Date().toISOString() },
        })),

      addOutcome: () =>
        set((state) => ({
          report: {
            ...state.report,
            outcomes: [...state.report.outcomes, ''],
            updatedAt: new Date().toISOString(),
          },
        })),

      updateOutcome: (index, text) =>
        set((state) => ({
          report: {
            ...state.report,
            outcomes: state.report.outcomes.map((o, i) => (i === index ? text : o)),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeOutcome: (index) =>
        set((state) => ({
          report: {
            ...state.report,
            outcomes: state.report.outcomes.filter((_, i) => i !== index),
            updatedAt: new Date().toISOString(),
          },
        })),

      reorderOutcomes: (from, to) =>
        set((state) => {
          const outcomes = [...state.report.outcomes]
          const [moved] = outcomes.splice(from, 1)
          outcomes.splice(to, 0, moved)
          return { report: { ...state.report, outcomes, updatedAt: new Date().toISOString() } }
        }),

      updateBrochure: (updates) =>
        set((state) => ({
          report: {
            ...state.report,
            brochure: { ...state.report.brochure, ...updates },
            updatedAt: new Date().toISOString(),
          },
        })),

      updatePhoto: (updates) =>
        set((state) => ({
          report: {
            ...state.report,
            photo: { ...state.report.photo, ...updates },
            updatedAt: new Date().toISOString(),
          },
        })),

      addSnapshot: (dataUrl, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            snapshots: [...state.report.snapshots, { id: uid(), dataUrl, caption }],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeSnapshot: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            snapshots: state.report.snapshots.filter((s) => s.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateSnapshotCaption: (id, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            snapshots: state.report.snapshots.map((s) => (s.id === id ? { ...s, caption } : s)),
            updatedAt: new Date().toISOString(),
          },
        })),

      setSnapshotLayout: (layout) =>
        set((state) => ({
          report: { ...state.report, snapshotLayout: layout, updatedAt: new Date().toISOString() },
        })),

      addCertificate: (dataUrl, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            certificates: [...state.report.certificates, { id: uid(), dataUrl, caption }],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeCertificate: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            certificates: state.report.certificates.filter((c) => c.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateCertificateCaption: (id, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            certificates: state.report.certificates.map((c) =>
              c.id === id ? { ...c, caption } : c
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      setCertificateLayout: (layout) =>
        set((state) => ({
          report: { ...state.report, certificateLayout: layout, updatedAt: new Date().toISOString() },
        })),

      addPressCoverage: (item) =>
        set((state) => ({
          report: {
            ...state.report,
            pressCoverage: [...state.report.pressCoverage, item],
            updatedAt: new Date().toISOString(),
          },
        })),

      removePressCoverage: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            pressCoverage: state.report.pressCoverage.filter((p) => p.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      updatePressCoverage: (id, updates) =>
        set((state) => ({
          report: {
            ...state.report,
            pressCoverage: state.report.pressCoverage.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      addCustomSection: (title, layout) =>
        set((state) => {
          const id = uid()
          const sectionId = `section-custom-${id}`
          const customSection: CustomSection = { id, title, content: '', layout, images: [] }
          return {
            report: {
              ...state.report,
              customSections: [...state.report.customSections, customSection],
              sections: [
                ...state.report.sections,
                {
                  id: sectionId,
                  type: 'custom' as SectionType,
                  visible: true,
                  label: title,
                  showHeading: true,
                  order: state.report.sections.length,
                },
              ],
              updatedAt: new Date().toISOString(),
            },
            activeSectionId: sectionId,
          }
        }),

      updateCustomSection: (id, updates) =>
        set((state) => ({
          report: {
            ...state.report,
            customSections: state.report.customSections.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            sections: state.report.sections.map((s) =>
              s.id === `section-custom-${id}` && updates.title
                ? { ...s, label: updates.title }
                : s
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeCustomSection: (id) =>
        set((state) => ({
          report: {
            ...state.report,
            customSections: state.report.customSections.filter((c) => c.id !== id),
            sections: state.report.sections.filter((s) => s.id !== `section-custom-${id}`),
            updatedAt: new Date().toISOString(),
          },
        })),

      addCustomSectionImage: (id, dataUrl, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            customSections: state.report.customSections.map((c) =>
              c.id === id ? { ...c, images: [...c.images, { id: uid(), dataUrl, caption }] } : c
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeCustomSectionImage: (id, imageId) =>
        set((state) => ({
          report: {
            ...state.report,
            customSections: state.report.customSections.map((c) =>
              c.id === id ? { ...c, images: c.images.filter((img) => img.id !== imageId) } : c
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateCustomSectionImageCaption: (id, imageId, caption) =>
        set((state) => ({
          report: {
            ...state.report,
            customSections: state.report.customSections.map((c) =>
              c.id === id
                ? { ...c, images: c.images.map((img) => (img.id === imageId ? { ...img, caption } : img)) }
                : c
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      setActiveSection: (id) => set({ activeSectionId: id }),
      setPreviewZoom: (zoom) => set({ previewZoom: Math.max(0.3, Math.min(2, zoom)) }),
      setPreviewPage: (page) => set({ previewPage: Math.max(0, page) }),
    })
  )

