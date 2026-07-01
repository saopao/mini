import type { ScenarioPreset, ShopModel, SimulationPatch, SimulationResult, SimulationValidationError } from './types'
import { calculateTargets } from './formulas'
import { round } from '../../utils/number'

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

export function validateSimulationPatch(patch: SimulationPatch): SimulationValidationError[] {
  const errors: SimulationValidationError[] = []
  if (patch.avgOrderValue !== undefined && patch.avgOrderValue <= 0) {
    errors.push({ field: 'avgOrderValue', message: '请输入大于 0 的客单价' })
  }
  if (patch.dailyOrderTarget !== undefined && (!Number.isInteger(patch.dailyOrderTarget) || patch.dailyOrderTarget <= 0)) {
    errors.push({ field: 'dailyOrderTarget', message: '日单量应为大于 0 的整数' })
  }
  if (patch.grossMarginRate !== undefined && (patch.grossMarginRate < 0.01 || patch.grossMarginRate > 0.95)) {
    errors.push({ field: 'grossMarginRate', message: '毛利率应在 1%-95% 之间' })
  }
  if (patch.monthlyFixedCost !== undefined && patch.monthlyFixedCost < 0) {
    errors.push({ field: 'monthlyFixedCost', message: '请输入有效的固定支出' })
  }
  if (patch.paybackMonths !== undefined && (!Number.isInteger(patch.paybackMonths) || patch.paybackMonths < 1 || patch.paybackMonths > 60)) {
    errors.push({ field: 'paybackMonths', message: '回本周期应在 1-60 个月之间' })
  }
  return errors
}

export function buildScenarioPresets(model: ShopModel): ScenarioPreset[] {
  return [
    {
      code: 'current',
      label: '当前方案',
      desc: '不调整参数，用作对比基线。',
      result: simulateScenario(model, {})
    },
    {
      code: 'reduce-pressure',
      label: '降压方案',
      desc: '固定支出下降 10%，回本周期延长 3 个月。',
      result: simulateScenario(model, {
        monthlyFixedCost: round(model.monthlyFixedCost * 0.9),
        paybackMonths: Math.min(60, model.paybackMonths + 3)
      })
    },
    {
      code: 'improve-efficiency',
      label: '提效方案',
      desc: '客单价提高 10%，毛利率提高 3 个百分点。',
      result: simulateScenario(model, {
        avgOrderValue: round(model.avgOrderValue * 1.1),
        grossMarginRate: Math.min(0.95, round(model.grossMarginRate + 0.03, 4))
      })
    },
    {
      code: 'stress-test',
      label: '压力测试',
      desc: '客单价下降 10%，毛利率下降 3 个百分点，固定支出上升 10%。',
      result: simulateScenario(model, {
        avgOrderValue: round(model.avgOrderValue * 0.9),
        grossMarginRate: Math.max(0.01, round(model.grossMarginRate - 0.03, 4)),
        monthlyFixedCost: round(model.monthlyFixedCost * 1.1)
      })
    }
  ]
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
  const before = calculateTargets(base)
  const after = calculateTargets(next)
  const dailyOrderDelta = after.dailyOrderTarget - before.dailyOrderTarget

  if (
    next.avgOrderValue === base.avgOrderValue &&
    next.grossMarginRate === base.grossMarginRate &&
    next.monthlyFixedCost === base.monthlyFixedCost &&
    next.paybackMonths === base.paybackMonths
  ) {
    return '当前方案与基线一致，可以先调整一个变量看压力变化。'
  }
  if (dailyOrderDelta < 0) {
    if (next.avgOrderValue > base.avgOrderValue) return '客单价提高后，达到同一回本线所需单量下降。'
    return '调整后单量压力下降，但仍需要结合真实客流验证。'
  }
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
