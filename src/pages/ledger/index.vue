<template>
  <AppPage>
    <StorageRecoveryState v-if="storageIssue" :desc="storageIssueDesc" @retry="retryStorage" @recover="recoverStorageIssue" />

    <view v-else-if="model" class="ledger-compat">
      <AppCard>
        <view class="ledger-compat__content">
          <view>
            <text>快速记账已改为弹窗</text>
            <text>日常新增和编辑都可以从看板或记录页打开。</text>
          </view>
          <view class="ledger-compat__actions">
            <AppButton block @click="openPopup">记一笔</AppButton>
            <AppButton block variant="secondary" @click="goRecords">查看记录</AppButton>
          </view>
        </view>
      </AppCard>

      <LedgerEntryPopup
        v-model:visible="popupVisible"
        :editing-record-id="editingRecordId"
        @saved="handleLedgerSaved"
        @cancel-edit="clearLedgerEdit"
      />
    </view>

    <AppEmpty v-else title="先完成测算" desc="保存经营模型后，记账才会自动更新今日目标。">
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
import LedgerEntryPopup from '../../components/business/LedgerEntryPopup.vue'
import StorageRecoveryState from '../../components/business/StorageRecoveryState.vue'
import { useLedgerStore } from '../../stores/ledger'
import { useShopStore } from '../../stores/shop'

const shopStore = useShopStore()
const ledgerStore = useLedgerStore()
const popupVisible = ref(false)
const editingRecordId = ref<string | null>(null)

const model = computed(() => shopStore.currentModel)
const storageIssue = computed(() => shopStore.storageError ?? ledgerStore.storageError)
const storageIssueDesc = computed(() =>
  shopStore.storageError
    ? '当前经营模型读取异常。请先重试；仍失败时清空异常模型后重新测算。'
    : '记账记录读取异常。请先重试；仍失败时清空异常记录后重新开始记账。'
)

onShow(() => {
  shopStore.load()
  ledgerStore.load()
  editingRecordId.value = ledgerStore.editingRecordId
  popupVisible.value = Boolean(model.value)
})

function openPopup() {
  editingRecordId.value = null
  popupVisible.value = true
}

function handleLedgerSaved() {
  ledgerStore.load()
  clearLedgerEdit()
}

function clearLedgerEdit() {
  editingRecordId.value = null
  ledgerStore.setEditingRecord(null)
}

function goRecords() {
  uni.switchTab({ url: '/pages/ledger-records/index' })
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
.ledger-compat {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ledger-compat__content {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.ledger-compat__content view:first-child {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.ledger-compat__content text:first-child {
  color: #17211c;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 900;
}

.ledger-compat__content text:last-child {
  color: #5d6b63;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.ledger-compat__actions {
  display: flex;
  gap: 16rpx;
}

@media (max-width: 340px) {
  .ledger-compat__actions {
    flex-direction: column;
  }
}
</style>
