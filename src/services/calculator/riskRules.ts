import type { IndustryModel, RiskItem, ShopModel } from './types'
import { calculateTargets } from './formulas'

export function buildRiskItems(model: ShopModel, industry?: IndustryModel): RiskItem[] {
  const targets = calculateTargets(model)
  const fixedCostRatio = targets.monthlyRevenueTarget > 0 ? model.monthlyFixedCost / targets.monthlyRevenueTarget : 0
  const items: RiskItem[] = []

  if (fixedCostRatio > 0.4) {
    items.push({
      code: 'FIXED_COST_HIGH',
      title: '固定成本压力',
      level: 'danger',
      message: '固定支出占比偏高，对流水要求较大。'
    })
  } else if (fixedCostRatio >= 0.25) {
    items.push({
      code: 'FIXED_COST_MEDIUM',
      title: '固定成本压力',
      level: 'warning',
      message: '固定支出有压力，需要持续盯住房租和人工。'
    })
  } else {
    items.push({
      code: 'FIXED_COST_LOW',
      title: '固定成本压力',
      level: 'success',
      message: '固定支出占比较低，经营容错率相对更好。'
    })
  }

  if (model.maxDailyOrders && targets.dailyOrderTarget > model.maxDailyOrders * 0.85) {
    items.push({
      code: 'ORDER_PRESSURE_HIGH',
      title: '单量压力',
      level: 'danger',
      message: '目标接近日接待上限，新店冷启动难度高。'
    })
  } else {
    items.push({
      code: 'ORDER_PRESSURE_NORMAL',
      title: '单量压力',
      level: 'success',
      message: '当前单量目标仍有调整空间。'
    })
  }

  if (model.paybackMonths <= 6) {
    items.push({
      code: 'PAYBACK_AGGRESSIVE',
      title: '回本周期',
      level: 'warning',
      message: '回本目标较激进，适合对比，不宜默认乐观。'
    })
  } else if (model.paybackMonths > 24) {
    items.push({
      code: 'PAYBACK_LONG',
      title: '回本周期',
      level: 'warning',
      message: '回本周期偏长，需要复核投入和资金效率。'
    })
  } else {
    items.push({
      code: 'PAYBACK_NORMAL',
      title: '回本周期',
      level: 'success',
      message: '回本周期处于常规测算区间。'
    })
  }

  if (industry && model.grossMarginRate < industry.grossMarginRange[0] - 0.05) {
    items.push({
      code: 'MARGIN_LOW',
      title: '毛利率',
      level: 'warning',
      message: '毛利率低于行业常见水平，请复核定价或成本。'
    })
  } else {
    items.push({
      code: 'MARGIN_OK',
      title: '毛利率',
      level: 'success',
      message: '毛利率处于可解释区间，后续以真实数据校准。'
    })
  }

  if (industry && model.avgOrderValue > industry.avgOrderValueRange[1] * 1.3) {
    items.push({
      code: 'TICKET_OPTIMISTIC',
      title: '客单价',
      level: 'warning',
      message: '客单价假设偏乐观，需要验证用户接受度。'
    })
  }

  return items
}

export function buildPriorityAdvice(items: RiskItem[]): string[] {
  const advice: string[] = []
  if (items.some((item) => item.code === 'FIXED_COST_HIGH' || item.code === 'FIXED_COST_MEDIUM')) {
    advice.push('先复核每月固定支出，尤其是房租和人工。')
  }
  if (items.some((item) => item.code === 'ORDER_PRESSURE_HIGH')) {
    advice.push('验证日单量是否接近接待上限，不要只靠乐观客流。')
  }
  if (items.some((item) => item.code === 'MARGIN_LOW')) {
    advice.push('优先检查毛利率，确认原料、平台费和折扣是否吃掉利润。')
  }
  if (advice.length < 3) {
    advice.push('用真实记账数据校准模型，不要只看预测流水。')
    advice.push('先跑一周看板，再决定是否调整客单价或成本。')
  }
  return advice.slice(0, 3)
}
