<template>
  <AppPage tab>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model && dashboard" class="dashboard">
      <AppSegmented v-model="selectedPeriod" :options="periodOptions" />

      <AppCard
        class="dashboard__hero"
        :class="{ 'dashboard__hero--done': periodSummary.income >= periodSummary.targetRevenue }"
        :variant="periodSummary.income >= periodSummary.targetRevenue ? 'emphasis' : 'default'"
      >
        <view class="dashboard__status">
          <text class="dashboard__status-title">{{ statusTitle }}</text>
          <text class="dashboard__status-desc">{{ statusDesc }}</text>
        </view>
      </AppCard>

      <MetricGrid :items="metricItems" />

      <ProgressCard
        label="目标完成率"
        :value="formatPercent(periodSummary.completionRate)"
        :percent="periodSummary.completionRate * 100"
        :desc="periodSummary.targetGap > 0 ? `${periodSummary.label}还差 ${formatMoney(periodSummary.targetGap)} 达到目标` : `${periodSummary.label}超过目标 ${formatMoney(Math.abs(periodSummary.targetGap))}`"
      />

      <ProgressCard
        label="投入回收进度"
        :value="paybackProgressText"
        :percent="dashboard.paybackStatus.paybackProgress * 100"
        :desc="paybackDesc"
      />

      <AppCard class="dashboard__payback">
        <view class="dashboard__payback-grid">
          <view>
            <text>已估算回收</text>
            <text>{{ formatMoney(dashboard.paybackStatus.accumulatedEstimatedProfit) }}</text>
          </view>
          <view>
            <text>前期投入</text>
            <text>{{ formatMoney(dashboard.paybackStatus.initialInvestment) }}</text>
          </view>
          <view>
            <text>还差</text>
            <text>{{ formatMoney(dashboard.paybackStatus.remainingInvestment) }}</text>
          </view>
        </view>
        <text class="dashboard__payback-note">按每日估算利润累计：收入 × 毛利率 - 日固定成本 - 其他支出。</text>
      </AppCard>

      <view class="dashboard__section">
        <view class="dashboard__section-head">
          <text>{{ trendTitle }}</text>
          <text v-if="trendRecordPeriods < 2">记录 2 个周期后更清晰</text>
        </view>
        <TrendChart v-if="trendRecordPeriods >= 2" :points="trendPoints" :target="periodSummary.targetRevenue" />
        <AppEmpty v-else title="趋势数据不足" desc="记录 2 个周期后可查看走势。">
          <AppButton @click="goLedger">补一笔记录</AppButton>
        </AppEmpty>
      </view>

      <AppCard>
        <view class="dashboard__section-head">
          <text>最近记录</text>
          <button @click="goRecords">更多 ›</button>
        </view>
        <view v-if="dashboard.recentRecords.length" class="dashboard__records">
          <button v-for="record in dashboard.recentRecords" :key="record.id" class="dashboard__record" @click="editRecord(record.id)">
            <text>{{ record.type === 'income' ? '收入' : '支出' }} · {{ record.category }}</text>
            <text>{{ formatMoney(record.amount) }}</text>
          </button>
        </view>
        <AppEmpty v-else title="今天还没有记录" desc="先记一笔收入或支出，看板会自动刷新。">
          <AppButton @click="goLedger">记一笔</AppButton>
        </AppEmpty>
      </AppCard>

      <view class="dashboard__actions">
        <AppButton block @click="goLedger">记一笔</AppButton>
        <AppButton block variant="secondary" @click="goReport">查看报告</AppButton>
        <AppButton block variant="secondary" @click="goLab">去实验室</AppButton>
      </view>
    </view>

    <AppEmpty v-else title="先完成测算" desc="没有经营模型时，今日目标没有参考意义。">
      <AppButton @click="goCalculate">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import ProgressCard from '../../components/business/ProgressCard.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import TrendChart from '../../components/business/TrendChart.vue'
import { trackEvent } from '../../services/analytics/events'
import type { DashboardPeriod } from '../../services/calculator/types'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatMoney, formatPercent } from '../../utils/format'
import { todayString } from '../../utils/date'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const reportStore = useReportStore()
const selectedPeriod = ref<DashboardPeriod>('day')

