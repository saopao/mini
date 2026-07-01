import { defineStore } from 'pinia'
import { computed } from 'vue'
import { getIndustryModel } from '../constants/industryModels'
import { buildDashboardSnapshot, buildOperatingReport } from '../services/calculator/reportBuilder'
import { buildScenarioPresets, simulateScenario } from '../services/calculator/simulate'
import type { DashboardPeriod, ShopModel, SimulationPatch } from '../services/calculator/types'
import { todayString } from '../utils/date'
import { useLedgerStore } from './ledger'
import { useShopStore } from './shop'

export const useReportStore = defineStore('report', () => {
  const shopStore = useShopStore()
  const ledgerStore = useLedgerStore()

  const activeModel = computed(() => shopStore.createModelFromDraft() ?? shopStore.currentModel)

  const report = computed(() => {
    const model = activeModel.value
    if (!model) return null
    return buildOperatingReport(model, getIndustryModel(model.industryId))
  })

  const dashboard = computed(() => {
    const model = shopStore.currentModel
    if (!model) return null
    return buildDashboardSnapshot(model, ledgerStore.records, todayString())
  })

  function buildReportFor(model: ShopModel) {
    return buildOperatingReport(model, getIndustryModel(model.industryId))
  }

  function buildDashboardFor(date: string, period: DashboardPeriod = 'day') {
    if (!shopStore.currentModel) return null
    return buildDashboardSnapshot(shopStore.currentModel, ledgerStore.records, date, period)
  }

  function runScenario(model: ShopModel, patch: SimulationPatch) {
    return simulateScenario(model, patch)
  }

  function getScenarioPresets(model: ShopModel) {
    return buildScenarioPresets(model)
  }

  return {
    activeModel,
    report,
    dashboard,
    buildReportFor,
    buildDashboardFor,
    runScenario,
    getScenarioPresets
  }
})
