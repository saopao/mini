<template>
  <view class="scenario-compare">
    <view class="scenario-compare__row scenario-compare__head">
      <text>指标</text>
      <text>当前方案</text>
      <text>调整后</text>
      <text>变化</text>
    </view>
    <view v-for="item in items" :key="item.label" class="scenario-compare__row">
      <text>{{ item.label }}</text>
      <text>{{ item.before }}</text>
      <text>{{ item.after }}</text>
      <text :class="item.positive ? 'scenario-compare__up' : 'scenario-compare__down'">{{ item.delta }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string
    before: string
    after: string
    delta: string
    positive: boolean
  }>
}>()
</script>

<style scoped lang="scss">
.scenario-compare {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-card);
}

.scenario-compare__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.8fr;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  border-top: 1px solid var(--color-border);
  padding: 0 10px;
  color: var(--color-text-primary);
  font-size: 11px;
}

.scenario-compare__head {
  border-top: 0;
  background: var(--color-brand-light);
  color: var(--color-text-secondary);
  font-weight: 600;
}

.scenario-compare__up {
  color: var(--color-brand-primary);
  font-weight: 700;
}

.scenario-compare__down {
  color: var(--color-danger);
  font-weight: 700;
}
</style>
