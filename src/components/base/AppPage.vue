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
  padding: 54px 16px 24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(15, 159, 90, 0.08), transparent 260px),
    var(--color-bg-page);
}

.app-page--tab {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
</style>
