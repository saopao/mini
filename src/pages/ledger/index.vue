<template>
  <AppPage tab>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model" class="ledger">
      <AppCard v-if="editing" class="ledger__edit-banner">
        <view>
          <text>正在编辑历史记录</text>
          <text>保存后会更新原记录，不会新增一笔。</text>
        </view>
        <button @click="resetForm">取消</button>
      </AppCard>

      <AppCard class="ledger__entry-card">
        <view class="ledger__entry-toolbar">
          <AppSegmented :model-value="form.type" :options="typeOptions" @update:model-value="handleTypeChange" />
          <picker mode="date" :value="form.date" @change="handleDateChange">
            <button class="ledger__date-pill">
              <text>{{ displayDate }} ⌄</text>
            </button>
          </picker>
        </view>

        <view class="ledger__amount-display" :class="{ 'ledger__amount-display--error': error }">
          <text class="ledger__currency">¥</text>
          <text class="ledger__amount">{{ amountDisplay }}</text>
        </view>
        <text v-if="error" class="ledger__amount-error">{{ error }}</text>

        <view class="ledger__impact-preview">
          <text>今日流水 {{ formatMoney(todaySnapshot?.todayIncome ?? 0) }}</text>
          <text>今日利润 {{ formatMoney(todaySnapshot?.todayEstimatedProfit ?? 0) }}</text>
        </view>

        <view class="ledger__category-grid">
          <button
            v-for="category in categoryOptions"
            :key="category.label"
            class="ledger__category"
            :class="{ 'ledger__category--active': form.category === category.label }"
            @click="selectCategory(category.label)"
          >
            <text class="ledger__category-icon">{{ category.icon }}</text>
            <text class="ledger__category-label">{{ category.label }}</text>
          </button>
        </view>

        <button class="ledger__remark-toggle" @click="showRemark = !showRemark">{{ showRemark ? '收起备注' : '添加备注（选填）' }}</button>
        <view v-if="showRemark" class="ledger__remark-wrap">
          <textarea class="ledger__remark" :value="form.remark" maxlength="50" placeholder="可输入用途、渠道等" @input="handleRemarkInput" />
          <text class="ledger__counter">{{ form.remark.length }}/50</text>
        </view>
      </AppCard>

      <view v-if="!feedback" class="ledger__keypad">
        <button class="ledger__key" @click="appendAmount('1')">1</button>
        <button class="ledger__key" @click="appendAmount('2')">2</button>
        <button class="ledger__key" @click="appendAmount('3')">3</button>
        <button class="ledger__key ledger__key--delete" @click="deleteAmount">⌫</button>
        <button class="ledger__key" @click="appendAmount('4')">4</button>
        <button class="ledger__key" @click="appendAmount('5')">5</button>
        <button class="ledger__key" @click="appendAmount('6')">6</button>
        <button class="ledger__key ledger__key--confirm" :class="{ 'ledger__key--disabled': !canConfirm }" @click="saveRecord">
          {{ editing ? '保存' : '确定' }}
        </button>
        <button class="ledger__key" @click="appendAmount('7')">7</button>
        <button class="ledger__key" @click="appendAmount('8')">8</button>
        <button class="ledger__key" @click="appendAmount('9')">9</button>
        <button class="ledger__key ledger__key--zero" @click="appendAmount('0')">0</button>
        <button class="ledger__key" @click="appendAmount('.')">.</button>
      </view>

      <AppCard v-if="feedback" class="ledger__feedback" variant="emphasis">
        <view class="ledger__feedback-copy">
          <text>{{ feedback.title }}</text>
          <text>{{ feedback.desc }}</text>
          <text>{{ feedback.meta }}</text>
        </view>
        <view class="ledger__feedback-actions">
          <AppButton block variant="secondary" @click="continueEntry">继续记一笔</AppButton>
          <AppButton block variant="secondary" @click="goDashboard">回看板</AppButton>
        </view>
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
    </view>

    <AppEmpty v-else title="先完成测算" desc="保存经营模型后，记账才会自动更新今日目标。">
      <AppButton @click="goCalculate">去测算</AppButton>
    </AppEmpty>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppEmpty from '../../components/base/AppEmpty.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import {
  expenseCategoryOptions,
  incomeCategoryOptions,
  type LedgerCategoryMeta
} from '../../constants/categories'
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
const feedback = ref<{
  title: string
  desc: string
  meta: string
} | null>(null)
const error = ref('')
const showRemark = ref(false)

