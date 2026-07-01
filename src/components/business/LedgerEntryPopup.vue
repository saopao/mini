<template>
  <wd-popup
    v-model="popupVisible"
    position="bottom"
    :z-index="120"
    :safe-area-inset-bottom="false"
    :close-on-click-modal="false"
    :lock-scroll="true"
    :root-portal="true"
  >
    <view class="ledger-entry" :class="{ 'ledger-entry--keyboard': keyboardVisible && !feedback }">
      <view class="ledger-entry__header">
        <button class="ledger-entry__close" @click="closePopup">×</button>
        <text>{{ editingRecord ? '编辑记录' : '记一笔' }}</text>
        <view class="ledger-entry__header-spacer" />
      </view>

      <view v-if="editingRecord" class="ledger-entry__edit-banner">
        <text>正在编辑历史记录</text>
        <button @click="cancelEdit">取消</button>
      </view>

      <view v-if="!feedback" class="ledger-entry__body">
        <view class="ledger-entry__toolbar">
          <AppSegmented :model-value="form.type" :options="typeOptions" @update:model-value="handleTypeChange" />
          <picker mode="date" :value="form.date" @change="handleDateChange">
            <button class="ledger-entry__date">
              <text>{{ displayDate }} ⌄</text>
            </button>
          </picker>
        </view>

        <view class="ledger-entry__amount" :class="{ 'ledger-entry__amount--error': error }">
          <text class="ledger-entry__currency">¥</text>
          <text class="ledger-entry__number">{{ amountDisplay }}</text>
        </view>
        <text v-if="error" class="ledger-entry__error">{{ error }}</text>

        <view class="ledger-entry__summary">
          <text>今日流水 {{ formatMoney(todaySnapshot?.todayIncome ?? 0) }}</text>
          <text>今日利润 {{ formatMoney(todaySnapshot?.todayEstimatedProfit ?? 0) }}</text>
        </view>

        <view class="ledger-entry__category-grid">
          <button
            v-for="category in categoryOptions"
            :key="category.label"
            class="ledger-entry__category"
            :class="{ 'ledger-entry__category--active': form.category === category.label }"
            @click="selectCategory(category.label)"
          >
            <text class="ledger-entry__category-icon">{{ category.icon }}</text>
            <text class="ledger-entry__category-label">{{ category.label }}</text>
          </button>
        </view>

        <button class="ledger-entry__remark-toggle" @click="showRemark = !showRemark">
          {{ showRemark ? '收起备注' : '添加备注（选填）' }}
        </button>
        <view v-if="showRemark" class="ledger-entry__remark-wrap">
          <textarea class="ledger-entry__remark" :value="form.remark" maxlength="50" placeholder="可输入用途、渠道等" @input="handleRemarkInput" />
          <text class="ledger-entry__counter">{{ form.remark.length }}/50</text>
        </view>
      </view>

      <view v-else class="ledger-entry__feedback">
        <view class="ledger-entry__feedback-copy">
          <text>{{ feedback.title }}</text>
          <text>{{ feedback.desc }}</text>
          <text>{{ feedback.meta }}</text>
        </view>
        <view class="ledger-entry__feedback-actions">
          <AppButton block variant="secondary" @click="continueEntry">继续记一笔</AppButton>
          <AppButton block variant="secondary" @click="goDashboard">回看板</AppButton>
        </view>
      </view>
    </view>
  </wd-popup>

  <wd-number-keyboard
    :visible="keyboardVisible && popupVisible && !feedback"
    :model-value="form.amount"
    mode="custom"
    extra-key="."
    close-text="确定"
    :maxlength="11"
    :z-index="140"
    :modal="false"
    :hide-on-click-outside="false"
    :lock-scroll="false"
    :safe-area-inset-bottom="true"
    :root-portal="true"
    @input="handleKeyboardInput"
    @delete="deleteAmount"
    @close="handleKeyboardConfirm"
    @update:visible="handleKeyboardVisibleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AppButton from '../base/AppButton.vue'
import AppSegmented from '../base/AppSegmented.vue'
import {
  expenseCategoryOptions,
  incomeCategoryOptions,
  type LedgerCategoryMeta
} from '../../constants/categories'
import { trackEvent } from '../../services/analytics/events'
import type { LedgerRecord, LedgerType } from '../../services/calculator/types'
import { useLedgerStore } from '../../stores/ledger'
import { useReportStore } from '../../stores/report'
import { useShopStore } from '../../stores/shop'
import { todayString } from '../../utils/date'
import { formatMoney } from '../../utils/format'

const props = withDefaults(
  defineProps<{
    visible: boolean
    editingRecordId?: string | null
  }>(),
  {
    editingRecordId: null
  }
)

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  saved: [record: LedgerRecord]
  'cancel-edit': []
}>()

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const reportStore = useReportStore()

const keyboardVisible = ref(false)
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

const popupVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})
const model = computed(() => shopStore.currentModel)
const editingRecord = computed(() =>
  props.editingRecordId ? ledgerStore.records.find((record) => record.id === props.editingRecordId) ?? null : null
)
const categoryOptions = computed<LedgerCategoryMeta[]>(() => (form.type === 'income' ? incomeCategoryOptions : expenseCategoryOptions))
const todaySnapshot = computed(() => reportStore.buildDashboardFor(form.date))
const amountDisplay = computed(() => form.amount || '0')
const displayDate = computed(() => {
  const [, month, day] = form.date.split('-')
  if (!month || !day) return form.date
  return `${Number(month)}月${Number(day)}日`
})

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      prepareForm()
    } else {
      keyboardVisible.value = false
    }
  }
)

watch(
  () => props.editingRecordId,
  () => {
    if (props.visible) prepareForm()
  }
)

function prepareForm() {
  shopStore.load()
  ledgerStore.load()
  error.value = ''
  feedback.value = null
  const record = editingRecord.value
  if (record) {
    form.date = record.date
    form.type = record.type
    form.amount = String(record.amount)
    form.category = record.category
    form.remark = record.remark ?? ''
    showRemark.value = Boolean(record.remark)
  } else {
    form.date = todayString()
    form.type = 'income'
    resetFieldsOnly()
  }
  keyboardVisible.value = Boolean(model.value)
}

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

function handleKeyboardInput(value: string | number) {
  appendAmount(String(value))
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

function handleKeyboardConfirm() {
  const saved = saveRecord()
  if (!saved) {
    setTimeout(() => {
      if (popupVisible.value && !feedback.value) keyboardVisible.value = true
    }, 0)
  }
}

function handleKeyboardVisibleUpdate(visible: boolean) {
  keyboardVisible.value = visible
}

function saveRecord() {
  if (!model.value) return false
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    error.value = '请输入大于 0 的金额'
    return false
  }

  error.value = ''
  keyboardVisible.value = false
  const wasEmpty = ledgerStore.records.length === 0
  const currentEditingRecord = editingRecord.value
  const savedMeta = `${form.date} · ${form.type === 'income' ? '收入' : '支出'} · ${form.category} · ${formatMoney(amount)}`

  if (currentEditingRecord) {
    const updatedRecord = {
      ...currentEditingRecord,
      date: form.date,
      type: form.type,
      amount,
      category: form.category,
      remark: form.remark
    }
    ledgerStore.updateRecord(updatedRecord)
    ledgerStore.setEditingRecord(null)
    emit('cancel-edit')
    resetForm()
    feedback.value = {
      title: '记录已更新',
      desc: '看板、趋势和投入回收进度已同步刷新。',
      meta: savedMeta
    }
    emit('saved', updatedRecord)
    return true
  }

  const createdRecord = ledgerStore.addRecord({
    shopId: model.value.id,
    date: form.date,
    type: form.type,
    amount,
    category: form.category,
    remark: form.remark
  })
  if (wasEmpty) trackEvent('ledger_first_entry', { shopId: model.value.id })
  trackEvent('ledger_entry_create', { type: form.type })

  const snapshot = reportStore.buildDashboardFor(form.date)
  if (form.type === 'income') {
    const gap = snapshot?.targetGap ?? 0
    feedback.value = {
      title: `已记录收入 ${formatMoney(amount)}`,
      desc: gap > 0 ? `今天还差 ${formatMoney(gap)} 达到回本线。` : '今天已超过回本线。',
      meta: savedMeta
    }
  } else {
    feedback.value = {
      title: `已记录支出 ${formatMoney(amount)}`,
      desc: `今日估算利润为 ${formatMoney(snapshot?.todayEstimatedProfit ?? 0)}。`,
      meta: savedMeta
    }
  }
  resetFieldsOnly()
  emit('saved', createdRecord)
  return true
}

function resetFieldsOnly() {
  form.amount = ''
  form.remark = ''
  form.category = categoryOptions.value[0].label
  showRemark.value = false
}

function resetForm() {
  feedback.value = null
  error.value = ''
  form.date = todayString()
  form.type = 'income'
  resetFieldsOnly()
}

function continueEntry() {
  feedback.value = null
  error.value = ''
  resetFieldsOnly()
  keyboardVisible.value = true
}

function cancelEdit() {
  ledgerStore.setEditingRecord(null)
  emit('cancel-edit')
  resetForm()
  keyboardVisible.value = true
}

function closePopup() {
  keyboardVisible.value = false
  if (props.editingRecordId) {
    ledgerStore.setEditingRecord(null)
    emit('cancel-edit')
  }
  emit('update:visible', false)
}

function goDashboard() {
  closePopup()
  uni.switchTab({ url: '/pages/dashboard/index' })
}
</script>

<style scoped lang="scss">
.ledger-entry {
  max-height: 94vh;
  overflow-y: auto;
  border-radius: 32rpx 32rpx 0 0;
  background: #fff;
  background: var(--color-bg-card);
  padding: 22rpx 32rpx calc(28rpx + env(safe-area-inset-bottom));
}

.ledger-entry--keyboard {
  padding-bottom: calc(440rpx + env(safe-area-inset-bottom));
}

