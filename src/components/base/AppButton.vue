<template>
  <wd-button
    :type="wotType"
    :plain="wotPlain"
    :round="false"
    size="large"
    :block="block"
    :disabled="disabled"
    :custom-class="wotClass"
    @click="handleClick"
  >
    <slot />
  </wd-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    block?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    block: false,
    disabled: false
  }
)

const emit = defineEmits<{
  click: []
}>()

const wotType = computed(() => (props.variant === 'danger' ? 'error' : 'primary'))
const wotPlain = computed(() => props.variant === 'secondary' || props.variant === 'ghost')

const wotClass = computed(() =>
  [
    'app-button',
    `app-button--${props.variant}`,
    props.block ? 'app-button--block' : '',
    props.disabled ? 'app-button--disabled' : ''
  ]
    .filter(Boolean)
    .join(' ')
)

function handleClick() {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
:deep(.app-button) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  min-height: 48px !important;
  height: 48px !important;
  border-radius: 16px;
  border-radius: var(--radius-xl);
  padding: 0 18px;
  color: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  box-shadow: none;
}

:deep(.app-button--block) {
  width: 100% !important;
  display: flex !important;
}

:deep(.app-button--primary) {
  background: #079b55 !important;
  background: var(--color-brand-primary) !important;
  color: #fff;
  box-shadow: 0 8px 22px rgba(21, 48, 36, 0.07);
  box-shadow: var(--shadow-card);
}

:deep(.app-button--secondary) {
  border: 1px solid #e5eee9;
  border-color: var(--color-border);
  background: #fff !important;
  background: var(--color-bg-card) !important;
  color: #06733f !important;
  color: var(--color-brand-dark) !important;
}

:deep(.app-button--ghost) {
  border: 0;
  background: transparent !important;
  color: #06733f !important;
  color: var(--color-brand-dark) !important;
}

:deep(.app-button--danger) {
  border-radius: 10px;
  border-radius: var(--radius-md);
  background: #fef2f2 !important;
  background: var(--color-danger-bg) !important;
  color: #ef4444 !important;
  color: var(--color-danger) !important;
}

:deep(.app-button--disabled) {
  opacity: 1 !important;
  background: #e5eee9 !important;
  background: var(--color-border) !important;
  color: #9aa7a0 !important;
  color: var(--color-text-muted) !important;
}

:deep(.app-button .wd-button__text) {
  white-space: normal;
}
</style>
