import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getIndustryModel, industryModels } from '../constants/industryModels'
import { createId, nowIso } from '../utils/date'
import { shopRepository } from '../services/repository/localStorageRepo'
import type { ShopModel, ShopStatus } from '../services/calculator/types'

export interface ShopDraft {
  shopName?: string
  city?: string
  industryId?: string
  industryName?: string
  status: ShopStatus
  initialInvestment?: number
  monthlyFixedCost?: number
  businessDaysPerMonth?: number
  grossMarginRate?: number
  paybackMonths?: number
  avgOrderValue?: number
  maxDailyOrders?: number
}

export const useShopStore = defineStore('shop', () => {
  const currentModel = ref<ShopModel | null>(null)
  const draft = ref<ShopDraft>({
    status: 'planning'
  })

  const hasModel = computed(() => Boolean(currentModel.value))

  function load() {
    currentModel.value = shopRepository.get()
    if (currentModel.value) {
      draft.value = { ...currentModel.value }
    }
  }

  function selectIndustry(industryId: string, status: ShopStatus = draft.value.status ?? 'planning') {
    const industry = getIndustryModel(industryId)
    if (!industry) return
    draft.value = {
      ...draft.value,
      industryId: industry.id,
      industryName: industry.name,
      status,
      businessDaysPerMonth: draft.value.businessDaysPerMonth ?? industry.defaultBusinessDays,
      grossMarginRate: industry.defaultGrossMarginRate,
      avgOrderValue: industry.defaultAvgOrderValue,
      maxDailyOrders: industry.maxDailyOrders,
      paybackMonths: draft.value.paybackMonths ?? 12,
      initialInvestment: draft.value.initialInvestment ?? 120000,
      monthlyFixedCost: draft.value.monthlyFixedCost ?? 18000
    }
  }

  function updateDraft(patch: Partial<ShopDraft>) {
    draft.value = {
      ...draft.value,
      ...patch
    }
  }

  function ensureDraftDefaults() {
    if (!draft.value.industryId) {
      selectIndustry(industryModels[0].id)
    }
  }

  function createModelFromDraft(): ShopModel | null {
    ensureDraftDefaults()
    const now = nowIso()
    const source = currentModel.value
    const value = draft.value
    if (
      !value.industryId ||
      !value.industryName ||
      value.initialInvestment === undefined ||
      value.monthlyFixedCost === undefined ||
      value.businessDaysPerMonth === undefined ||
      value.grossMarginRate === undefined ||
      value.paybackMonths === undefined ||
      value.avgOrderValue === undefined
    ) {
      return null
    }

    return {
      id: source?.id ?? createId('shop'),
      shopName: value.shopName,
      city: value.city,
      industryId: value.industryId,
      industryName: value.industryName,
      status: value.status,
      initialInvestment: value.initialInvestment,
      monthlyFixedCost: value.monthlyFixedCost,
      businessDaysPerMonth: value.businessDaysPerMonth,
      grossMarginRate: value.grossMarginRate,
      paybackMonths: value.paybackMonths,
      avgOrderValue: value.avgOrderValue,
      maxDailyOrders: value.maxDailyOrders,
      createdAt: source?.createdAt ?? now,
      updatedAt: now
    }
  }

  function saveDraftAsModel(): ShopModel | null {
    const model = createModelFromDraft()
    if (!model) return null
    currentModel.value = model
    shopRepository.set(model)
    draft.value = { ...model }
    return model
  }

  function clearModel() {
    currentModel.value = null
    draft.value = { status: 'planning' }
    shopRepository.remove()
  }

  return {
    currentModel,
    draft,
    hasModel,
    load,
    selectIndustry,
    updateDraft,
    createModelFromDraft,
    saveDraftAsModel,
    clearModel
  }
})
