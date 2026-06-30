import type { CalculationResult, LedgerRecord, ShopModel } from './types'
import { lastNDays } from '../../utils/date'
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
