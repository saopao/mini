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
  border-radius: 999px;
  background: #edf3ef;
  padding: 3px;
}

.app-segmented__item {
  flex: 1;
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.app-segmented__item--active {
  background: linear-gradient(180deg, #0aa55e, #087c43);
  color: #fff;
  box-shadow: 0 5px 12px rgba(7, 132, 72, 0.16);
}
</style>
