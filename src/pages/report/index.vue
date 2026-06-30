<template>
  <AppPage>
    <AppHeader title="经营报告" back fallback="/pages/calculate/index" />
    <view v-if="model && report" class="report">
      <ReportConclusion
        label="日流水目标（达回本线）"
        status="测算结果"
        :money="formatMoney(report.dailyRevenueTarget)"
        :desc="`预计每日订单约 ${formatOrders(report.dailyOrderTarget)}，目标回本周期 ${model.paybackMonths} 个月`"
      />

      <MetricGrid :items="metricItems" />

      <AppCard variant="danger">
        <view class="report__section-head">
          <text>风险评估</text>
          <RiskTag :level="topRisk.level" :label="topRiskLabel" />
        </view>
        <view class="report__risk-list">
          <view v-for="risk in report.riskItems" :key="risk.code" class="report__risk">
            <text class="report__dot" :class="`report__dot--${risk.level}`" />
            <text>{{ risk.message }}</text>
          </view>
        </view>
      </AppCard>

      <AppCard>
        <view class="report__section-head">
          <text>经营优化建议</text>
        </view>
        <view class="report__advice-list">
          <view v-for="(item, index) in report.priorityAdvice" :key="item" class="report__advice">
            <text>{{ index + 1 }}</text>
            <text>{{ item }}</text>
          </view>
        </view>
      </AppCard>

      <AppCard>
        <view class="report__section-head" @click="formulaOpen = !formulaOpen">
          <text>公式拆解</text>
          <text class="report__toggle">{{ formulaOpen ? '收起' : '展开' }}</text>
        </view>
        <view v-if="formulaOpen" class="report__formula">
          <text>每月目标利润 = 前期投入 / 回本周期</text>
          <text>月毛利目标 = 每月固定支出 + 每月目标利润</text>
          <text>月流水目标 = 月毛利目标 / 毛利率</text>
          <text>日流水目标 = 月流水目标 / 每月营业天数</text>
          <text>日单量目标 = 日流水目标 / 客单价</text>
          <text>该结果仅用于经营测算参考，不构成投资建议。</text>
        </view>
      </AppCard>

      <view class="report__actions">
        <AppButton block @click="saveAndGoDashboard">保存模型并进入看板</AppButton>
        <AppButton block variant="secondary" @click="goLab">去实验室模拟优化</AppButton>
        <AppButton block variant="ghost" @click="goEdit">修改参数</AppButton>
      </view>
    </view>

    <AppEmpty v-else title="还没有经营报告" desc="先完成一次测算，才能看到日流水目标和风险评估。">
      <AppButton @click="goEdit">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppHeader from '../../components/base/AppHeader.vue'
import AppPage from '../../components/base/AppPage.vue'
import MetricGrid from '../../components/business/MetricGrid.vue'
import ReportConclusion from '../../components/business/ReportConclusion.vue'
import RiskTag from '../../components/business/RiskTag.vue'
import { trackEvent } from '../../services/analytics/events'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatMoney, formatOrders, formatPercent } from '../../utils/format'

const shopStore = useShopStore()
const reportStore = useReportStore()
const formulaOpen = ref(false)

const model = computed(() => reportStore.activeModel)
const report = computed(() => reportStore.report)
const topRisk = computed(
  () =>
    report.value?.riskItems.find((item) => item.level === 'danger') ??
    report.value?.riskItems.find((item) => item.level === 'warning') ??
    report.value?.riskItems[0] ?? {
      code: 'OK',
      title: '风险评估',
      level: 'success' as const,
      message: '当前参数可用于测算。'
    }
)
const topRiskLabel = computed(() => (topRisk.value?.level === 'danger' ? '高风险' : topRisk.value?.level === 'warning' ? '中高风险' : '良好'))

const metricItems = computed(() => {
  if (!report.value || !model.value) return []
  return [
    { label: '月流水目标', value: formatMoney(report.value.monthlyRevenueTarget, { compact: true }) },
    { label: '日流水目标', value: formatMoney(report.value.dailyRevenueTarget), highlight: true },
    { label: '日单量目标', value: formatOrders(report.value.dailyOrderTarget) },
    { label: '客单价', value: formatMoney(model.value.avgOrderValue) },
    { label: '毛利率', value: formatPercent(model.value.grossMarginRate) },
    { label: '回本周期', value: `${model.value.paybackMonths} 月` }
  ]
})

onShow(() => {
  trackEvent('report_view')
})

function saveAndGoDashboard() {
  const saved = shopStore.saveDraftAsModel()
  if (!saved) {
    uni.showToast({ title: '当前参数无法保存，请回到测算页检查', icon: 'none' })
    return
  }
  trackEvent('store_create', { shopId: saved.id })
  uni.showToast({ title: '已保存模型，今日目标已更新', icon: 'none' })
  uni.switchTab({ url: '/pages/dashboard/index' })
}

function goLab() {
  const saved = shopStore.saveDraftAsModel()
  if (!saved) {
    uni.showToast({ title: '请先保存有效模型', icon: 'none' })
    return
  }
  uni.switchTab({ url: '/pages/lab/index' })
}

function goEdit() {
  uni.navigateTo({ url: '/pages/calculate/index' })
}
</script>

<style scoped lang="scss">
.report {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 24px;
}

.report__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.report__toggle {
  color: var(--color-brand-dark);
  font-size: 12px;
}

.report__risk-list,
.report__advice-list,
.report__formula {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.report__risk,
.report__advice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.report__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 7px;
}

.report__dot--success {
  background: var(--color-brand-primary);
}

.report__dot--warning {
  background: var(--color-warning);
}

.report__dot--danger {
  background: var(--color-danger);
}

.report__advice text:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.report__formula text {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.report__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
