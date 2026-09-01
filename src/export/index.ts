/**
 * Public export API — single entry the UI calls. Both PDF and DOCX backends
 * are lazy-loaded via dynamic `import()` so their heavy renderer deps
 * (react-pdf, docx) ship as separate chunks and only load on export.
 */

import { Report } from '../data/reportSchema'
import { DocIssue } from './model'
import { defaultFileName, validateReport } from './validation'
import { saveBlob } from './save'

export type ExportFormat = 'pdf' | 'docx'

export interface ExportOptions {
  compact?: boolean
  onProgress?: (phase: string, p: number) => void
}

export interface ExportOutcome {
  ok: boolean
  saved: boolean
  issues: DocIssue[]
  canceled?: boolean
}

export interface ExportError {
  message: string
  issues?: DocIssue[]
}

async function loadBackend(format: ExportFormat) {
  if (format === 'pdf') {
    const { buildPdfBlob } = await import('./pdf')
    return { build: buildPdfBlob }
  }
  const { buildDocxBlob } = await import('./docx')
  return { build: buildDocxBlob }
}

/**
 * Validate, build, render and save an export. Returns structured outcomes so
 * the UI can show warnings without blocking a (partial) export.
 */
export async function exportReport(
  report: Report | null,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<ExportOutcome | ExportError> {
  const validation = validateReport(report)
  if (!validation.canExport) {
    return { ok: false, saved: false, issues: validation.issues }
  }

  try {
    const { build } = await loadBackend(format)
    options.onProgress?.('building', 0.05)
    const { blob, issues } = await build(report, {
      compact: options.compact ?? true,
      onProgress: (p) => options.onProgress?.('rendering', p),
    })

    if (!blob) {
      return { ok: false, saved: false, issues }
    }

    const allIssues = mergeWarnings(validation.issues, issues)
    saveBlob(blob, defaultFileName(report, format))
    return { ok: true, saved: true, issues: allIssues }
  } catch (err) {
    console.error(`[export:${format}] failed`, err)
    return {
      message: err instanceof Error ? err.message : 'Export failed unexpectedly.',
      issues: validation.issues,
    }
  }
}

function mergeWarnings(
  validation: ReturnType<typeof validateReport>['issues'],
  build: DocIssue[]
): DocIssue[] {
  const seen = new Set<string>()
  const out: DocIssue[] = []
  for (const i of [...validation, ...build]) {
    if (seen.has(i.message)) continue
    seen.add(i.message)
    out.push(i)
  }
  return out
}