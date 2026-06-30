<template>
  <view class="app-segmented">
    <button
      v-for="option in options"
      :key="option.value"
      class="app-segmented__item"
      :class="{ 'app-segmented__item--active': modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: Array<{ label: string; value: string }>
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped lang="scss">
.app-segmented {
  display: flex;
  min-height: 36px;
  border-radius: var(--radius-xl);
  background: var(--color-success-bg);
  padding: 3px;
}

.app-segmented__item {
  flex: 1;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.app-segmented__item--active {
  background: var(--color-brand-primary);
  color: #fff;
  box-shadow: var(--shadow-card);
}
</style>
