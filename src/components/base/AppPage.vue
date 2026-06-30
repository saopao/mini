<template>
  <view class="app-page" :class="{ 'app-page--tab': tab }">
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  tab?: boolean
}>()
</script>

<style scoped lang="scss">
.app-page {
  min-height: 100vh;
  padding: 50px 16px 24px;
  background:
    radial-gradient(circle at 50% -20px, rgba(7, 155, 85, 0.08), transparent 238px),
    var(--color-bg-page);
}

.app-page--tab {
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}
</style>
