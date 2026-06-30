<template>
  <view class="app-input" :class="[`app-input--${mode}`, { 'app-input--error': error }]">
    <view class="app-input__label-row">
      <view class="app-input__label-wrap">
        <text v-if="icon" class="app-input__icon">{{ icon }}</text>
        <text class="app-input__label">{{ label }}</text>
      </view>
    </view>
    <view class="app-input__value">
      <input
        class="app-input__control"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :focus="focused"
        @input="handleInput"
        @blur="handleBlur"
      />
      <text v-if="mode === 'row' && unit" class="app-input__unit">{{ unit }}</text>
      <text v-if="mode === 'row'" class="app-input__arrow">›</text>
    </view>
    <text v-if="mode !== 'row' && unit" class="app-input__unit app-input__unit--card">{{ unit }}</text>
    <text v-if="error" class="app-input__error">{{ error }}</text>
  </view>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

withDefaults(
  defineProps<{
    label: string
    modelValue?: string | number
    placeholder?: string
    unit?: string
    error?: string
    inputType?: 'text' | 'number' | 'digit'
    maxlength?: number
    mode?: 'card' | 'row'
    icon?: string
  }>(),
  {
    modelValue: '',
    placeholder: '',
    unit: '',
    error: '',
    inputType: 'text',
    maxlength: 140,
    mode: 'card',
    icon: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const focused = ref(false)

function handleInput(event: unknown) {
  const inputEvent = event as { detail?: { value?: string }; target?: { value?: string } }
  emit('update:modelValue', inputEvent.detail?.value ?? inputEvent.target?.value ?? '')
}

function handleBlur() {
  focused.value = false
  emit('blur')
}

async function focus() {
  focused.value = false
  await nextTick()
  focused.value = true
}

defineExpose({
  focus
})
</script>

<style scoped lang="scss">
.app-input {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  padding: 11px 12px;
}

.app-input--error {
  border-color: var(--color-danger);
}

.app-input--row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  min-height: 46px;
  padding: 0 12px;
}

.app-input__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.app-input--row .app-input__label-row {
  min-width: 0;
  margin-bottom: 0;
}

.app-input__label-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.app-input__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--color-success-bg);
  font-size: 13px;
}

.app-input__label {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.app-input__unit {
  color: var(--color-text-muted);
  font-size: 12px;
}

.app-input__unit--card {
  position: absolute;
  top: 38px;
  right: 12px;
}

.app-input__control {
  width: 100%;
  height: 27px;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 700;
}

.app-input__value {
  min-width: 0;
}

.app-input--row .app-input__value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 132px;
  gap: 4px;
}

.app-input--row .app-input__control {
  width: 86px;
  height: 44px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
  text-align: right;
}

.app-input--row .app-input__unit {
  flex: 0 0 auto;
}

.app-input__arrow {
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1;
}

.app-input__error {
  display: block;
  margin-top: 8px;
  color: var(--color-danger);
  font-size: 12px;
}
</style>
