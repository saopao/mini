<template>
  <view class="app-card" :class="`app-card--${variant}`">
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'emphasis' | 'warning' | 'danger'
  }>(),
  {
    variant: 'default'
  }
)
</script>

<style scoped lang="scss">
.app-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  padding: 13px;
  box-shadow: var(--shadow-card);
}

.app-card--emphasis {
  border-color: var(--color-brand-primary);
  background: var(--color-brand-primary);
  color: #fff;
}

.app-card--warning {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
}

.app-card--danger {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
}
</style>