.ledger-entry__header,
.ledger-entry__toolbar,
.ledger-entry__summary,
.ledger-entry__edit-banner,
.ledger-entry__feedback-actions {
  display: flex;
  align-items: center;
}

.ledger-entry__header {
  justify-content: space-between;
  min-height: 48px;
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 800;
}

.ledger-entry__close,
.ledger-entry__header-spacer {
  width: 44px;
  height: 44px;
}

.ledger-entry__close {
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 30px;
  line-height: 44px;
}

.ledger-entry__edit-banner {
  justify-content: space-between;
  gap: 20rpx;
  min-height: 72rpx;
  border: 1px solid rgba(7, 155, 85, 0.18);
  border-radius: 20rpx;
  background: #effaf3;
  background: var(--color-success-bg);
  padding: 0 20rpx;
  color: #06733f;
  color: var(--color-brand-dark);
  font-size: 13px;
  font-weight: 700;
}

.ledger-entry__edit-banner button {
  min-height: 44px;
  color: #06733f;
  color: var(--color-brand-dark);
  font-size: 13px;
  font-weight: 800;
}

.ledger-entry__body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ledger-entry__toolbar {
  justify-content: space-between;
  gap: 20rpx;
}

.ledger-entry__toolbar :deep(.app-segmented) {
  min-width: 336rpx;
}

.ledger-entry__date {
  min-width: 184rpx;
  min-height: 44px;
  border: 1px solid #e5eee9;
  border-color: var(--color-border);
  border-radius: 999px;
  background: #f7faf8;
  background: var(--color-bg-page);
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 800;
}

.ledger-entry__amount {
  display: flex;
  align-items: flex-end;
  gap: 20rpx;
  min-height: 132rpx;
  border-bottom: 1px solid #e5eee9;
  border-color: var(--color-border);
  padding: 8rpx 0 22rpx;
}

.ledger-entry__amount--error {
  border-color: #ef4444;
  border-color: var(--color-danger);
}

.ledger-entry__currency {
  padding-bottom: 12rpx;
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 30px;
  font-weight: 900;
}

.ledger-entry__number {
  max-width: 560rpx;
  overflow: hidden;
  color: #050706;
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  text-overflow: ellipsis;
}

.ledger-entry__error {
  margin-top: -12rpx;
  color: #ef4444;
  color: var(--color-danger);
  font-size: 12px;
}

.ledger-entry__summary {
  flex-wrap: wrap;
  gap: 16rpx;
}

.ledger-entry__summary text {
  border-radius: 999px;
  background: #f7faf8;
  background: var(--color-bg-page);
  padding: 10rpx 18rpx;
  color: #5d6b63;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.ledger-entry__category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14rpx;
}

.ledger-entry__category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  min-height: 116rpx;
  border: 1px solid transparent;
  border-radius: 20rpx;
  color: #9aa7a0;
  color: var(--color-text-muted);
}

.ledger-entry__category--active {
  border-color: #079b55;
  border-color: var(--color-brand-primary);
  background: #effaf3;
  background: var(--color-success-bg);
  color: #06733f;
  color: var(--color-brand-dark);
}

.ledger-entry__category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f7faf8;
  background: var(--color-bg-page);
  font-size: 13px;
  font-weight: 900;
}

.ledger-entry__category--active .ledger-entry__category-icon {
  background: #079b55;
  background: var(--color-brand-primary);
  color: #fff;
}

.ledger-entry__category-label {
  max-width: 100%;
  overflow: hidden;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-entry__remark-toggle {
  min-height: 44px;
  color: #5d6b63;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 800;
  text-align: left;
}

.ledger-entry__remark-wrap {
  border-radius: 20rpx;
  background: #f7faf8;
  background: var(--color-bg-page);
  padding: 22rpx;
}

.ledger-entry__remark {
  min-height: 96rpx;
  width: 100%;
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 1.5;
}

.ledger-entry__counter {
  display: block;
  margin-top: 12rpx;
  color: #9aa7a0;
  color: var(--color-text-muted);
  font-size: 11px;
  text-align: right;
}

.ledger-entry__feedback {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 24rpx 0 12rpx;
}

.ledger-entry__feedback-copy {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  border-radius: 24rpx;
  background: #effaf3;
  background: var(--color-success-bg);
  padding: 28rpx;
}

.ledger-entry__feedback-copy text:first-child {
  color: #06733f;
  color: var(--color-brand-dark);
  font-size: 17px;
  font-weight: 900;
}

.ledger-entry__feedback-copy text:nth-child(2) {
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 1.5;
}

.ledger-entry__feedback-copy text:last-child {
  color: #5d6b63;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.ledger-entry__feedback-actions {
  gap: 16rpx;
}

@media (max-width: 340px) {
  .ledger-entry {
    padding-right: 24rpx;
    padding-left: 24rpx;
  }

  .ledger-entry__number {
    font-size: 42px;
  }

  .ledger-entry__category-grid {
    gap: 10rpx;
  }
}
</style>
