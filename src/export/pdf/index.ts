/**
 * PDF export entry — builds the shared document and renders it to a PDF blob
 * via @react-pdf/renderer. This and the DOCX entry hold ALL renderer-specific
 * imports, so they can be lazy-loaded in the browser.
 */

import { pdf } from '@react-pdf/renderer'
import { buildDocument } from '../builder'
import { DocIssue } from '../model'
import { PdfDocumentView } from './renderer'

export interface ExportPdfOptions {
  compact?: boolean
  /** Optional progress callback (0..1) for long documents. */
  onProgress?: (p: number) => void
}

export interface ExportResult {
  blob: Blob | null
  issues: DocIssue[]
}

/**
 * Build + render the report to a PDF Blob. Throws on render failure so the
 * caller can surface an error; the returned `blob` is null only on failure.
 */
export async function buildPdfBlob(
  report: Parameters<typeof buildDocument>[0],
  options: ExportPdfOptions = {}
): Promise<ExportResult> {
  options.onProgress?.(0.1)
  const doc = await buildDocument(report, { compact: options.compact ?? true })
  options.onProgress?.(0.4)

  const node = PdfDocumentView({ blocks: doc.blocks, ctx: { compact: options.compact ?? true } })
  options.onProgress?.(0.6)

  let blob: Blob
  try {
    // `pdf(<Doc/>).toBlob()` is the web-build-safe API (renderToBuffer is
    // Node-only in @react-pdf/renderer).
    const instance = pdf(node)
    blob = await instance.toBlob()
  } catch (err) {
    console.error('[export:pdf] render failed', err)
    throw err
  }
  options.onProgress?.(0.95)

  blob = blob ?? new Blob([], { type: 'application/pdf' })
  options.onProgress?.(1)
  return { blob, issues: doc.issues }
}