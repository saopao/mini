<template>
  <view class="app-header">
    <button v-if="back" class="app-header__back" @click="goBack">‹</button>
    <view v-else class="app-header__side" />
    <text class="app-header__title">{{ title }}</text>
    <view class="app-header__capsule">
      <text>•••</text>
      <text>◎</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    back?: boolean
    fallback?: string
  }>(),
  {
    back: false,
    fallback: '/pages/welcome/index'
  }
)

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.redirectTo({ url: props.fallback })
}
</script>

<style scoped lang="scss">
.app-header {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 8px 16px 0;
  background: rgba(246, 248, 247, 0.92);
  backdrop-filter: blur(12px);
}

.app-header__title {
  flex: 1;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.app-header__side,
.app-header__back,
.app-header__capsule {
  width: 64px;
}

.app-header__back {
  height: 36px;
  color: var(--color-text-primary);
  font-size: 30px;
  text-align: left;
}

.app-header__capsule {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  color: var(--color-text-primary);
  font-size: 14px;
}
</style>
