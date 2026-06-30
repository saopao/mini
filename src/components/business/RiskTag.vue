<template>
  <text class="risk-tag" :class="`risk-tag--${level}`">{{ label }}</text>
</template>

<script setup lang="ts">
defineProps<{
  level: 'success' | 'warning' | 'danger'
  label: string
}>()
</script>

<style scoped lang="scss">
.risk-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  border-radius: 999px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
}

.risk-tag--success {
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
}

.risk-tag--warning {
  background: var(--color-warning-bg);
  color: #b45309;
}

.risk-tag--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
</style>
