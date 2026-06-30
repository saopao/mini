<template>
  <AppPage tab>
    <view class="profile">
      <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

      <template v-else>
        <AppCard v-if="model" class="profile__model">
          <view class="profile__model-row">
            <text class="profile__model-icon">{{ industryIcon }}</text>
            <view>
              <text class="profile__eyebrow">当前经营模型</text>
              <text class="profile__model-title">{{ model.industryName }}</text>
              <text class="profile__model-desc">毛利率 {{ formatPercent(model.grossMarginRate) }} · 回本周期 {{ model.paybackMonths }} 月</text>
              <text class="profile__model-desc">每日目标流水 {{ formatMoney(report?.dailyRevenueTarget ?? 0) }}</text>
            </view>
          </view>
          <AppButton block @click="goReport">查看经营报告</AppButton>
        </AppCard>

        <AppEmpty v-else title="还没有经营模型" desc="先完成一次测算，才能查看看板和实验室。">
          <AppButton @click="goCalculate">开始测算</AppButton>
        </AppEmpty>

        <AppCard>
          <button class="profile__item" @click="goEdit">
            <text>修改基础参数</text>
            <text>›</text>
          </button>
          <button class="profile__item" @click="goCalculate">
            <text>重新测算</text>
            <text>›</text>
          </button>
        </AppCard>

        <AppCard>
          <button class="profile__item" @click="showDataInfo">
            <text>数据说明</text>
            <text>›</text>
          </button>
          <button class="profile__item" @click="showDisclaimer">
            <text>免责声明</text>
            <text>›</text>
          </button>
          <button class="profile__item" @click="showFeedback">
            <text>意见反馈</text>
            <text>›</text>
          </button>
        </AppCard>

        <AppButton block variant="danger" @click="clearData">清空本地数据</AppButton>
      </template>
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import { getIndustryModel } from '../../constants/industryModels'
import { trackEvent } from '../../services/analytics/events'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { formatMoney, formatPercent } from '../../utils/format'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const reportStore = useReportStore()

const model = computed(() => shopStore.currentModel)
const report = computed(() => (model.value ? reportStore.buildReportFor(model.value) : null))
const industryIcon = computed(() => (model.value ? getIndustryModel(model.value.industryId)?.icon ?? '🏪' : '🏪'))
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)

onShow(() => {
  shopStore.load()
  ledgerStore.load()
  trackEvent('profile_view')
})

function goReport() {
  if (!model.value) {
    goCalculate()
    return
  }
  shopStore.updateDraft(model.value)
  uni.navigateTo({ url: '/pages/report/index' })
}

function goEdit() {
  if (model.value) shopStore.updateDraft(model.value)
  uni.navigateTo({ url: '/pages/calculate/index' })
}

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
}

function showDataInfo() {
  uni.showModal({
    title: '数据说明',
    content: '今日估算利润 = 今日收入 × 毛利率 - 日固定成本摊销 - 今日其他支出。历史记录会按当前模型重算。',
    showCancel: false
  })
}

function showDisclaimer() {
  uni.showModal({
    title: '免责声明',
    content: '测算结果仅用于经营参考，不构成投资建议，不承诺收益或回本。',
    showCancel: false
  })
}

function showFeedback() {
  uni.showModal({
    title: '意见反馈',
    content: '内测阶段请通过项目反馈渠道提交问题和建议。',
    showCancel: false
  })
}

function clearData() {
  uni.showModal({
    title: '清空本地数据？',
    content: '清空后当前模型、记账记录和看板数据都会删除，且无法恢复。',
    success(result) {
      if (!result.confirm) return
      shopStore.clearModel()
      ledgerStore.clearRecords()
      uni.showToast({ title: '已清空本地数据', icon: 'none' })
      uni.reLaunch({ url: '/pages/welcome/index' })
    }
  })
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
    content: shouldClearModel ? '清空后需要重新完成开店测算，记账记录也会同步清空。' : '清空后会删除异常记账记录，之后可重新记账。',
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
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile__model {
  border-color: rgba(15, 159, 90, 0.22);
  background:
    radial-gradient(circle at 12% 20%, rgba(7, 155, 85, 0.08), transparent 70px),
    #fff;
}

.profile__model-row {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 14px;
}

.profile__model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff8ea, #eef8f1);
  font-size: 42px;
  box-shadow: inset 0 -6px 16px rgba(7, 115, 63, 0.08);
}

.profile__eyebrow,
.profile__model-desc {
  display: block;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.profile__model-title {
  display: block;
  margin: 5px 0 7px;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 800;
}

.profile__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 13px;
  text-align: left;
}

.profile__item:last-child {
  border-bottom: 0;
}

.profile__item text:last-child {
  color: var(--color-text-muted);
}
</style>
