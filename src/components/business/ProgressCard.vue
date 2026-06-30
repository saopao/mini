<template>
  <view class="progress-card">
    <view class="progress-card__header">
      <text class="progress-card__label">{{ label }}</text>
      <text class="progress-card__value">{{ value }}</text>
    </view>
    <view class="progress-card__track">
      <view class="progress-card__bar" :style="{ width: safePercent + '%' }" />
    </view>
    <text v-if="desc" class="progress-card__desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    percent: number
    desc?: string
  }>(),
  {
    desc: ''
  }
)

const safePercent = computed(() => Math.max(0, Math.min(100, props.percent)))
</script>

<style scoped lang="scss">
.progress-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  padding: 15px;
}

.progress-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.progress-card__label {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.progress-card__value {
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 800;
}

.progress-card__track {
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  margin-top: 11px;
  background: #edf1ef;
}

.progress-card__bar {
  height: 100%;
  border-radius: 999px;
  background: var(--color-brand-primary);
}

.progress-card__desc {
  display: block;
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
