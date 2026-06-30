<template>
  <view class="app-input" :class="{ 'app-input--error': error }">
    <view class="app-input__label-row">
      <text class="app-input__label">{{ label }}</text>
      <text v-if="unit" class="app-input__unit">{{ unit }}</text>
    </view>
    <input
      class="app-input__control"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @input="handleInput"
      @blur="$emit('blur')"
    />
    <text v-if="error" class="app-input__error">{{ error }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    modelValue?: string | number
    placeholder?: string
    unit?: string
    error?: string
    inputType?: 'text' | 'number' | 'digit'
    maxlength?: number
  }>(),
  {
    modelValue: '',
    placeholder: '',
    unit: '',
    error: '',
    inputType: 'text',
    maxlength: 140
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function handleInput(event: unknown) {
  const inputEvent = event as { detail?: { value?: string }; target?: { value?: string } }
  emit('update:modelValue', inputEvent.detail?.value ?? inputEvent.target?.value ?? '')
}
</script>

<style scoped lang="scss">
.app-input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  padding: 12px;
}

.app-input--error {
  border-color: var(--color-danger);
}

.app-input__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.app-input__label {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.app-input__unit {
  color: var(--color-text-muted);
  font-size: 12px;
}

.app-input__control {
  width: 100%;
  height: 28px;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.app-input__error {
  display: block;
  margin-top: 8px;
  color: var(--color-danger);
  font-size: 12px;
}
</style>
