import { Report, Section } from '../data/reportSchema'
import { htmlToBlocks } from './htmlToRuns'

export function isSectionEmpty(section: Section, report: Report): boolean {
  const { eventInfo, resourcePersons } = report
  switch (section.type) {
    case 'event-info':
      return false
    case 'theme':
      return !eventInfo.theme.trim()
    case 'resource-person':
      return resourcePersons.length === 0
      case 'brochure':
        return !report.brochure.dataUrl && !report.brochure.caption.trim()
    case 'summary':
      return htmlToBlocks(report.summary).every((b) => b.runs.every((r) => !r.text.trim()))
    case 'outcomes':
      return report.outcomes.filter((o) => o.trim()).length === 0
    case 'conclusion':
      return htmlToBlocks(report.conclusion).every((b) => b.runs.every((r) => !r.text.trim()))
    case 'organized-by':
      return (
        !report.organizedBy.trim() &&
        !eventInfo.organisedBy.trim() &&
        !eventInfo.department.trim() &&
        !eventInfo.collegeName.trim()
      )
    case 'snapshots':
      return report.snapshots.filter((s) => s.dataUrl).length === 0
    case 'certificates':
      return report.certificates.filter((c) => c.dataUrl).length === 0
    case 'press-coverage':
      return report.pressCoverage.filter((p) => p.dataUrl).length === 0
    default:
      return false
  }
}
