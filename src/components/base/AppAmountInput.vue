<template>
  <AppInput
    :label="label"
    :model-value="modelValue"
    :placeholder="placeholder"
    :error="error"
    input-type="digit"
    unit="元"
    @update:model-value="handleValue"
  />
</template>

<script setup lang="ts">
import AppInput from './AppInput.vue'

withDefaults(
  defineProps<{
    label: string
    modelValue?: string | number
    placeholder?: string
    error?: string
  }>(),
  {
    modelValue: '',
    placeholder: '请输入金额',
    error: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleValue(value: string) {
  const normalized = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  emit('update:modelValue', normalized)
}
</script>
