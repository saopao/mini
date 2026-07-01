<template>
  <AppPage tab>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model" class="ledger">
      <AppSegmented v-model="form.type" :options="typeOptions" />

      <AppCard v-if="editing" class="ledger__edit-banner">
        <view>
          <text>正在编辑历史记录</text>
          <text>保存后会更新原记录，不会新增一笔。</text>
        </view>
        <button @click="resetForm">取消</button>
      </AppCard>

      <AppCard>
        <view class="ledger__date-row">
          <text>{{ form.date }}</text>
          <picker mode="date" :value="form.date" @change="handleDateChange">
            <text class="ledger__date-action">选择日期</text>
          </picker>
        </view>
        <view class="ledger__summary">
          <MetricCard label="今日流水" :value="formatMoney(todaySnapshot?.todayIncome ?? 0)" />
          <MetricCard label="今日支出" :value="formatMoney(todaySnapshot?.todayExpense ?? 0)" />
          <MetricCard label="今日利润" :value="formatMoney(todaySnapshot?.todayEstimatedProfit ?? 0)" highlight />
        </view>
      </AppCard>

      <AppCard>
        <AppAmountInput v-model="form.amount" label="金额" :error="error" />
        <view class="ledger__quick">
          <AppChip v-for="amount in quickAmounts" :key="amount" @click="form.amount = String(amount)">{{ amount }}</AppChip>
        </view>
      </AppCard>

      <AppCard>
        <text class="ledger__label">分类</text>
        <view class="ledger__chips">
          <AppChip
            v-for="category in categories"
            :key="category"
            :active="form.category === category"
            @click="form.category = category"
          >
            {{ category }}
          </AppChip>
        </view>
      </AppCard>

      <view class="ledger__primary-action">
        <AppButton block @click="saveRecord">{{ editing ? '保存修改' : '保存记录' }}</AppButton>
      </view>

      <button class="ledger__remark-toggle" @click="showRemark = !showRemark">{{ showRemark ? '收起备注' : '添加备注（选填）' }}</button>

      <AppCard v-if="showRemark">
        <text class="ledger__label">备注（选填）</text>
        <textarea class="ledger__remark" :value="form.remark" maxlength="50" placeholder="可输入用途、渠道等" @input="handleRemarkInput" />
        <text class="ledger__counter">{{ form.remark.length }}/50</text>
      </AppCard>

      <AppCard>
        <view class="ledger__records-entry">
          <view>
            <text class="ledger__label">历史记录</text>
            <text>{{ ledgerStore.records.length ? `共 ${ledgerStore.records.length} 条，可筛选和编辑` : '还没有记录' }}</text>
          </view>
          <AppButton variant="secondary" @click="goRecords">查看</AppButton>
        </view>
      </AppCard>

      <AppToast :message="feedback" />
    </view>

    <AppEmpty v-else title="先完成测算" desc="保存经营模型后，记账才会自动更新今日目标。">
      <AppButton @click="goCalculate">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppAmountInput from '../../components/base/AppAmountInput.vue'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppChip from '../../components/base/AppChip.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import AppToast from '../../components/base/AppToast.vue'
import MetricCard from '../../components/business/MetricCard.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import { expenseCategories, incomeCategories, quickAmounts } from '../../constants/categories'
import { trackEvent } from '../../services/analytics/events'
import type { LedgerType } from '../../services/calculator/types'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { todayString } from '../../utils/date'
import { formatMoney } from '../../utils/format'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const reportStore = useReportStore()
const feedback = ref('')
const error = ref('')
const showRemark = ref(false)

const form = reactive({
  date: todayString(),
  type: 'income' as LedgerType,
  amount: '',
  category: incomeCategories[0],
  remark: ''
})

const typeOptions = [
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' }
]

const model = computed(() => shopStore.currentModel)
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)
const editing = computed(() => ledgerStore.editingRecord)
const categories = computed(() => (form.type === 'income' ? incomeCategories : expenseCategories))
const todaySnapshot = computed(() => reportStore.buildDashboardFor(form.date))

watch(
  () => form.type,
  () => {
    form.category = categories.value[0]
  }
)

