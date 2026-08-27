// Parse a date string without timezone shifting. <input type="date"> yields
// "YYYY-MM-DD", which `new Date()` interprets as UTC midnight — formatting it in
// a negative-offset timezone would render the previous day.
function parseLocalDate(date: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d
}

export function formatDateWithWeekday(date: string): string {
  if (!date) return ''
  const d = parseLocalDate(date)
  if (!d) return date
  const base = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  return `${base} (${weekday})`
}
