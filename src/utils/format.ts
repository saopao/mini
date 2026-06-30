import { ceilUnits, round } from './number'

export function formatMoney(value: number, options: { compact?: boolean } = {}): string {
  if (!Number.isFinite(value)) return '¥0'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (options.compact && abs >= 10000) {
    return `${sign}¥${round(abs / 10000, 1)}万`
  }
  return `${sign}¥${round(abs, 2).toLocaleString('zh-CN', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`
}

export function formatMoneyCompact(value: number): string {
  return formatMoney(value, { compact: true })
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '0%'
  return `${round(value * 100, digits)}%`
}

export function formatOrders(value: number): string {
  return `${ceilUnits(value)} 单`
}

export function formatDelta(value: number, positiveIsGood = true): { text: string; positive: boolean } {
  const rounded = round(value, 1)
  const prefix = rounded > 0 ? '+' : ''
  return {
    text: `${prefix}${rounded}%`,
    positive: positiveIsGood ? rounded >= 0 : rounded <= 0
  }
}