onShow(() => {
  shopStore.load()
  ledgerStore.load()
  const record = ledgerStore.editingRecord
  if (record) {
    form.date = record.date
    form.type = record.type
    form.amount = String(record.amount)
    form.category = record.category
    form.remark = record.remark ?? ''
    showRemark.value = Boolean(record.remark)
  }
})

function handleDateChange(event: { detail: { value: string } }) {
  form.date = event.detail.value
}

function handleRemarkInput(event: unknown) {
  const inputEvent = event as { detail?: { value?: string }; target?: { value?: string } }
  form.remark = (inputEvent.detail?.value ?? inputEvent.target?.value ?? '').slice(0, 50)
}

function saveRecord() {
  if (!model.value) return
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    error.value = '请输入大于 0 的金额'
    return
  }
  error.value = ''
  const wasEmpty = ledgerStore.records.length === 0
  const editingRecord = editing.value
  if (editingRecord) {
    ledgerStore.updateRecord({
      ...editingRecord,
      date: form.date,
      type: form.type,
      amount,
      category: form.category,
      remark: form.remark
    })
    ledgerStore.setEditingRecord(null)
  } else {
    ledgerStore.addRecord({
      shopId: model.value.id,
      date: form.date,
      type: form.type,
      amount,
      category: form.category,
      remark: form.remark
    })
    if (wasEmpty) trackEvent('ledger_first_entry', { shopId: model.value.id })
    trackEvent('ledger_entry_create', { type: form.type })
  }
  const snapshot = reportStore.buildDashboardFor(form.date)
  if (editingRecord) {
    feedback.value = '记录已更新，看板数据已同步刷新。'
    resetForm()
  } else if (form.type === 'income') {
    const gap = snapshot?.targetGap ?? 0
    feedback.value = gap > 0 ? `已记录收入 ${formatMoney(amount)}，今天还差 ${formatMoney(gap)} 达到回本线。` : `已记录收入 ${formatMoney(amount)}，今天已超过回本线。`
    resetFieldsOnly()
  } else {
    feedback.value = `已记录支出 ${formatMoney(amount)}，今日估算利润为 ${formatMoney(snapshot?.todayEstimatedProfit ?? 0)}。`
    resetFieldsOnly()
  }
}

function resetFieldsOnly() {
  form.amount = ''
  form.remark = ''
  form.category = categories.value[0]
  showRemark.value = false
}

function resetForm() {
  ledgerStore.setEditingRecord(null)
  form.date = todayString()
  form.type = 'income'
  resetFieldsOnly()
}

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
}

function goRecords() {
  uni.navigateTo({ url: '/pages/ledger-records/index' })
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
.ledger {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ledger__date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.ledger__edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-color: rgba(245, 158, 11, 0.3);
  background: #fff7e6;
  background: var(--color-warning-bg);
}

.ledger__edit-banner view {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ledger__edit-banner text:first-child {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.ledger__edit-banner text:last-child {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.ledger__edit-banner button {
  flex: 0 0 auto;
  color: var(--color-brand-dark);
  font-size: 13px;
  font-weight: 700;
}

.ledger__date-action {
  color: var(--color-brand-dark);
  font-size: 12px;
}

.ledger__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-top: 10px;
}

.ledger__quick,
.ledger__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 10px;
}

.ledger__label {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.ledger__primary-action {
  margin-top: -2px;
}

.ledger__remark-toggle {
  align-self: flex-start;
  min-height: 34px;
  color: var(--color-brand-dark);
  font-size: 13px;
  font-weight: 700;
}

.ledger__remark {
  width: 100%;
  min-height: 74px;
  margin-top: 9px;
  border-radius: var(--radius-md);
  background: #f8faf9;
  padding: 11px;
  color: var(--color-text-primary);
  font-size: 13px;
}

.ledger__counter {
  display: block;
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
  text-align: right;
}

.ledger__records-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ledger__records-entry view {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.ledger__records-entry view text:last-child {
  color: var(--color-text-muted);
  font-size: 12px;
}

.ledger__records-entry :deep(.wd-button) {
  min-width: 76px;
}
</style>
