import type { DashboardPeriod, DashboardSnapshot, IndustryModel, LedgerRecord, OperatingReport, ShopModel } from './types'
import { buildRiskItems, buildPriorityAdvice } from './riskRules'
import {
  buildPeriodTrend,
  buildTrend,
  calculatePaybackProgress,
  calculatePeriodProfit,
  calculatePeriodRevenueTarget,
  calculateTargets,
  calculateTodayProfit,
  getPeriodRange,
  sumRecords,
  sumRecordsInRange
} from './formulas'
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

export function buildDashboardSnapshot(model: ShopModel, records: LedgerRecord[], date: string, period: DashboardPeriod = 'day'): DashboardSnapshot {
  const targets = calculateTargets(model)
  const modelRecords = records.filter((record) => record.shopId === model.id)
  const today = sumRecords(modelRecords, date)
  const todayEstimatedProfit = calculateTodayProfit(model, today.income, today.expense)
  const trend7d = buildTrend(model, modelRecords, date)
  const periodRange = getPeriodRange(date, period)
  const periodRecords = sumRecordsInRange(modelRecords, periodRange.startDate, periodRange.endDate)
  const periodTargetRevenue = calculatePeriodRevenueTarget(model, period, date)
  const periodEstimatedProfit = calculatePeriodProfit(model, periodRecords.income, periodRecords.expense, periodRecords.activeDays, period)
  const accumulatedEstimatedProfit = modelRecords
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
  const accumulatedRounded = round(accumulated)
  const paybackProgress = calculatePaybackProgress(model.initialInvestment, accumulated)
  const remainingInvestment = round(Math.max(0, model.initialInvestment - accumulated))

  return {
    date,
    period,
    dailyRevenueTarget: targets.dailyRevenueTarget,
    todayIncome: round(today.income),
    todayExpense: round(today.expense),
    todayEstimatedProfit,
    completionRate: targets.dailyRevenueTarget > 0 ? round(today.income / targets.dailyRevenueTarget, 4) : 0,
    targetGap: round(targets.dailyRevenueTarget - today.income),
    accumulatedEstimatedProfit: accumulatedRounded,
    paybackProgress,
    trend7d,
    periodSummary: {
      period,
      label: getPeriodLabel(period),
      startDate: periodRange.startDate,
      endDate: periodRange.endDate,
      targetRevenue: periodTargetRevenue,
      income: round(periodRecords.income),
      expense: round(periodRecords.expense),
      estimatedProfit: periodEstimatedProfit,
      completionRate: periodTargetRevenue > 0 ? round(periodRecords.income / periodTargetRevenue, 4) : 0,
      targetGap: round(periodTargetRevenue - periodRecords.income),
      recordCount: periodRecords.recordCount,
      activeDays: period === 'day' ? 1 : periodRecords.activeDays
    },
    periodTrend: buildPeriodTrend(model, modelRecords, date, period),
    paybackStatus: {
      initialInvestment: model.initialInvestment,
      accumulatedEstimatedProfit: accumulatedRounded,
      paybackProgress,
      remainingInvestment,
      isNegative: accumulated < 0,
      isComplete: accumulated >= model.initialInvestment
    },
    recentRecords: modelRecords
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
  }
}

function getPeriodLabel(period: DashboardPeriod): string {
  if (period === 'week') return '本周'
  if (period === 'month') return '本月'
  return '今日'
}
