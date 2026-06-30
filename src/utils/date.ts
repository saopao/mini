const DAY_MS = 24 * 60 * 60 * 1000

export function todayString(date = new Date()): string {
  return formatDate(date)
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00`)
  return formatDate(new Date(parsed.getTime() + days * DAY_MS))
}

export function lastNDays(endDate: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(endDate, index - count + 1))
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