const periodOptions = [
  { label: '今日', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const model = computed(() => shopStore.currentModel)
const dashboard = computed(() => reportStore.buildDashboardFor(todayString(), selectedPeriod.value))
const periodSummary = computed(() => dashboard.value?.periodSummary ?? {
  period: selectedPeriod.value,
  label: '今日',
  startDate: todayString(),
  endDate: todayString(),
  targetRevenue: 0,
  income: 0,
  expense: 0,
  estimatedProfit: 0,
  completionRate: 0,
  targetGap: 0,
  recordCount: 0,
  activeDays: 0
})
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)
const statusTitle = computed(() => {
  if (!dashboard.value) return ''
  if (periodSummary.value.income >= periodSummary.value.targetRevenue) return `${periodSummary.value.label}已达标`
  if (periodSummary.value.estimatedProfit < 0) return `${periodSummary.value.label}还没有赚钱`
  return `${periodSummary.value.label}还差一点达标`
})
const statusDesc = computed(() => {
  if (!dashboard.value) return ''
  if (periodSummary.value.income >= periodSummary.value.targetRevenue) return `继续保持，${periodSummary.value.label}已超过 ${formatMoney(Math.abs(periodSummary.value.targetGap))}`
  if (periodSummary.value.estimatedProfit < 0) return '先看支出是否偏高，再追流水。'
  return `${periodSummary.value.label}还差 ${formatMoney(periodSummary.value.targetGap)} 达到目标。`
})

const metricItems = computed(() => {
  if (!dashboard.value) return []
  return [
    { label: `${periodSummary.value.label}流水`, value: formatMoney(periodSummary.value.income), highlight: true },
    { label: `${periodSummary.value.label}利润`, value: formatMoney(periodSummary.value.estimatedProfit) },
    { label: '目标流水', value: formatMoney(periodSummary.value.targetRevenue) },
    { label: '完成率', value: formatPercent(periodSummary.value.completionRate) },
    { label: '投入回收', value: paybackProgressText.value },
    { label: `${periodSummary.value.label}支出`, value: formatMoney(periodSummary.value.expense) }
  ]
})

const trendPoints = computed(() => dashboard.value?.periodTrend.map((item) => ({ date: item.date, value: item.income, label: item.label })) ?? [])
const trendRecordPeriods = computed(() => dashboard.value?.periodTrend.filter((item) => item.income > 0).length ?? 0)
const trendTitle = computed(() => {
  if (selectedPeriod.value === 'week') return '近 8 周流水趋势'
  if (selectedPeriod.value === 'month') return '近 6 月流水趋势'
  return '近 7 天流水趋势'
})
const paybackProgressText = computed(() => {
  if (!dashboard.value) return '0%'
  if (dashboard.value.paybackStatus.paybackProgress < 0 && Math.abs(dashboard.value.paybackStatus.paybackProgress) < 0.01) {
    return formatPercent(dashboard.value.paybackStatus.paybackProgress, 1)
  }
  return formatPercent(dashboard.value.paybackStatus.paybackProgress)
})
const paybackDesc = computed(() => {
  if (!dashboard.value) return ''
  if (dashboard.value.paybackStatus.isNegative) return '累计估算利润仍为负，请优先看支出。'
  if (dashboard.value.paybackStatus.isComplete) return '已估算覆盖前期投入，继续观察真实现金流。'
  return `还差 ${formatMoney(dashboard.value.paybackStatus.remainingInvestment)} 覆盖前期投入。`
})

onShow(() => {
  shopStore.load()
  ledgerStore.load()
  trackEvent('dashboard_view')
})

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
}

function goLedger() {
  uni.switchTab({ url: '/pages/ledger/index' })
}

function goRecords() {
  uni.navigateTo({ url: '/pages/ledger-records/index' })
}

function goReport() {
  if (!model.value) return
  shopStore.updateDraft(model.value)
  uni.navigateTo({ url: '/pages/report/index' })
}

function goLab() {
  uni.switchTab({ url: '/pages/lab/index' })
}

function retryStorage() {
  shopStore.load()
  ledgerStore.load()
  if (!storageIssue.value) {
    uni.showToast({ title: '读取成功', icon: 'none' })
  }
}

function recoverStorageIssue() {
  const shouldClearModel = Boolean(shopStore.storageError)
  const shouldClearRecords = Boolean(ledgerStore.storageError)
  uni.showModal({
    title: '清空异常数据？',
    content: shouldClearModel ? '清空后需要重新完成开店测算，记账记录也会同步清空。' : '清空后会删除异常记账记录，看板会按空记录重新开始。',
    success(result) {
      if (!result.confirm) return
      if (shouldClearModel) {
        shopStore.recoverStorage()
        ledgerStore.clearRecords()
      } else if (shouldClearRecords) {
        ledgerStore.recoverStorage()
      }
      uni.showToast({ title: '异常数据已清空', icon: 'none' })
      if (shouldClearModel) {
        uni.reLaunch({ url: '/pages/welcome/index' })
      }
    }
  })
}

function editRecord(id: string) {
  ledgerStore.setEditingRecord(id)
  uni.switchTab({ url: '/pages/ledger/index' })
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__hero {
  border-color: rgba(7, 155, 85, 0.18);
  background:
    radial-gradient(circle at 88% 24%, rgba(7, 155, 85, 0.12), transparent 70px),
    #fff;
}

.dashboard__hero--done {
  background:
    radial-gradient(circle at 88% 24%, rgba(255, 255, 255, 0.18), transparent 70px),
    linear-gradient(135deg, #0aa35c, #05783f);
  color: #fff;
}

.dashboard__status {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dashboard__status-title {
  font-size: 17px;
  font-weight: 800;
}

.dashboard__status-desc {
  font-size: 12px;
  line-height: 1.5;
}

.dashboard__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard__payback {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dashboard__payback-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.dashboard__payback-grid view {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dashboard__payback-grid text:first-child {
  color: var(--color-text-muted);
  font-size: 11px;
}

.dashboard__payback-grid text:last-child {
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 800;
}

.dashboard__payback-note {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.dashboard__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.dashboard__section-head text:last-child,
.dashboard__section-head button {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 400;
}

.dashboard__records {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 10px;
}

.dashboard__record {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  border-radius: var(--radius-md);
  background: #f8faf9;
  padding: 0 12px;
  color: var(--color-text-primary);
  font-size: 13px;
}

.dashboard__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
}

@media (min-width: 360px) {
  .dashboard__payback-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .dashboard__actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
