<template>
  <AppPage tab>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model && dashboard" class="dashboard">
      <AppCard
        class="dashboard__hero"
        :class="{ 'dashboard__hero--done': dashboard.todayIncome >= dashboard.dailyRevenueTarget }"
        :variant="dashboard.todayIncome >= dashboard.dailyRevenueTarget ? 'emphasis' : 'default'"
      >
        <view class="dashboard__status">
          <text class="dashboard__status-title">{{ statusTitle }}</text>
          <text class="dashboard__status-desc">{{ statusDesc }}</text>
        </view>
      </AppCard>

      <MetricGrid :items="metricItems" />

      <ProgressCard
        label="目标完成率"
        :value="formatPercent(dashboard.completionRate)"
        :percent="dashboard.completionRate * 100"
        :desc="dashboard.targetGap > 0 ? `还差 ${formatMoney(dashboard.targetGap)} 达到回本线` : `超过回本线 ${formatMoney(Math.abs(dashboard.targetGap))}`"
      />

      <ProgressCard
        label="回本进度"
        :value="paybackProgressText"
        :percent="dashboard.paybackProgress * 100"
        :desc="dashboard.accumulatedEstimatedProfit < 0 ? '累计估算利润仍为负，请优先看支出。' : `已回收 ${formatMoney(dashboard.accumulatedEstimatedProfit)}`"
      />

      <view class="dashboard__section">
        <view class="dashboard__section-head">
          <text>近 7 天流水趋势</text>
          <text v-if="trendRecordDays < 2">连续记录 2 天后更清晰</text>
        </view>
        <TrendChart v-if="trendRecordDays >= 2" :points="trendPoints" :target="dashboard.dailyRevenueTarget" />
        <AppEmpty v-else title="趋势数据不足" desc="连续记录 2 天后可查看走势。">
          <AppButton @click="goLedger">补一笔记录</AppButton>
        </AppEmpty>
      </view>

      <AppCard>
        <view class="dashboard__section-head">
          <text>最近记录</text>
          <button @click="goLedger">更多 ›</button>
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
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import ProgressCard from '../../components/business/ProgressCard.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import TrendChart from '../../components/business/TrendChart.vue'
import { trackEvent } from '../../services/analytics/events'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatMoney, formatPercent } from '../../utils/format'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const reportStore = useReportStore()

const model = computed(() => shopStore.currentModel)
const dashboard = computed(() => reportStore.dashboard)
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)
const statusTitle = computed(() => {
  if (!dashboard.value) return ''
  if (dashboard.value.todayIncome >= dashboard.value.dailyRevenueTarget) return '已达标，超过回本线'
  if (dashboard.value.todayEstimatedProfit < 0) return '今天还没有赚钱'
  return '还差一点达到回本线'
})
const statusDesc = computed(() => {
  if (!dashboard.value) return ''
  if (dashboard.value.todayIncome >= dashboard.value.dailyRevenueTarget) return `继续保持，今天已超过 ${formatMoney(Math.abs(dashboard.value.targetGap))}`
  if (dashboard.value.todayEstimatedProfit < 0) return '先看支出是否偏高，再追流水。'
  return `今天还差 ${formatMoney(dashboard.value.targetGap)} 达到目标。`
})

const metricItems = computed(() => {
  if (!dashboard.value) return []
  return [
    { label: '今日流水', value: formatMoney(dashboard.value.todayIncome), highlight: true },
    { label: '今日利润', value: formatMoney(dashboard.value.todayEstimatedProfit) },
    { label: '目标流水', value: formatMoney(dashboard.value.dailyRevenueTarget) },
    { label: '完成率', value: formatPercent(dashboard.value.completionRate) },
    { label: '回本进度', value: paybackProgressText.value },
    { label: '今日支出', value: formatMoney(dashboard.value.todayExpense) }
  ]
})

const trendPoints = computed(() => dashboard.value?.trend7d.map((item) => ({ date: item.date, value: item.income })) ?? [])
const trendRecordDays = computed(() => new Set(ledgerStore.records.map((record) => record.date)).size)
const paybackProgressText = computed(() => {
  if (!dashboard.value) return '0%'
  if (dashboard.value.paybackProgress < 0 && Math.abs(dashboard.value.paybackProgress) < 0.01) {
    return formatPercent(dashboard.value.paybackProgress, 1)
  }
  return formatPercent(dashboard.value.paybackProgress)
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
  .dashboard__actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
