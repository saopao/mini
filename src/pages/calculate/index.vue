<template>
  <AppPage>
    <view class="calculate">
      <view class="calculate__progress">
        <view class="calculate__progress-bar" />
        <text>1/6 步骤完成</text>
      </view>

      <view class="calculate__form">
        <AppInput v-model="form.shopName" mode="row" icon="店" label="店铺名称（选填）" placeholder="社区咖啡小店" />
        <AppAmountInput id="field-initialInvestment" ref="initialInvestmentRef" v-model="form.initialInvestment" mode="row" icon="投" label="前期投入（一次性）" :error="errors.initialInvestment" />
        <AppAmountInput id="field-monthlyFixedCost" ref="monthlyFixedCostRef" v-model="form.monthlyFixedCost" mode="row" icon="支" label="每月固定支出" :error="errors.monthlyFixedCost" />
        <AppInput id="field-businessDaysPerMonth" ref="businessDaysRef" v-model="form.businessDaysPerMonth" mode="row" icon="天" label="营业天数（每月）" input-type="number" unit="天" :error="errors.businessDaysPerMonth" />
        <AppInput id="field-grossMarginRate" ref="grossMarginRef" v-model="form.grossMarginRate" mode="row" icon="利" label="行业毛利率" input-type="digit" unit="%" :error="errors.grossMarginRate" />
        <AppAmountInput id="field-avgOrderValue" ref="avgOrderRef" v-model="form.avgOrderValue" mode="row" icon="客" label="客单价" :error="errors.avgOrderValue" />
        <AppInput id="field-paybackMonths" ref="paybackRef" v-model="form.paybackMonths" mode="row" icon="回" label="预期回本周期" input-type="number" unit="个月" :error="errors.paybackMonths" />
        <AppInput v-model="form.maxDailyOrders" mode="row" icon="单" label="最大日单量（选填）" input-type="number" unit="单" />
      </view>

      <AppCard>
        <view class="calculate__preview-title">
          <text>即时预估</text>
          <text>{{ selectedIndustryName }}</text>
        </view>
        <MetricGrid :items="previewItems" />
      </AppCard>

      <view class="calculate__footer">
        <AppButton block @click="submit">生成经营报告</AppButton>
        <text>系统将自动生成经营报告、单量压力和回本线</text>
      </view>
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onBackPress, onShow } from '@dcloudio/uni-app'
import AppAmountInput from '../../components/base/AppAmountInput.vue'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppInput from '../../components/base/AppInput.vue'
import AppPage from '../../components/base/AppPage.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import { calculateTargets, validateShopModel } from '../../services/calculator/formulas'
import type { ShopModel } from '../../services/calculator/types'
import { trackEvent } from '../../services/analytics/events'
import { useShopStore } from '../../stores/shop'
import { formatMoney, formatOrders } from '../../utils/format'
import { createId, nowIso } from '../../utils/date'

const shopStore = useShopStore()
const form = reactive({
  shopName: '',
  initialInvestment: '',
  monthlyFixedCost: '',
  businessDaysPerMonth: '',
  grossMarginRate: '',
  avgOrderValue: '',
  paybackMonths: '',
  maxDailyOrders: ''
})

const errors = reactive<Record<string, string>>({})
let initialSignature = ''
type FocusableInput = { focus: () => void }
const initialInvestmentRef = ref<FocusableInput | null>(null)
const monthlyFixedCostRef = ref<FocusableInput | null>(null)
const businessDaysRef = ref<FocusableInput | null>(null)
const grossMarginRef = ref<FocusableInput | null>(null)
const avgOrderRef = ref<FocusableInput | null>(null)
const paybackRef = ref<FocusableInput | null>(null)
const fieldRefs: Record<string, typeof initialInvestmentRef> = {
  initialInvestment: initialInvestmentRef,
  monthlyFixedCost: monthlyFixedCostRef,
  businessDaysPerMonth: businessDaysRef,
  grossMarginRate: grossMarginRef,
  avgOrderValue: avgOrderRef,
  paybackMonths: paybackRef
}

const selectedIndustryName = computed(() => shopStore.draft.industryName ?? '默认行业')