const form = reactive({
  date: todayString(),
  type: 'income' as LedgerType,
  amount: '',
  category: incomeCategoryOptions[0].label,
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
const categoryOptions = computed<LedgerCategoryMeta[]>(() => (form.type === 'income' ? incomeCategoryOptions : expenseCategoryOptions))
const todaySnapshot = computed(() => reportStore.buildDashboardFor(form.date))
const amountDisplay = computed(() => form.amount || '0')
const canConfirm = computed(() => {
  const amount = Number(form.amount)
  return Number.isFinite(amount) && amount > 0
})
const displayDate = computed(() => {
  const [, month, day] = form.date.split('-')
  if (!month || !day) return form.date
  return `${Number(month)}月${Number(day)}日`
})

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
    feedback.value = null
  }
})

function handleDateChange(event: { detail: { value: string } }) {
  form.date = event.detail.value
  feedback.value = null
}

function handleTypeChange(value: string) {
  form.type = value as LedgerType
  form.category = categoryOptions.value[0].label
  error.value = ''
  feedback.value = null
}

function selectCategory(category: string) {
  form.category = category
  feedback.value = null
}

function appendAmount(key: string) {
  feedback.value = null
  error.value = ''
  const current = form.amount

  if (key === '.') {
    if (current.includes('.')) return
    form.amount = current ? `${current}.` : '0.'
    return
  }

  const [integerPart, decimalPart] = current.split('.')
  if (decimalPart !== undefined && decimalPart.length >= 2) return
  if (decimalPart === undefined && integerPart.length >= 8 && current !== '0') return

  if (current === '0') {
    form.amount = key
    return
  }

  form.amount = `${current}${key}`
}

function deleteAmount() {
  feedback.value = null
  error.value = ''
  form.amount = form.amount.slice(0, -1)
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
  const typeLabel = form.type === 'income' ? '收入' : '支出'
  const feedbackMeta = `${form.date} · ${typeLabel} · ${form.category} · ${formatMoney(amount)}`
  if (editingRecord) {
    resetForm()
    feedback.value = {
      title: '记录已更新',
      desc: '看板、趋势和投入回收进度已同步刷新。',
      meta: feedbackMeta
    }
  } else if (form.type === 'income') {
    const gap = snapshot?.targetGap ?? 0
    feedback.value = {
      title: `已记录收入 ${formatMoney(amount)}`,
      desc: gap > 0 ? `今天还差 ${formatMoney(gap)} 达到回本线。` : '今天已超过回本线。',
      meta: feedbackMeta
    }
    resetFieldsOnly()
  } else {
    feedback.value = {
      title: `已记录支出 ${formatMoney(amount)}`,
      desc: `今日估算利润为 ${formatMoney(snapshot?.todayEstimatedProfit ?? 0)}。`,
      meta: feedbackMeta
    }
    resetFieldsOnly()
  }
}

function resetFieldsOnly() {
  form.amount = ''
  form.remark = ''
  form.category = categoryOptions.value[0].label
  showRemark.value = false
}

function resetForm() {
  ledgerStore.setEditingRecord(null)
  feedback.value = null
  form.date = todayString()
  form.type = 'income'
  resetFieldsOnly()
}

function continueEntry() {
  feedback.value = null
  resetFieldsOnly()
}

function goCalculate() {
  uni.navigateTo({ url: '/pages/industry/index' })
}

function goRecords() {
  uni.navigateTo({ url: '/pages/ledger-records/index' })
}

function goDashboard() {
  uni.switchTab({ url: '/pages/dashboard/index' })
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
  gap: 10px;
}

