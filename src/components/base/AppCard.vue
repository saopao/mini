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
  border-color: rgba(7, 155, 85, 0.18);
  background: linear-gradient(135deg, #0aa35c, #05783f);
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