const previewModel = computed(() => buildModel())
const previewTargets = computed(() => (previewModel.value ? calculateTargets(previewModel.value) : null))
const previewItems = computed(() => [
  {
    label: '预计月流水',
    value: previewTargets.value ? formatMoney(previewTargets.value.monthlyRevenueTarget, { compact: true }) : '待输入'
  },
  {
    label: '预计日流水',
    value: previewTargets.value ? formatMoney(previewTargets.value.dailyRevenueTarget) : '待输入',
    highlight: true
  },
  {
    label: '预计日单量',
    value: previewTargets.value ? formatOrders(previewTargets.value.dailyOrderTarget) : '待输入'
  }
])

onShow(() => {
  if (!shopStore.draft.industryId) {
    shopStore.selectIndustry('tea_drink')
  }
  form.shopName = shopStore.draft.shopName ?? ''
  form.initialInvestment = String(shopStore.draft.initialInvestment ?? '')
  form.monthlyFixedCost = String(shopStore.draft.monthlyFixedCost ?? '')
  form.businessDaysPerMonth = String(shopStore.draft.businessDaysPerMonth ?? '')
  form.grossMarginRate = String(Math.round((shopStore.draft.grossMarginRate ?? 0) * 100) || '')
  form.avgOrderValue = String(shopStore.draft.avgOrderValue ?? '')
  form.paybackMonths = String(shopStore.draft.paybackMonths ?? '')
  form.maxDailyOrders = String(shopStore.draft.maxDailyOrders ?? '')
  initialSignature = JSON.stringify(form)
})

onBackPress(() => {
  if (JSON.stringify(form) === initialSignature) return false
  uni.showModal({
    title: '放弃当前输入？',
    content: '离开后未生成报告的内容不会保存。',
    success(result) {
      if (result.confirm) uni.navigateBack()
    }
  })
  return true
})

function buildModel(): ShopModel | null {
  const now = nowIso()
  if (!shopStore.draft.industryId || !shopStore.draft.industryName) return null
  return {
    id: shopStore.currentModel?.id ?? createId('draft'),
    shopName: form.shopName || undefined,
    industryId: shopStore.draft.industryId,
    industryName: shopStore.draft.industryName,
    status: shopStore.draft.status,
    initialInvestment: Number(form.initialInvestment),
    monthlyFixedCost: Number(form.monthlyFixedCost),
    businessDaysPerMonth: Number(form.businessDaysPerMonth),
    grossMarginRate: Number(form.grossMarginRate) / 100,
    paybackMonths: Number(form.paybackMonths),
    avgOrderValue: Number(form.avgOrderValue),
    maxDailyOrders: form.maxDailyOrders ? Number(form.maxDailyOrders) : undefined,
    createdAt: shopStore.currentModel?.createdAt ?? now,
    updatedAt: now
  }
}

function submit() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  const model = buildModel()
  if (!model) return
  const validationErrors = validateShopModel(model)
  validationErrors.forEach((error) => {
    errors[String(error.field)] = error.message
  })
  if (validationErrors.length > 0) {
    focusFirstError(validationErrors[0].field)
    uni.showToast({ title: validationErrors[0].message, icon: 'none' })
    return
  }

  shopStore.updateDraft({
    shopName: model.shopName,
    initialInvestment: model.initialInvestment,
    monthlyFixedCost: model.monthlyFixedCost,
    businessDaysPerMonth: model.businessDaysPerMonth,
    grossMarginRate: model.grossMarginRate,
    paybackMonths: model.paybackMonths,
    avgOrderValue: model.avgOrderValue,
    maxDailyOrders: model.maxDailyOrders
  })
  trackEvent('calculate_submit', { industryId: model.industryId })
  initialSignature = JSON.stringify(form)
  uni.navigateTo({ url: '/pages/report/index' })
}

function focusFirstError(field: keyof ShopModel | string) {
  const key = String(field)
  uni.pageScrollTo({
    selector: `#field-${key}`,
    duration: 180
  })
  setTimeout(() => {
    fieldRefs[key]?.value?.focus()
  }, 220)
}
</script>

<style scoped lang="scss">
.calculate {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
}

.calculate__progress {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.calculate__progress-bar {
  width: 76px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-brand-primary);
}

.calculate__form {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-card);
}

.calculate__form :deep(.app-input) {
  border-width: 0 0 1px;
  border-radius: 0;
  box-shadow: none;
}

.calculate__form :deep(.app-input:last-child) {
  border-bottom: 0;
}

.calculate__preview-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.calculate__footer {
  position: fixed;
  right: 16px;
  bottom: calc(14px + env(safe-area-inset-bottom));
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-align: center;
}

.calculate__footer text {
  color: var(--color-text-muted);
  font-size: 11px;
}
</style>
