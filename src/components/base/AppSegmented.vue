<template>
  <wd-segmented :value="modelValue" :options="wotOptions" size="small" custom-class="app-segmented" @update:value="handleUpdate">
    <template #label="{ option }">
      {{ option.payload?.label ?? option.value }}
    </template>
  </wd-segmented>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  options: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const wotOptions = computed(() =>
  props.options.map((option) => ({
    value: option.value,
    payload: {
      label: option.label
    }
  }))
)

function handleUpdate(value: string | number) {
  emit('update:modelValue', String(value))
}
</script>

<style scoped lang="scss">
:deep(.app-segmented) {
  min-height: 36px;
  border-radius: 20px;
  border-radius: var(--radius-xl);
  background: var(--color-success-bg);
  padding: 6rpx;
}

:deep(.app-segmented .wd-segmented__item) {
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  line-height: 30px;
  min-height: 30px;
}

:deep(.app-segmented .wd-segmented__item.is-active) {
  color: #fff;
}

:deep(.app-segmented .wd-segmented__item--active) {
  background: var(--color-brand-primary);
  border-radius: var(--radius-lg);
  color: #fff;
  box-shadow: var(--shadow-card);
}
</style>
