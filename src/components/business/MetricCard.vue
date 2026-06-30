<template>
  <view class="metric-card" :class="{ 'metric-card--highlight': highlight }">
    <text class="metric-card__label">{{ label }}</text>
    <view class="metric-card__value-row">
      <text class="metric-card__value">{{ value }}</text>
      <text v-if="unit" class="metric-card__unit">{{ unit }}</text>
    </view>
    <text v-if="desc" class="metric-card__desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    unit?: string
    desc?: string
    highlight?: boolean
  }>(),
  {
    unit: '',
    desc: '',
    highlight: false
  }
)
</script>

<style scoped lang="scss">
.metric-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  padding: 13px;
}

.metric-card--highlight {
  border-color: rgba(15, 159, 90, 0.28);
  background: var(--color-brand-light);
}

.metric-card__label {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.metric-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 7px;
}

.metric-card__value {
  color: var(--color-text-primary);
  font-size: 22px;
  font-weight: 800;
}

.metric-card__unit {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.metric-card__desc {
  display: block;
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
}
</style>
