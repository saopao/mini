import type { CalculationResult, DashboardPeriod, LedgerRecord, ShopModel } from './types'
import { daysInMonth, endOfMonth, endOfWeek, isDateInRange, lastNDays, lastNMonths, lastNWeeks, startOfMonth, startOfWeek } from '../../utils/date'
import { round } from '../../utils/number'

export interface ValidationError {
  field: keyof ShopModel | string
  message: string
}

export function validateShopModel(model: Partial<ShopModel>): ValidationError[] {
  const errors: ValidationError[] = []
  if (!model.initialInvestment || model.initialInvestment <= 0) {
    errors.push({ field: 'initialInvestment', message: '请输入大于 0 的前期投入' })
  }
  if (model.monthlyFixedCost === undefined || model.monthlyFixedCost < 0) {
    errors.push({ field: 'monthlyFixedCost', message: '请输入有效的每月固定支出' })
  }
  if (!Number.isInteger(model.businessDaysPerMonth) || !model.businessDaysPerMonth || model.businessDaysPerMonth < 1 || model.businessDaysPerMonth > 31) {
    errors.push({ field: 'businessDaysPerMonth', message: '营业天数应在 1-31 天之间' })
  }
  if (!model.grossMarginRate || model.grossMarginRate < 0.01 || model.grossMarginRate > 0.95) {
    errors.push({ field: 'grossMarginRate', message: '毛利率应在 1%-95% 之间' })
  }
  if (!model.avgOrderValue || model.avgOrderValue <= 0) {
    errors.push({ field: 'avgOrderValue', message: '请输入大于 0 的客单价' })
  }
  if (!Number.isInteger(model.paybackMonths) || !model.paybackMonths || model.paybackMonths < 1 || model.paybackMonths > 60) {
    errors.push({ field: 'paybackMonths', message: '回本周期应在 1-60 个月之间' })
  }
  return errors
}

export function calculateTargets(model: ShopModel): CalculationResult {
  const errors = validateShopModel(model)
  if (errors.length > 0) {
    return zeroCalculation()
  }

  const monthlyProfitTarget = model.initialInvestment / model.paybackMonths
  const monthlyGrossProfitTarget = model.monthlyFixedCost + monthlyProfitTarget
  const monthlyRevenueTarget = monthlyGrossProfitTarget / model.grossMarginRate
  const dailyRevenueTarget = monthlyRevenueTarget / model.businessDaysPerMonth
  const dailyOrderTarget = dailyRevenueTarget / model.avgOrderValue
  const dailyFixedCost = model.monthlyFixedCost / model.businessDaysPerMonth

  return {
    monthlyProfitTarget: round(monthlyProfitTarget),
    monthlyGrossProfitTarget: round(monthlyGrossProfitTarget),
    monthlyRevenueTarget: round(monthlyRevenueTarget),
    dailyRevenueTarget: round(dailyRevenueTarget),
    dailyOrderTarget: round(dailyOrderTarget),
    dailyFixedCost: round(dailyFixedCost)
  }
}

export function calculateTodayProfit(model: ShopModel, todayIncome: number, todayExpense: number): number {
  const { dailyFixedCost } = calculateTargets(model)
  return round(todayIncome * model.grossMarginRate - dailyFixedCost - todayExpense)
}

export function calculatePaybackProgress(initialInvestment: number, accumulatedEstimatedProfit: number): number {
  if (!Number.isFinite(initialInvestment) || initialInvestment <= 0) return 0
  return round(accumulatedEstimatedProfit / initialInvestment, 4)
}

export function sumRecords(records: LedgerRecord[], date: string): { income: number; expense: number } {
  return records
    .filter((record) => record.date === date)
    .reduce(
      (sum, record) => {
        if (record.type === 'income') sum.income += record.amount
        if (record.type === 'expense') sum.expense += record.amount
        return sum
      },
      { income: 0, expense: 0 }
    )
}

export function sumRecordsInRange(records: LedgerRecord[], startDate: string, endDate: string): { income: number; expense: number; recordCount: number; activeDays: number } {
  const activeDates = new Set<string>()
  const sum = records
    .filter((record) => isDateInRange(record.date, startDate, endDate))
    .reduce(
      (current, record) => {
        activeDates.add(record.date)
        current.recordCount += 1
        if (record.type === 'income') current.income += record.amount
        if (record.type === 'expense') current.expense += record.amount
        return current
      },
      { income: 0, expense: 0, recordCount: 0 }
    )

  return {
    ...sum,
    activeDays: activeDates.size
  }
}

export function getPeriodRange(date: string, period: DashboardPeriod): { startDate: string; endDate: string } {
  if (period === 'week') {
    return {
      startDate: startOfWeek(date),
      endDate: endOfWeek(date)
    }
  }
  if (period === 'month') {
    return {
      startDate: startOfMonth(date),
      endDate: endOfMonth(date)
    }
  }
  return {
    startDate: date,
    endDate: date
  }
}

export function calculatePeriodRevenueTarget(model: ShopModel, period: DashboardPeriod, date: string): number {
  const targets = calculateTargets(model)
  if (period === 'week') return round((targets.monthlyRevenueTarget * 7) / daysInMonth(date))
  if (period === 'month') return targets.monthlyRevenueTarget
  return targets.dailyRevenueTarget
}

export function calculatePeriodProfit(model: ShopModel, income: number, expense: number, activeDays: number, period: DashboardPeriod): number {
  if (period === 'day') return calculateTodayProfit(model, income, expense)
  const { dailyFixedCost } = calculateTargets(model)
  return round(income * model.grossMarginRate - dailyFixedCost * activeDays - expense)
}

export function buildTrend(model: ShopModel, records: LedgerRecord[], endDate: string) {
  return lastNDays(endDate, 7).map((date) => {
    const { income, expense } = sumRecords(records, date)
    return {
      date,
      income: round(income),
      profit: calculateTodayProfit(model, income, expense)
    }
  })
}

export function buildPeriodTrend(model: ShopModel, records: LedgerRecord[], date: string, period: DashboardPeriod) {
  if (period === 'week') {
    return lastNWeeks(date, 8).map(({ startDate, endDate }) => buildRangeTrendPoint(model, records, startDate, endDate, `${startDate.slice(5).replace('-', '/')}周`, period))
  }
  if (period === 'month') {
    return lastNMonths(date, 6).map(({ startDate, endDate }) => buildRangeTrendPoint(model, records, startDate, endDate, startDate.slice(0, 7).replace('-', '/'), period))
  }
  return buildTrend(model, records, date).map((point) => ({
    ...point,
    label: point.date.slice(5).replace('-', '/'),
    startDate: point.date,
    endDate: point.date
  }))
}

function buildRangeTrendPoint(model: ShopModel, records: LedgerRecord[], startDate: string, endDate: string, label: string, period: DashboardPeriod) {
  const { income, expense, activeDays } = sumRecordsInRange(records, startDate, endDate)
  return {
    date: endDate,
    label,
    startDate,
    endDate,
    income: round(income),
    profit: calculatePeriodProfit(model, income, expense, activeDays, period)
  }
}

function zeroCalculation(): CalculationResult {
  return {
    monthlyProfitTarget: 0,
    monthlyGrossProfitTarget: 0,
    monthlyRevenueTarget: 0,
    dailyRevenueTarget: 0,
    dailyOrderTarget: 0,
    dailyFixedCost: 0
  }
}
