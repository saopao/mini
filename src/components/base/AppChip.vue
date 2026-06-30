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
  min-height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  padding: 0 14px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.app-chip--active {
  border-color: rgba(15, 159, 90, 0.32);
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
  font-weight: 600;
}
</style>
