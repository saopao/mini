<template>
  <AppPage tab>
    <StorageRecoveryState v-if="storageIssue" desc="当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model && result" class="lab">
      <AppSegmented v-model="mode" :options="modeOptions" />

      <AppCard>
        <view class="lab__baseline">
          <text>当前方案基线</text>
          <text>{{ formatMoney(result.before.dailyRevenueTarget) }} / 日</text>
        </view>
        <MetricGrid :items="baselineItems" />
      </AppCard>

      <view v-if="mode === 'simulate'" class="lab__mode">
        <AppCard class="lab__guide">
          <text>先选一个变量试一试</text>
          <text>实验室只做推演，不会自动覆盖当前模型。</text>
          <view class="lab__quick">
            <AppChip @click="quickAdjust('avgOrderValue')">客单价 +10%</AppChip>
            <AppChip @click="quickAdjust('grossMarginRate')">毛利率 +3%</AppChip>
            <AppChip @click="quickAdjust('monthlyFixedCost')">固定支出 -10%</AppChip>
            <AppChip @click="quickAdjust('paybackMonths')">回本 +3 月</AppChip>
          </view>
        </AppCard>

        <AppCard>
          <text class="lab__section-title">参数调整</text>
          <view class="lab__controls">
            <AppInput v-model="patch.avgOrderValue" mode="row" icon="客" label="客单价" input-type="digit" unit="元" :error="fieldErrors.avgOrderValue" />
            <AppInput v-model="patch.dailyOrderTarget" mode="row" icon="单" label="日单量" input-type="number" unit="单" :error="fieldErrors.dailyOrderTarget" />
            <AppInput v-model="patch.grossMarginRate" mode="row" icon="利" label="毛利率" input-type="digit" unit="%" :error="fieldErrors.grossMarginRate" />
            <AppAmountInput v-model="patch.monthlyFixedCost" mode="row" icon="支" label="固定支出（元/月）" :error="fieldErrors.monthlyFixedCost" />
            <AppInput v-model="patch.paybackMonths" mode="row" icon="回" label="回本周期" input-type="number" unit="个月" :error="fieldErrors.paybackMonths" />
          </view>
        </AppCard>

        <ScenarioCompare :items="compareItems" />

        <AppToast :message="labMessage" type="warning" />

        <view class="lab__actions">
          <AppButton block @click="adoptScenario">采纳此方案</AppButton>
          <AppButton block variant="secondary" @click="resetPatch">恢复当前模型</AppButton>
          <AppButton block variant="ghost" @click="goReport">查看报告</AppButton>
        </view>
      </view>

      <view v-else class="lab__mode">
        <AppCard class="lab__guide">
          <text>先看几种常见情景</text>
          <text>对比结果用于理解压力变化，套用后仍需手动采纳。</text>
        </AppCard>

        <AppCard v-for="preset in scenarioPresets" :key="preset.code" class="lab__scenario">
          <view class="lab__scenario-head">
            <view>
              <text>{{ preset.label }}</text>
              <text>{{ preset.desc }}</text>
            </view>
            <button v-if="preset.code !== 'current'" @click="applyPreset(preset.code)">套用</button>
          </view>
          <view class="lab__scenario-grid">
            <view v-for="item in scenarioRows(preset)" :key="item.label">
              <text>{{ item.label }}</text>
              <text>{{ item.value }}</text>
              <text :class="{ 'lab__delta--up': item.positive, 'lab__delta--down': !item.positive }">{{ item.delta }}</text>
            </view>
          </view>
        </AppCard>
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
import AppChip from '../../components/base/AppChip.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppInput from '../../components/base/AppInput.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import AppToast from '../../components/base/AppToast.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import ScenarioCompare from '../../components/business/ScenarioCompare.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import { trackEvent } from '../../services/analytics/events'
import type { ScenarioPreset, ScenarioPresetCode, SimulationPatch } from '../../services/calculator/types'
import { validateSimulationPatch } from '../../services/calculator/simulate'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatDelta, formatMoney, formatOrders } from '../../utils/format'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
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
const storageIssue = computed(() => shopStore.storageError)
const scenarioPatch = computed<SimulationPatch>(() => ({
  avgOrderValue: optionalNumber(patch.avgOrderValue),
  dailyOrderTarget: optionalNumber(patch.dailyOrderTarget),
  grossMarginRate: optionalNumber(patch.grossMarginRate, (value) => value / 100),
  monthlyFixedCost: optionalNumber(patch.monthlyFixedCost),
  paybackMonths: optionalNumber(patch.paybackMonths)
}))
const validationErrors = computed(() => validateSimulationPatch(scenarioPatch.value))
const fieldErrors = computed<Record<string, string>>(() =>
  validationErrors.value.reduce(
    (errors, error) => ({
      ...errors,
      [error.field]: error.message
    }),
    {}
  )
)

const result = computed(() => {
  if (!model.value) return null
  return reportStore.runScenario(model.value, validationErrors.value.length ? {} : scenarioPatch.value)
})
const scenarioPresets = computed(() => (model.value ? reportStore.getScenarioPresets(model.value) : []))
const labMessage = computed(() => validationErrors.value[0]?.message ?? result.value?.advice ?? '')
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

