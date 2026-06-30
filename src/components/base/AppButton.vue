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
  border-radius: 15px;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 600;
}

.app-button--block {
  width: 100%;
}

.app-button--primary {
  background: linear-gradient(180deg, #11a963, #087a43);
  color: #fff;
}

.app-button--secondary {
  border: 1px solid rgba(15, 159, 90, 0.28);
  background: #fff;
  color: var(--color-brand-dark);
}

.app-button--ghost {
  background: transparent;
  color: var(--color-brand-dark);
}

.app-button--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.app-button--disabled {
  background: #e5e7eb;
  color: var(--color-text-muted);
}
</style>
