export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_').trim() || 'Report'
}

export function exportFileName(eventName: string, date: string): string {
  const base = sanitizeFileName(eventName || 'Report')
  const d = date ? sanitizeFileName(date) : ''
  return d ? `${base}_${d}` : base
}
