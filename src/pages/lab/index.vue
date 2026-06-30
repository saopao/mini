<template>
  <AppPage tab>
    <AppHeader title="实验室" />
    <view v-if="model && result" class="lab">
      <AppSegmented v-model="mode" :options="modeOptions" />

      <AppCard>
        <view class="lab__baseline">
          <text>当前方案基线</text>
          <text>{{ formatMoney(result.before.dailyRevenueTarget) }} / 日</text>
        </view>
        <MetricGrid :items="baselineItems" />
      </AppCard>

      <AppCard>
        <text class="lab__section-title">参数调整</text>
        <view class="lab__controls">
          <AppInput v-model="patch.avgOrderValue" mode="row" icon="客" label="客单价" input-type="digit" unit="元" />
          <AppInput v-model="patch.dailyOrderTarget" mode="row" icon="单" label="日单量" input-type="number" unit="单" />
          <AppInput v-model="patch.grossMarginRate" mode="row" icon="利" label="毛利率" input-type="digit" unit="%" />
          <AppAmountInput v-model="patch.monthlyFixedCost" mode="row" icon="支" label="固定支出（元/月）" />
          <AppInput v-model="patch.paybackMonths" mode="row" icon="回" label="回本周期" input-type="number" unit="个月" />
        </view>
      </AppCard>

      <ScenarioCompare :items="compareItems" />

      <AppToast :message="result.advice" type="warning" />

      <view class="lab__actions">
        <AppButton block @click="adoptScenario">采纳此方案</AppButton>
        <AppButton block variant="secondary" @click="resetPatch">恢复当前模型</AppButton>
      </view>
    </view>

    <AppEmpty v-else title="需要先保存经营模型" desc="实验室会基于当前模型推演，先完成一次测算更准确。">
      <AppButton @click="goCalculate">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppAmountInput from '../../components/base/AppAmountInput.vue'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppHeader from '../../components/base/AppHeader.vue'
import AppInput from '../../components/base/AppInput.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import AppToast from '../../components/base/AppToast.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import ScenarioCompare from '../../components/business/ScenarioCompare.vue'
import { trackEvent } from '../../services/analytics/events'
import type { SimulationPatch } from '../../services/calculator/types'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatDelta, formatMoney, formatOrders } from '../../utils/format'

const shopStore = useShopStore()
const reportStore = useReportStore()
const mode = ref('simulate')
const modeOptions = [
  { label: '模拟调整', value: 'simulate' },
  { label: '情景对比', value: 'compare' }
]

const patch = reactive({
  avgOrderValue: '',
  dailyOrderTarget: '',
  grossMarginRate: '',
  monthlyFixedCost: '',
  paybackMonths: ''
})

const model = computed(() => shopStore.currentModel)
const scenarioPatch = computed<SimulationPatch>(() => ({
  avgOrderValue: positiveNumber(patch.avgOrderValue),
  dailyOrderTarget: positiveNumber(patch.dailyOrderTarget),
  grossMarginRate: positiveNumber(patch.grossMarginRate) ? Number(patch.grossMarginRate) / 100 : undefined,
  monthlyFixedCost: nonNegativeNumber(patch.monthlyFixedCost),
  paybackMonths: positiveNumber(patch.paybackMonths)
}))

const result = computed(() => (model.value ? reportStore.runScenario(model.value, scenarioPatch.value) : null))
const baselineItems = computed(() => {
  if (!result.value || !model.value) return []
  return [
    { label: '日流水', value: formatMoney(result.value.before.dailyRevenueTarget), highlight: true },
    { label: '日单量', value: formatOrders(result.value.before.dailyOrderTarget) },
    { label: '月利润目标', value: formatMoney(result.value.before.monthlyProfitTarget, { compact: true }) },
    { label: '回本周期', value: `${model.value.paybackMonths} 月` }
  ]
})

const compareItems = computed(() => {
  if (!result.value || !model.value) return []
  const before = result.value.before
  const after = result.value.after
  const dailyRevenueDelta = formatDelta(percentChange(before.dailyRevenueTarget, after.dailyRevenueTarget), false)
  const orderDelta = formatDelta(percentChange(before.dailyOrderTarget, after.dailyOrderTarget), false)
  const profitDelta = formatDelta(percentChange(before.monthlyProfitTarget, after.monthlyProfitTarget), true)
  const paybackDeltaMonths = model.value.paybackMonths - result.value.patchedModel.paybackMonths
  return [
    {
      label: '日流水',
      before: formatMoney(before.dailyRevenueTarget),
      after: formatMoney(after.dailyRevenueTarget),
      delta: dailyRevenueDelta.text,
      positive: dailyRevenueDelta.positive
    },
    {
      label: '日单量',
      before: formatOrders(before.dailyOrderTarget),
      after: formatOrders(after.dailyOrderTarget),
      delta: orderDelta.text,
      positive: orderDelta.positive
    },
    {
      label: '月利润',
      before: formatMoney(before.monthlyProfitTarget),
      after: formatMoney(after.monthlyProfitTarget),
      delta: profitDelta.text,
      positive: profitDelta.positive
    },
    {
      label: '回本周期',
      before: `${model.value.paybackMonths} 月`,
      after: `${result.value.patchedModel.paybackMonths} 月`,
      delta: paybackDeltaMonths === 0 ? '持平' : paybackDeltaMonths > 0 ? `缩短 ${paybackDeltaMonths} 月` : `延长 ${Math.abs(paybackDeltaMonths)} 月`,
      positive: paybackDeltaMonths >= 0
    }
  ]
})

onShow(() => {
  shopStore.load()
  resetPatch()
})

function positiveNumber(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function nonNegativeNumber(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function percentChange(before: number, after: number): number {
  if (!before) return 0
  return ((after - before) / before) * 100
}

function resetPatch() {
  if (!shopStore.currentModel) return
  patch.avgOrderValue = String(shopStore.currentModel.avgOrderValue)
  patch.dailyOrderTarget = ''
  patch.grossMarginRate = String(Math.round(shopStore.currentModel.grossMarginRate * 100))
  patch.monthlyFixedCost = String(shopStore.currentModel.monthlyFixedCost)
  patch.paybackMonths = String(shopStore.currentModel.paybackMonths)
}

function adoptScenario() {
  if (!result.value) return
  uni.showModal({
    title: '采纳此方案？',
    content: '采纳后会更新当前经营模型，历史记账记录会按新模型重算。',
    success(modalResult) {
      if (!modalResult.confirm || !result.value) return
      shopStore.updateDraft(result.value.patchedModel)
      shopStore.saveDraftAsModel()
      trackEvent('scenario_run', { adopted: true })
      uni.showToast({ title: '模型已更新', icon: 'none' })
      uni.switchTab({ url: '/pages/dashboard/index' })
    }
  })
}

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
}
</script>

<style scoped lang="scss">
.lab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lab__baseline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.lab__section-title {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.lab__controls {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-top: 12px;
  background: #fff;
}

.lab__controls :deep(.app-input) {
  border-width: 0 0 1px;
  border-radius: 0;
  box-shadow: none;
}

.lab__controls :deep(.app-input:last-child) {
  border-bottom: 0;
}

.lab__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
