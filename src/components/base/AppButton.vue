<template>
  <button class="app-button" :class="classes" :disabled="disabled" @click="$emit('click')">
    <slot />
  </button>
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

defineEmits<{
  click: []
}>()

const classes = computed(() => ({
  [`app-button--${props.variant}`]: true,
  'app-button--block': props.block,
  'app-button--disabled': props.disabled
}))
</script>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: var(--radius-xl);
  padding: 0 18px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: none;
}

.app-button--block {
  width: 100%;
}

.app-button--primary {
  background: var(--color-brand-primary);
  color: #fff;
  box-shadow: var(--shadow-card);
}

.app-button--secondary {
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-brand-dark);
}

.app-button--ghost {
  background: transparent;
  color: var(--color-brand-dark);
}

.app-button--danger {
  border-radius: var(--radius-md);
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.app-button--disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
}
</style>
