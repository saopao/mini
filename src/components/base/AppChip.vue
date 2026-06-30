<template>
  <button class="app-chip" :class="{ 'app-chip--active': active }" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  {
    active: false
  }
)

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.app-chip {
  min-height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  padding: 0 13px;
  color: var(--color-text-secondary);
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(21, 48, 36, 0.04);
}

.app-chip--active {
  border-color: rgba(7, 155, 85, 0.28);
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
  font-weight: 700;
}
</style>
