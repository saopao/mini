<template>
  <button class="industry-card" :class="{ 'industry-card--active': active }" @click="$emit('click')">
    <view class="industry-card__check">{{ active ? '✓' : '' }}</view>
    <text class="industry-card__icon">{{ icon }}</text>
    <view class="industry-card__body">
      <text class="industry-card__name">{{ name }}</text>
      <RiskTag :level="riskLevel" :label="riskLabel" />
      <text class="industry-card__range">参考毛利率 {{ marginRange }}</text>
    </view>
  </button>
</template>

<script setup lang="ts">
import RiskTag from './RiskTag.vue'

defineProps<{
  icon: string
  name: string
  marginRange: string
  riskLevel: 'success' | 'warning' | 'danger'
  riskLabel: string
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.industry-card {
  position: relative;
  display: flex;
  min-height: 104px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  padding: 14px 12px;
  gap: 10px;
  text-align: left;
}

.industry-card--active {
  border-color: var(--color-brand-primary);
  background: var(--color-brand-light);
}

.industry-card__check {
  position: absolute;
  top: -1px;
  left: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 12px 0 12px 0;
  background: var(--color-brand-primary);
  color: #fff;
  font-size: 12px;
}

.industry-card__icon {
  flex: 0 0 34px;
  font-size: 30px;
  line-height: 34px;
}

.industry-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.industry-card__name {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.industry-card__range {
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