function optionalNumber(value: string, transform: (value: number) => number = (current) => current): number | undefined {
  if (value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? transform(parsed) : undefined
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

function quickAdjust(field: keyof SimulationPatch) {
  if (!model.value) return
  resetPatch()
  if (field === 'avgOrderValue') patch.avgOrderValue = String(Math.round(model.value.avgOrderValue * 1.1))
  if (field === 'grossMarginRate') patch.grossMarginRate = String(Math.min(95, Math.round(model.value.grossMarginRate * 100 + 3)))
  if (field === 'monthlyFixedCost') patch.monthlyFixedCost = String(Math.round(model.value.monthlyFixedCost * 0.9))
  if (field === 'paybackMonths') patch.paybackMonths = String(Math.min(60, model.value.paybackMonths + 3))
}

function applyPreset(code: ScenarioPresetCode) {
  const preset = scenarioPresets.value.find((item) => item.code === code)
  if (!preset) return
  patch.avgOrderValue = String(Math.round(preset.result.patchedModel.avgOrderValue))
  patch.dailyOrderTarget = ''
  patch.grossMarginRate = String(Math.round(preset.result.patchedModel.grossMarginRate * 100))
  patch.monthlyFixedCost = String(Math.round(preset.result.patchedModel.monthlyFixedCost))
  patch.paybackMonths = String(preset.result.patchedModel.paybackMonths)
  mode.value = 'simulate'
}

function scenarioRows(preset: ScenarioPreset) {
  const before = preset.result.before
  const after = preset.result.after
  const revenueDelta = formatDelta(percentChange(before.dailyRevenueTarget, after.dailyRevenueTarget), false)
  const orderDelta = formatDelta(percentChange(before.dailyOrderTarget, after.dailyOrderTarget), false)
  const profitDelta = formatDelta(percentChange(before.monthlyProfitTarget, after.monthlyProfitTarget), true)
  const paybackDelta = model.value ? model.value.paybackMonths - preset.result.patchedModel.paybackMonths : 0

  return [
    {
      label: '日流水',
      value: formatMoney(after.dailyRevenueTarget),
      delta: revenueDelta.text,
      positive: revenueDelta.positive
    },
    {
      label: '日单量',
      value: formatOrders(after.dailyOrderTarget),
      delta: orderDelta.text,
      positive: orderDelta.positive
    },
    {
      label: '月利润',
      value: formatMoney(after.monthlyProfitTarget),
      delta: profitDelta.text,
      positive: profitDelta.positive
    },
    {
      label: '回本',
      value: `${preset.result.patchedModel.paybackMonths} 月`,
      delta: paybackDelta === 0 ? '持平' : paybackDelta > 0 ? `缩短 ${paybackDelta} 月` : `延长 ${Math.abs(paybackDelta)} 月`,
      positive: paybackDelta >= 0
    }
  ]
}

function adoptScenario() {
  if (!result.value) return
  if (validationErrors.value.length > 0) {
    uni.showToast({ title: validationErrors.value[0].message, icon: 'none' })
    return
  }
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

function goReport() {
  if (!model.value) return
  shopStore.updateDraft(model.value)
  uni.navigateTo({ url: '/pages/report/index' })
}

function retryStorage() {
  shopStore.load()
  resetPatch()
  if (!storageIssue.value) {
    uni.showToast({ title: '读取成功', icon: 'none' })
  }
}

function recoverStorageIssue() {
  uni.showModal({
    title: '清空异常数据？',
    content: '清空后需要重新完成开店测算，记账记录也会同步清空。',
    success(result) {
      if (!result.confirm) return
      shopStore.recoverStorage()
      ledgerStore.clearRecords()
      uni.showToast({ title: '异常数据已清空', icon: 'none' })
      uni.reLaunch({ url: '/pages/welcome/index' })
    }
  })
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

.lab__mode,
.lab__guide {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lab__guide > text:first-child {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 800;
}

.lab__guide > text:nth-child(2) {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.lab__quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  grid-template-columns: 1fr;
  gap: 10px;
}

.lab__scenario {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lab__scenario-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.lab__scenario-head view {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.lab__scenario-head text:first-child {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 800;
}

.lab__scenario-head text:last-child {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.lab__scenario-head button {
  flex: 0 0 auto;
  min-width: 52px;
  min-height: 34px;
  border-radius: var(--radius-sm);
  background: var(--color-success-bg);
  color: var(--color-brand-dark);
  font-size: 12px;
  font-weight: 700;
}

.lab__scenario-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lab__scenario-grid view {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  border-radius: var(--radius-md);
  background: var(--color-bg-page);
  padding: 9px;
}

.lab__scenario-grid text:first-child {
  color: var(--color-text-muted);
  font-size: 11px;
}

.lab__scenario-grid text:nth-child(2) {
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 800;
}

.lab__scenario-grid text:last-child {
  font-size: 11px;
  font-weight: 700;
}

.lab__delta--up {
  color: var(--color-brand-dark);
}

.lab__delta--down {
  color: var(--color-warning);
}

@media (min-width: 360px) {
  .lab__actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
