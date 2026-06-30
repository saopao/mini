import { describe, expect, it } from 'vitest'
import { calculatePaybackProgress, calculateTargets, calculateTodayProfit } from '../formulas'
import { buildDashboardSnapshot, buildOperatingReport } from '../reportBuilder'
import { simulateScenario, validateSimulationPatch } from '../simulate'
import type { LedgerRecord, ShopModel } from '../types'

const model: ShopModel = {
  id: 'shop_test',
  industryId: 'tea_drink',
  industryName: '奶茶/饮品',
  status: 'planning',
  initialInvestment: 120000,
  monthlyFixedCost: 18000,
  businessDaysPerMonth: 26,
  grossMarginRate: 0.65,
  paybackMonths: 12,
  avgOrderValue: 25,
  maxDailyOrders: 120,
  createdAt: '2026-06-29T00:00:00.000Z',
  updatedAt: '2026-06-29T00:00:00.000Z'
}

describe('calculator formulas', () => {
  it('matches TC-FORMULA-001 standard calculation', () => {
    const result = calculateTargets(model)
    expect(result.monthlyProfitTarget).toBe(10000)
    expect(result.monthlyGrossProfitTarget).toBe(28000)
    expect(result.monthlyRevenueTarget).toBe(43076.92)
    expect(result.dailyRevenueTarget).toBe(1656.8)
    expect(result.dailyOrderTarget).toBe(66.27)
    expect(result.dailyFixedCost).toBe(692.31)
  })

  it('matches TC-FORMULA-003 today profit', () => {
    expect(calculateTodayProfit(model, 1680, 1148)).toBe(-748.31)
  })

  it('matches TC-FORMULA-004 payback progress', () => {
    expect(calculatePaybackProgress(120000, 45600)).toBe(0.38)
  })

  it('does not return NaN or Infinity for invalid formula inputs', () => {
    const result = calculateTargets({
      ...model,
      grossMarginRate: 0,
      paybackMonths: 0,
      businessDaysPerMonth: 0,
      avgOrderValue: 0
    })
    Object.values(result).forEach((value) => {
      expect(Number.isFinite(value)).toBe(true)
    })
  })
})

describe('report and dashboard', () => {
  it('builds a report with risk and advice', () => {
    const report = buildOperatingReport(model)
    expect(report.dailyRevenueTarget).toBe(1656.8)
    expect(report.riskItems.length).toBeGreaterThan(0)
    expect(report.priorityAdvice.length).toBe(3)
  })

  it('updates dashboard aggregation for income and expense', () => {
    const records: LedgerRecord[] = [
      createRecord('income', 200, '2026-06-29'),
      createRecord('expense', 120, '2026-06-29')
    ]
    const snapshot = buildDashboardSnapshot(model, records, '2026-06-29')
    expect(snapshot.todayIncome).toBe(200)
    expect(snapshot.todayExpense).toBe(120)
    expect(snapshot.todayEstimatedProfit).toBe(-682.31)
    expect(snapshot.recentRecords.length).toBe(2)
  })
})

describe('simulation', () => {
  it('does not mutate the original model', () => {
    const result = simulateScenario(model, { avgOrderValue: 30 })
    expect(model.avgOrderValue).toBe(25)
    expect(result.patchedModel.avgOrderValue).toBe(30)
    expect(result.after.dailyOrderTarget).toBeLessThan(result.before.dailyOrderTarget)
  })

  it('validates out-of-range simulation inputs', () => {
    expect(validateSimulationPatch({ grossMarginRate: 1 })).toEqual([
      { field: 'grossMarginRate', message: '毛利率应在 1%-95% 之间' }
    ])
  })

  it('explains lower order pressure when avg order value increases', () => {
    const result = simulateScenario(model, { avgOrderValue: 30 })
    expect(result.after.dailyOrderTarget).toBeLessThan(result.before.dailyOrderTarget)
    expect(result.advice).toContain('所需单量下降')
  })
})

function createRecord(type: 'income' | 'expense', amount: number, date: string): LedgerRecord {
  return {
    id: `${type}_${amount}`,
    shopId: model.id,
    date,
    type,
    amount,
    category: type === 'income' ? '堂食' : '原料',
    createdAt: `2026-06-29T0${amount % 10}:00:00.000Z`,
    updatedAt: `2026-06-29T0${amount % 10}:00:00.000Z`
  }
}
