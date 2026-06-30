<template>
  <view class="app-empty">
    <text class="app-empty__icon">{{ icon }}</text>
    <text class="app-empty__title">{{ title }}</text>
    <text class="app-empty__desc">{{ desc }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    desc: string
    icon?: string
  }>(),
  {
    icon: '•'
  }
)
</script>

<style scoped lang="scss">
.app-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  border: 1px dashed rgba(15, 159, 90, 0.28);
  border-radius: var(--radius-lg);
  background: rgba(234, 248, 240, 0.55);
  padding: 24px 18px;
  text-align: center;
}

.app-empty__icon {
  color: var(--color-brand-primary);
  font-size: 24px;
}

.app-empty__title {
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.app-empty__desc {
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>
