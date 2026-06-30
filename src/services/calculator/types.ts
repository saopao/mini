export type ShopStatus = 'planning' | 'opened'

export type RiskLevel = 'success' | 'warning' | 'danger'

export interface IndustryModel {
  id: string
  name: string
  icon: string
  defaultGrossMarginRate: number
  grossMarginRange: [number, number]
  defaultAvgOrderValue: number
  avgOrderValueRange: [number, number]
  defaultBusinessDays: number
  defaultRiskLevel: RiskLevel
  riskLabel: string
  commonFixedCostItems: string[]
  commonExpenseCategories: string[]
  suggestions: string[]
  maxDailyOrders: number
}

export interface ShopModel {
  id: string
  shopName?: string
  city?: string
  industryId: string
  industryName: string
  status: ShopStatus
  initialInvestment: number
  monthlyFixedCost: number
  businessDaysPerMonth: number
  grossMarginRate: number
  paybackMonths: number
  avgOrderValue: number
  maxDailyOrders?: number
  createdAt: string
  updatedAt: string
}

export type LedgerType = 'income' | 'expense'

export interface LedgerRecord {
  id: string
  shopId: string
  date: string
  type: LedgerType
  amount: number
  category: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface CalculationResult {
  monthlyProfitTarget: number
  monthlyGrossProfitTarget: number
  monthlyRevenueTarget: number
  dailyRevenueTarget: number
  dailyOrderTarget: number
  dailyFixedCost: number
}

export interface RiskItem {
  code: string
  title: string
  level: RiskLevel
  message: string
}

export interface OperatingReport extends CalculationResult {
  shopId: string
  conclusion: string
  riskItems: RiskItem[]
  priorityAdvice: string[]
  generatedAt: string
}

export interface DashboardSnapshot {
  date: string
  dailyRevenueTarget: number
  todayIncome: number
  todayExpense: number
  todayEstimatedProfit: number
  completionRate: number
  targetGap: number
  accumulatedEstimatedProfit: number
  paybackProgress: number
  trend7d: Array<{ date: string; income: number; profit: number }>
  recentRecords: LedgerRecord[]
}

export interface SimulationPatch {
  avgOrderValue?: number
  dailyOrderTarget?: number
  grossMarginRate?: number
  monthlyFixedCost?: number
  paybackMonths?: number
}

export interface SimulationResult {
  before: CalculationResult
  after: CalculationResult
  patchedModel: ShopModel
  advice: string
}
