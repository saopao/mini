<template>
  <view class="trend-chart">
    <view class="trend-chart__plot">
      <view class="trend-chart__target" :style="{ bottom: targetPosition + '%' }" />
      <view
        v-for="(point, index) in normalized"
        :key="point.date"
        class="trend-chart__point"
        :style="{ left: point.left + '%', bottom: point.bottom + '%' }"
      >
        <text v-if="index === normalized.length - 1" class="trend-chart__value">{{ point.label }}</text>
      </view>
    </view>
    <view class="trend-chart__labels">
      <text v-for="point in normalized" :key="point.date">{{ point.shortDate }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMoneyCompact } from '../../utils/format'

const props = defineProps<{
  points: Array<{ date: string; value: number }>
  target: number
}>()

const normalized = computed(() => {
  const values = props.points.map((point) => point.value)
  const max = Math.max(props.target, ...values, 1)
  return props.points.map((point, index) => ({
    ...point,
    left: props.points.length <= 1 ? 50 : (index / (props.points.length - 1)) * 100,
    bottom: Math.max(6, Math.min(92, (point.value / max) * 86)),
    label: formatMoneyCompact(point.value),
    shortDate: point.date.slice(5).replace('-', '/')
  }))
})

const targetPosition = computed(() => {
  const values = props.points.map((point) => point.value)
  const max = Math.max(props.target, ...values, 1)
  return Math.max(6, Math.min(92, (props.target / max) * 86))
})
</script>

<style scoped lang="scss">
.trend-chart {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  padding: 14px;
}

.trend-chart__plot {
  position: relative;
  height: 126px;
  border-bottom: 1px solid var(--color-border);
}

.trend-chart__target {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  border-top: 1px dashed var(--color-warning);
}

.trend-chart__point {
  position: absolute;
  width: 9px;
  height: 9px;
  margin-left: -4px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--color-brand-primary);
  box-shadow: 0 0 0 1px rgba(15, 159, 90, 0.3);
}

.trend-chart__value {
  position: absolute;
  right: -14px;
  bottom: 12px;
  border-radius: 999px;
  background: var(--color-brand-primary);
  padding: 3px 7px;
  color: #fff;
  font-size: 10px;
  white-space: nowrap;
}

.trend-chart__labels {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  color: var(--color-text-muted);
  font-size: 10px;
}
</style>
