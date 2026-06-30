<template>
  <wd-tag :type="active ? 'success' : 'default'" :plain="!active" round :custom-class="chipClass" @click="handleClick">
    <slot />
  </wd-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  {
    active: false
  }
)

const emit = defineEmits<{
  click: []
}>()

const chipClass = computed(() => `app-chip${props.active ? ' app-chip--active' : ''}`)

function handleClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
:deep(.app-chip) {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  padding: 0 13px;
  color: var(--color-text-secondary);
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(21, 48, 36, 0.04);
}

:deep(.app-chip--active) {
  border-color: rgba(7, 155, 85, 0.28);
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
  font-weight: 700;
}

:deep(.app-chip .wd-tag__text) {
  line-height: 1.2;
}
</style>
