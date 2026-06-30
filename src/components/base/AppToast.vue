<template>
  <view v-if="message" class="app-toast" :class="`app-toast--${type}`">
    {{ message }}
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    type?: 'success' | 'warning' | 'danger'
  }>(),
  {
    message: '',
    type: 'success'
  }
)
</script>

<style scoped lang="scss">
.app-toast {
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
}

.app-toast--success {
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
}

.app-toast--warning {
  background: var(--color-warning-bg);
  color: #a16207;
}

.app-toast--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
</style>
