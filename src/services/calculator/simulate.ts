import type { ShopModel, SimulationPatch, SimulationResult } from './types'
import { calculateTargets } from './formulas'

export function simulateScenario(model: ShopModel, patch: SimulationPatch): SimulationResult {
  const before = calculateTargets(model)
  const patchedModel = applyPatch(model, patch)
  const after = calculateTargets(patchedModel)

  return {
    before,
    after,
    patchedModel,
    advice: buildSimulationAdvice(model, patchedModel, before.dailyRevenueTarget, after.dailyRevenueTarget)
  }
}

function applyPatch(model: ShopModel, patch: SimulationPatch): ShopModel {
  const next = {
    ...model,
    avgOrderValue: patch.avgOrderValue ?? model.avgOrderValue,
    grossMarginRate: patch.grossMarginRate ?? model.grossMarginRate,
    monthlyFixedCost: patch.monthlyFixedCost ?? model.monthlyFixedCost,
    paybackMonths: patch.paybackMonths ?? model.paybackMonths
  }

  if (patch.dailyOrderTarget && patch.dailyOrderTarget > 0) {
    const currentTargets = calculateTargets(next)
    next.avgOrderValue = currentTargets.dailyRevenueTarget / patch.dailyOrderTarget
  }

  return next
}

function buildSimulationAdvice(base: ShopModel, next: ShopModel, beforeDailyTarget: number, afterDailyTarget: number): string {
  if (afterDailyTarget < beforeDailyTarget) {
    if (next.monthlyFixedCost < base.monthlyFixedCost) return '固定支出下降后，日流水压力同步降低。'
    if (next.grossMarginRate > base.grossMarginRate) return '毛利率提升会直接降低回本所需流水。'
    if (next.paybackMonths > base.paybackMonths) return '延长回本周期能降低日目标，但资金回收会变慢。'
    return '调整后经营压力有所下降，可结合真实记录继续验证。'
  }
  if (next.paybackMonths < base.paybackMonths) return '回本周期变短会抬高日流水目标，适合作为激进方案对比。'
  if (next.monthlyFixedCost > base.monthlyFixedCost) return '固定支出上升会压低容错率，建议先确认是否必要。'
  return '调整后经营压力上升，建议谨慎作为默认方案。'
}
