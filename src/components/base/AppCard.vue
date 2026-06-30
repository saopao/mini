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
  padding: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.app-card--emphasis {
  border-color: rgba(15, 159, 90, 0.18);
  background: linear-gradient(135deg, #0f9f5a, #087a43);
  color: #fff;
}

.app-card--warning {
  border-color: rgba(245, 158, 11, 0.22);
  background: var(--color-warning-bg);
}

.app-card--danger {
  border-color: rgba(239, 68, 68, 0.22);
  background: var(--color-danger-bg);
}
</style>
