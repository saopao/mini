<template>
  <AppPage tab>
    <AppHeader title="快速记账" />
    <view v-if="model" class="ledger">
      <AppSegmented v-model="form.type" :options="typeOptions" />

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

      <AppCard>
        <text class="ledger__label">备注（选填）</text>
        <textarea class="ledger__remark" :value="form.remark" maxlength="50" placeholder="可输入用途、渠道等" @input="handleRemarkInput" />
        <text class="ledger__counter">{{ form.remark.length }}/50</text>
      </AppCard>

      <AppToast :message="feedback" />

      <view class="ledger__actions">
        <AppButton block @click="saveRecord">{{ editing ? '保存修改' : '保存记录' }}</AppButton>
        <AppButton v-if="editing" block variant="danger" @click="deleteRecord">删除记录</AppButton>
        <AppButton v-if="editing" block variant="secondary" @click="resetForm">继续记一笔</AppButton>
      </view>
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
import AppHeader from '../../components/base/AppHeader.vue'
import AppPage from '../../components/base/AppPage.vue'
import AppSegmented from '../../components/base/AppSegmented.vue'
import AppToast from '../../components/base/AppToast.vue'
import MetricCard from '../../components/business/MetricCard.vue'
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
  if (editing.value) {
    ledgerStore.updateRecord({
      ...editing.value,
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
  if (form.type === 'income') {
    const gap = snapshot?.targetGap ?? 0
    feedback.value = gap > 0 ? `已记录收入 ${formatMoney(amount)}，今天还差 ${formatMoney(gap)} 达到回本线。` : `已记录收入 ${formatMoney(amount)}，今天已超过回本线。`
  } else {
    feedback.value = `已记录支出 ${formatMoney(amount)}，今日估算利润为 ${formatMoney(snapshot?.todayEstimatedProfit ?? 0)}。`
  }
  resetFieldsOnly()
}

function deleteRecord() {
  if (!editing.value) return
  uni.showModal({
    title: '删除这条记录？',
    content: '删除后看板、趋势和回本进度会同步回滚。',
    success(result) {
      if (!result.confirm || !editing.value) return
      ledgerStore.removeRecord(editing.value.id)
      ledgerStore.setEditingRecord(null)
      feedback.value = '记录已删除，看板数据已同步刷新。'
      resetFieldsOnly()
    }
  })
}

function resetFieldsOnly() {
  form.amount = ''
  form.remark = ''
  form.category = categories.value[0]
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

.ledger__actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
</style>
