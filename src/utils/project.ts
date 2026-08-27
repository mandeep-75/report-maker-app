import { Report } from '../data/reportSchema'

export function saveProjectFile(report: Report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = (report.eventInfo.eventName || 'report').replace(/[^a-z0-9]/gi, '_')
  a.href = url
  a.download = `${name || 'report'}.reportmaker.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function openProjectFile(): Promise<Report | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      try {
        const text = await file.text()
        const parsed = JSON.parse(text) as Report
        if (parsed && parsed.sections && parsed.eventInfo) resolve(parsed)
        else resolve(null)
      } catch {
        resolve(null)
      }
    }
    input.click()
  })
}
