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

export function startOfWeek(date: string): string {
  const parsed = parseDate(date)
  const day = parsed.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  return formatDate(new Date(parsed.getTime() + mondayOffset * DAY_MS))
}

export function endOfWeek(date: string): string {
  return addDays(startOfWeek(date), 6)
}

export function startOfMonth(date: string): string {
  const parsed = parseDate(date)
  return formatDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
}

export function endOfMonth(date: string): string {
  const parsed = parseDate(date)
  return formatDate(new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0))
}

export function daysInMonth(date: string): number {
  const parsed = parseDate(date)
  return new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
}

export function addMonths(date: string, months: number): string {
  const parsed = parseDate(date)
  return formatDate(new Date(parsed.getFullYear(), parsed.getMonth() + months, parsed.getDate()))
}

export function lastNWeeks(endDate: string, count: number): Array<{ startDate: string; endDate: string }> {
  const currentWeekStart = startOfWeek(endDate)
  return Array.from({ length: count }, (_, index) => {
    const startDate = addDays(currentWeekStart, (index - count + 1) * 7)
    return {
      startDate,
      endDate: addDays(startDate, 6)
    }
  })
}

export function lastNMonths(endDate: string, count: number): Array<{ startDate: string; endDate: string }> {
  const currentMonthStart = startOfMonth(endDate)
  return Array.from({ length: count }, (_, index) => {
    const startDate = addMonths(currentMonthStart, index - count + 1)
    return {
      startDate,
      endDate: endOfMonth(startDate)
    }
  })
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
