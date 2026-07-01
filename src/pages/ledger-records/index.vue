<template>
  <AppPage>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model" class="records">
      <view class="records__filters">
        <AppSegmented v-model="typeFilter" :options="typeOptions" />
        <AppSegmented v-model="periodFilter" :options="periodOptions" />
      </view>

      <AppCard>
        <view class="records__summary">
          <view>
            <text>记账记录</text>
            <text>{{ result.total ? `共 ${result.total} 条，已显示 ${result.records.length} 条` : '暂无符合条件的记录' }}</text>
          </view>
          <AppButton variant="secondary" @click="goLedger">记一笔</AppButton>
        </view>
      </AppCard>

      <view v-if="groups.length" class="records__groups">
        <view v-for="group in groups" :key="group.date" class="records__group">
          <text class="records__date">{{ group.date }}</text>
          <view class="records__list">
            <view v-for="record in group.records" :key="record.id" class="records__item">
              <button class="records__main" @click="editRecord(record.id)">
                <view>
                  <text>{{ record.type === 'income' ? '收入' : '支出' }} · {{ record.category }}</text>
                  <text>{{ record.remark || '无备注' }}</text>
                </view>
                <text :class="record.type === 'income' ? 'records__amount--income' : 'records__amount--expense'">
                  {{ record.type === 'income' ? '+' : '-' }}{{ formatMoney(record.amount) }}
                </text>
              </button>
              <button class="records__delete" @click="deleteRecord(record.id)">删除</button>
            </view>
          </view>
        </view>

        <AppButton v-if="result.hasMore" block variant="secondary" @click="page += 1">加载更多</AppButton>
      </view>

      <AppEmpty v-else title="没有符合条件的记录" desc="换个筛选条件，或先记一笔收入/支出。">
        <AppButton @click="goLedger">记一笔</AppButton>
      </AppEmpty>

      <AppToast :message="feedback" />
    </view>

    <AppEmpty v-else title="先完成测算" desc="保存经营模型后，才能管理记账记录。">
      <AppButton @click="goCalculate">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import AppToast from '../../components/base/AppToast.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import type { LedgerRecord } from '../../services/calculator/types'
import { useLedgerStore, type LedgerRecordPeriodFilter, type LedgerRecordTypeFilter } from '../../stores/ledger'
import { useShopStore } from '../../stores/shop'
import { todayString } from '../../utils/date'
import { formatMoney } from '../../utils/format'

const PAGE_SIZE = 20

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const typeFilter = ref<LedgerRecordTypeFilter>('all')
const periodFilter = ref<LedgerRecordPeriodFilter>('month')
const page = ref(1)
const feedback = ref('')

const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' }
]
const periodOptions = [
  { label: '本月', value: 'month' },
  { label: '本周', value: 'week' },
  { label: '全部', value: 'all' }
]

const model = computed(() => shopStore.currentModel)
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)
const result = computed(() =>
  ledgerStore.getRecordsPage(
    {
      shopId: model.value?.id,
      type: typeFilter.value,
      period: periodFilter.value,
      date: todayString()
    },
    page.value,
    PAGE_SIZE
  )
)
const groups = computed(() => groupByDate(result.value.records))

watch([typeFilter, periodFilter], () => {
  page.value = 1
})

onShow(() => {
  shopStore.load()
  ledgerStore.load()
})

function groupByDate(records: LedgerRecord[]) {
  const grouped = new Map<string, LedgerRecord[]>()
  records.forEach((record) => {
    grouped.set(record.date, [...(grouped.get(record.date) ?? []), record])
  })
  return Array.from(grouped.entries()).map(([date, groupRecords]) => ({
    date,
    records: groupRecords
  }))
}

function editRecord(id: string) {
  ledgerStore.setEditingRecord(id)
  uni.switchTab({ url: '/pages/ledger/index' })
}

function deleteRecord(id: string) {
  const record = ledgerStore.records.find((item) => item.id === id)
  if (!record) return
  uni.showModal({
    title: '删除这条记录？',
    content: '删除后看板、趋势和投入回收进度会同步回滚。',
    success(result) {
      if (!result.confirm) return
      ledgerStore.removeRecord(id)
      feedback.value = '记录已删除，看板数据已同步刷新。'
      if (page.value > 1 && !resultHasEnoughRecords()) {
        page.value -= 1
      }
    }
  })
}

function resultHasEnoughRecords() {
  return result.value.records.length > (page.value - 1) * PAGE_SIZE
}

function goLedger() {
  uni.switchTab({ url: '/pages/ledger/index' })
}

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
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
  uni.showModal({
    title: '清空异常数据？',
    content: shouldClearModel ? '清空后需要重新完成开店测算，记账记录也会同步清空。' : '清空后会删除异常记账记录，之后可重新记账。',
    success(result) {
      if (!result.confirm) return
      if (shouldClearModel) {
        shopStore.recoverStorage()
        ledgerStore.clearRecords()
      } else {
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
.records {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.records__filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.records__summary,
.records__item,
.records__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.records__summary view {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.records__summary text:first-child {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 800;
}

.records__summary text:last-child {
  color: var(--color-text-muted);
  font-size: 12px;
}

.records__summary :deep(.wd-button) {
  min-width: 76px;
}

.records__groups,
.records__group,
.records__list {
  display: flex;
  flex-direction: column;
}

.records__groups {
  gap: 14px;
}

.records__group {
  gap: 8px;
}

.records__date {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.records__list {
  gap: 8px;
}

.records__item {
  min-height: 56px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  padding: 8px 10px;
  box-shadow: var(--shadow-card);
}

.records__main {
  flex: 1;
  min-width: 0;
  color: var(--color-text-primary);
  text-align: left;
}

.records__main view {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.records__main view text:first-child {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.records__main view text:last-child {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.records__main > text {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 800;
}

.records__amount--income {
  color: var(--color-brand-dark);
}

.records__amount--expense {
  color: var(--color-danger);
}

.records__delete {
  flex: 0 0 auto;
  min-width: 44px;
  min-height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 12px;
  font-weight: 700;
}
</style>
