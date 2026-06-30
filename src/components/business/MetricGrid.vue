<template>
  <view class="metric-grid">
    <MetricCard
      v-for="item in items"
      :key="item.label"
      :label="item.label"
      :value="item.value"
      :unit="item.unit"
      :desc="item.desc"
      :highlight="item.highlight"
    />
  </view>
</template>

<script setup lang="ts">
import MetricCard from './MetricCard.vue'

defineProps<{
  items: Array<{
    label: string
    value: string
    unit?: string
    desc?: string
    highlight?: boolean
  }>
}>()
</script>

<style scoped lang="scss">
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 340px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
