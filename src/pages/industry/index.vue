<template>
  <AppPage>
    <view class="industry">
      <view class="industry__intro">
        <text class="industry__hint">不同行业，风险与盈利能力不同</text>
      </view>

      <view class="industry__grid">
        <IndustryCard
          v-for="industry in industryModels"
          :key="industry.id"
          :icon="industry.icon"
          :name="industry.name"
          :risk-level="industry.defaultRiskLevel"
          :risk-label="industry.riskLabel"
          :margin-range="formatRange(industry.grossMarginRange)"
          :active="selectedIndustryId === industry.id"
          @click="select(industry.id)"
        />
      </view>

      <text class="industry__notice">行业参数为参考值，可在后续手动调整。</text>

      <view class="industry__footer">
        <AppButton block :disabled="!selectedIndustryId" @click="goNext">下一步</AppButton>
      </view>
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '../../components/base/AppButton.vue'
import AppPage from '../../components/base/AppPage.vue'
import IndustryCard from '../../components/business/IndustryCard.vue'
import { industryModels } from '../../constants/industryModels'
import { trackEvent } from '../../services/analytics/events'
import { useShopStore } from '../../stores/shop'
import { formatPercent } from '../../utils/format'

const shopStore = useShopStore()
const selectedIndustryId = computed(() => shopStore.draft.industryId)

function formatRange(range: [number, number]) {
  return `${formatPercent(range[0])}-${formatPercent(range[1])}`
}

function select(industryId: string) {
  shopStore.selectIndustry(industryId)
  trackEvent('industry_select', { industryId })
}

function goNext() {
  if (!selectedIndustryId.value) {
    uni.showToast({ title: '请先选择一个行业', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/calculate/index' })
}
</script>

<style scoped lang="scss">
.industry {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: calc(74px + env(safe-area-inset-bottom));
}

.industry__intro {
  text-align: center;
}

.industry__hint,
.industry__notice {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.industry__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.industry__notice {
  text-align: center;
}

.industry__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(247, 250, 248, 0), rgba(247, 250, 248, 0.96) 26%);
}
</style>
