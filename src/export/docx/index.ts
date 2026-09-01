/**
 * DOCX export entry — builds the shared document and packs it into a .docx
 * Blob via the `docx` library. Holds all DOCX-specific imports so this chunk
 * can be lazy-loaded in the browser.
 */

import { Packer } from 'docx'
import { buildDocument } from '../builder'
import { DocIssue } from '../model'
import { buildDocxDocument } from './renderer'

export interface ExportDocxOptions {
  compact?: boolean
  onProgress?: (p: number) => void
}

export async function buildDocxBlob(
  report: Parameters<typeof buildDocument>[0],
  options: ExportDocxOptions = {}
): Promise<{ blob: Blob | null; issues: DocIssue[] }> {
  options.onProgress?.(0.1)
  const doc = await buildDocument(report, { compact: options.compact ?? true })
  options.onProgress?.(0.4)

  let blob: Blob
  try {
    const packed = await buildDocxDocument(doc.blocks, { compact: options.compact ?? true })
    options.onProgress?.(0.7)
    blob = await Packer.toBlob(packed)
  } catch (err) {
    console.error('[export:docx] packing failed', err)
    throw err
  }
  options.onProgress?.(1)
  return { blob, issues: doc.issues }
}