export const EVENT_SYSTEM =
  'You are an expert writer of formal Indian college event reports. Write in clear, professional, ' +
  'polished English suitable for an official report. Keep a neutral, respectful tone. ' +
  'Do not use markdown, bold, italics, headings, or bullet symbols unless explicitly requested. ' +
  'Base everything on the event details provided and invent only reasonable, generic supporting detail.'

export function buildEventContext(info: {
  collegeName: string
  department: string
  reportTitle: string
  eventName: string
  theme: string
  date: string
  time: string
  venue: string
  mode: string
  academicSession: string
  organisedBy: string
}): string {
  const parts: string[] = []
  const add = (label: string, value: string) => {
    const v = value.trim()
    if (v) parts.push(`${label}: ${v}`)
  }
  add('College', info.collegeName)
  add('Department', info.department)
  add('Report title', info.reportTitle)
  add('Event name', info.eventName)
  add('Theme', info.theme)
  if (info.date) {
    parts.push(`Date: ${info.date}${info.time ? ' at ' + info.time : ''}`)
  } else if (info.time) {
    add('Time', info.time)
  }
  add('Venue', info.venue)
  add('Mode', info.mode)
  add('Academic session', info.academicSession)
  add('Organised by', info.organisedBy)

  if (!parts.length) return 'No specific event details were provided.'
  return parts.join(' · ')
}
