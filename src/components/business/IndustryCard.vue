<template>
  <button class="industry-card" :class="{ 'industry-card--active': active }" @click="$emit('click')">
    <view class="industry-card__check">{{ active ? '✓' : '' }}</view>
    <view class="industry-card__icon-wrap">
      <text class="industry-card__icon">{{ icon }}</text>
    </view>
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
  min-height: 84px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  padding: 10px;
  gap: 9px;
  text-align: left;
  box-shadow: var(--shadow-card);
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
  width: 20px;
  height: 20px;
  border-radius: 12px 0 12px 0;
  background: var(--color-brand-primary);
  color: #fff;
  font-size: 12px;
}

.industry-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.92), transparent 24px),
    linear-gradient(180deg, #fff8ea, #eef8f1);
  box-shadow: inset 0 -4px 10px rgba(7, 115, 63, 0.08), 0 6px 14px rgba(21, 48, 36, 0.07);
}

.industry-card__icon {
  font-size: 28px;
  line-height: 1;
}

.industry-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.industry-card__name {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.industry-card__range {
  color: var(--color-text-secondary);
  font-size: 11px;
}
</style>
