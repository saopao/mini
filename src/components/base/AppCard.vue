<template>
  <wd-card :custom-class="cardClass" custom-content-class="app-card__content">
    <slot />
  </wd-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'emphasis' | 'warning' | 'danger'
  }>(),
  {
    variant: 'default'
  }
)

const cardClass = computed(() => `app-card app-card--${props.variant}`)
</script>

<style scoped lang="scss">
:deep(.app-card) {
  border: 1px solid #e5eee9;
  border-color: var(--color-border);
  border-radius: 12px;
  border-radius: var(--radius-lg);
  background: #fff;
  background: var(--color-bg-card);
  padding: 13px;
  margin: 0;
  box-shadow: 0 8px 22px rgba(21, 48, 36, 0.07);
  box-shadow: var(--shadow-card);
}

:deep(.app-card__content) {
  color: inherit;
  line-height: inherit;
}

:deep(.app-card--emphasis) {
  border-color: #079b55;
  border-color: var(--color-brand-primary);
  background: #079b55;
  background: var(--color-brand-primary);
  color: #fff;
}

:deep(.app-card--warning) {
  border-color: #f59e0b;
  border-color: var(--color-warning);
  background: #fff7e6;
  background: var(--color-warning-bg);
}

:deep(.app-card--danger) {
  border-color: #ef4444;
  border-color: var(--color-danger);
  background: #fef2f2;
  background: var(--color-danger-bg);
}
</style>
