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
  min-height: 40px;
  border-radius: 999px;
  background: #f0f2f1;
  padding: 3px;
}

.app-segmented__item {
  flex: 1;
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.app-segmented__item--active {
  background: var(--color-brand-primary);
  color: #fff;
}
</style>