.ledger__entry-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ledger__entry-card :deep(.app-card__content),
.ledger__feedback :deep(.app-card__content) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ledger__entry-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ledger__entry-toolbar :deep(.app-segmented) {
  min-width: 168px;
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

.ledger__date-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 0 0 auto;
  min-width: 96px;
  min-height: 36px;
  border-radius: var(--radius-md);
  background: #f8faf9;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.ledger__date-pill :deep(span) {
  display: inline-block;
  line-height: inherit;
  white-space: nowrap;
}

.ledger__amount-display {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-height: 74px;
  border-bottom: 1px solid var(--color-border);
  padding: 6px 0 12px;
}

.ledger__amount-display--error {
  border-bottom-color: var(--color-danger);
}

.ledger__currency {
  color: var(--color-text-primary);
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
}

.ledger__amount {
  overflow: hidden;
  max-width: 100%;
  color: var(--color-text-primary);
  font-size: 48px;
  font-weight: 900;
  line-height: 1.08;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger__amount-error {
  display: block;
  margin-top: -6px;
  color: var(--color-danger);
  font-size: 12px;
}

.ledger__impact-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -2px;
}

.ledger__impact-preview text {
  border-radius: 999px;
  background: var(--color-success-bg);
  padding: 5px 9px;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.ledger__category-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 2px;
}

.ledger__category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
  min-height: 58px;
  border-radius: var(--radius-md);
  background: transparent;
  padding: 4px 2px;
  color: var(--color-text-primary);
  line-height: 1.2;
  text-align: center;
}

.ledger__category--active {
  background: transparent;
  box-shadow: none;
}

.ledger__category-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f3f1;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(21, 48, 36, 0.05);
}

.ledger__category--active .ledger__category-icon {
  background: var(--color-brand-primary);
  color: #fff;
}

.ledger__category-label {
  overflow: hidden;
  width: 100%;
  color: var(--color-text-primary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger__label {
  display: block;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
}

.ledger__label :deep(span),
.ledger__category-icon :deep(span),
.ledger__category-label :deep(span) {
  display: inline-block;
  line-height: inherit;
  white-space: inherit;
}

.ledger__keypad {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, 56px);
  gap: 6px;
  position: sticky;
  z-index: 5;
  bottom: calc(50px + env(safe-area-inset-bottom));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: rgba(247, 250, 248, 0.96);
  padding: 8px 0;
}

.ledger__key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 56px;
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-text-primary);
  font-size: 25px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(21, 48, 36, 0.04);
}

.ledger__key--delete {
  color: var(--color-text-secondary);
  font-size: 22px;
}

.ledger__key--confirm {
  grid-column: 4;
  grid-row: 2 / 5;
  min-height: 100%;
  background: var(--color-brand-primary);
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
  white-space: nowrap;
}

.ledger__key--confirm :deep(span) {
  display: inline-block;
  line-height: inherit;
  white-space: nowrap;
}

.ledger__key--disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
}

.ledger__key--zero {
  grid-column: 1 / 3;
}

.ledger__remark-toggle {
  align-self: flex-start;
  min-height: 34px;
  margin-top: 8px;
  color: var(--color-brand-dark);
  font-size: 13px;
  font-weight: 700;
}

.ledger__remark-wrap {
  margin-top: 4px;
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

.ledger__feedback {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  z-index: 5;
  bottom: calc(58px + env(safe-area-inset-bottom));
}

.ledger__feedback-copy {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ledger__feedback-copy text:first-child {
  font-size: 16px;
  font-weight: 800;
}

.ledger__feedback-copy text:nth-child(2) {
  font-size: 13px;
  line-height: 1.5;
}

.ledger__feedback-copy text:last-child {
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
}

.ledger__feedback-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
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

@media (min-width: 360px) {
  .ledger__feedback-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 340px) {
  .ledger__category-grid {
    gap: 6px;
  }

  .ledger__category {
    min-height: 54px;
  }

  .ledger__amount {
    font-size: 42px;
  }

  .ledger__keypad {
    grid-template-rows: repeat(4, 52px);
  }

  .ledger__key {
    min-height: 52px;
  }
}
</style>
