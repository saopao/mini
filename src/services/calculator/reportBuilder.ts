import type { DashboardSnapshot, IndustryModel, LedgerRecord, OperatingReport, ShopModel } from './types'
import { buildRiskItems, buildPriorityAdvice } from './riskRules'
import { buildTrend, calculatePaybackProgress, calculateTargets, calculateTodayProfit, sumRecords } from './formulas'
import { nowIso } from '../../utils/date'
import { round } from '../../utils/number'

export function buildOperatingReport(model: ShopModel, industry?: IndustryModel): OperatingReport {
  const targets = calculateTargets(model)
  const riskItems = buildRiskItems(model, industry)
  return {
    ...targets,
    shopId: model.id,
    conclusion: `若想 ${model.paybackMonths} 个月回本，每天至少需要做到约 ¥${Math.ceil(targets.dailyRevenueTarget).toLocaleString('zh-CN')} 流水。`,
    riskItems,
    priorityAdvice: buildPriorityAdvice(riskItems),
    generatedAt: nowIso()
  }
}

export function buildDashboardSnapshot(model: ShopModel, records: LedgerRecord[], date: string): DashboardSnapshot {
  const targets = calculateTargets(model)
  const today = sumRecords(records, date)
  const todayEstimatedProfit = calculateTodayProfit(model, today.income, today.expense)
  const trend7d = buildTrend(model, records, date)
  const accumulatedEstimatedProfit = records
    .reduce((byDate, record) => {
      const entry = byDate.get(record.date) ?? { income: 0, expense: 0 }
      if (record.type === 'income') entry.income += record.amount
      if (record.type === 'expense') entry.expense += record.amount
      byDate.set(record.date, entry)
      return byDate
    }, new Map<string, { income: number; expense: number }>())
    .values()
  const accumulated = Array.from(accumulatedEstimatedProfit).reduce(
    (sum, item) => sum + calculateTodayProfit(model, item.income, item.expense),
    0
  )

  return {
    date,
    dailyRevenueTarget: targets.dailyRevenueTarget,
    todayIncome: round(today.income),
    todayExpense: round(today.expense),
    todayEstimatedProfit,
    completionRate: targets.dailyRevenueTarget > 0 ? round(today.income / targets.dailyRevenueTarget, 4) : 0,
    targetGap: round(targets.dailyRevenueTarget - today.income),
    accumulatedEstimatedProfit: round(accumulated),
    paybackProgress: calculatePaybackProgress(model.initialInvestment, accumulated),
    trend7d,
    recentRecords: records
      .filter((record) => record.shopId === model.id)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
  }
}
