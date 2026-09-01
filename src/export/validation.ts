/**
 * Pre-export content validation. Never throws — returns structured issues so
 * the UI can surface warnings. Invalid images are handled inside the builder,
 * not here.
 */

import { Report } from '../data/reportSchema'

export interface ValidationResult {
  ok: boolean
  canExport: boolean
  issues: { level: 'warning' | 'error'; message: string }[]
}

export function validateReport(report: Report | null): ValidationResult {
  const issues: ValidationResult['issues'] = []
  if (!report || typeof report !== 'object') {
    return { ok: false, canExport: false, issues: [{ level: 'error', message: 'No report to export.' }] }
  }

  const event = report.eventInfo
  const hasFields =
    event.eventName.trim() ||
    event.collegeName.trim() ||
    event.department.trim() ||
    event.organisedBy.trim()

  if (!hasFields) {
    issues.push({ level: 'warning', message: 'The report has no event details yet — the cover will show placeholders.' })
  }
  if (event.mode && !['Offline', 'Online', 'Hybrid'].includes(event.mode)) {
    issues.push({ level: 'warning', message: 'The event mode is not a recognised value.' })
  }

  const visibleSections = report.sections.filter((s) => s.visible)
  if (!visibleSections.length) {
    issues.push({ level: 'error', message: 'All sections are hidden; there is nothing to export.' })
  }

  const longText = (label: string, len: number) => {
    if (len > 20000) issues.push({ level: 'warning', message: `${label} is very long and may span many pages.` })
  }
  longText('Summary', report.summary.length)
  longText('Conclusion', report.conclusion.length)

  const hasErrors = issues.some((i) => i.level === 'error')
  return { ok: !hasErrors, canExport: !hasErrors, issues }
}

/** Default export file name derived from the report content. */
export function defaultFileName(report: Report | null, ext: 'pdf' | 'docx'): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const base =
    slug(report?.eventInfo?.eventName ?? '') ||
    slug(report?.eventInfo?.collegeName ?? '') ||
    slug(report?.eventInfo?.reportTitle ?? '') ||
    'report'
  return `${base}.${ext}`
}