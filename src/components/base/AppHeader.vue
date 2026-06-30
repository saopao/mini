<template>
  <view class="app-header">
    <button v-if="back" class="app-header__back" @click="goBack">‹</button>
    <view v-else class="app-header__side" />
    <text class="app-header__title">{{ title }}</text>
    <view class="app-header__capsule">
      <text>•••</text>
      <view />
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
  height: 46px;
  padding: 7px 16px 0;
  background: rgba(247, 250, 248, 0.96);
  backdrop-filter: blur(14px);
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
  width: 62px;
}

.app-header__back {
  height: 36px;
  color: var(--color-text-primary);
  font-size: 30px;
  text-align: left;
}

.app-header__capsule {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: 30px;
  border: 1px solid rgba(23, 33, 28, 0.08);
  border-radius: 999px;
  padding: 0 9px;
  background: rgba(255, 255, 255, 0.78);
  color: var(--color-text-primary);
  font-size: 12px;
  box-shadow: 0 4px 10px rgba(21, 48, 36, 0.04);
}

.app-header__capsule view {
  width: 1px;
  height: 14px;
  background: rgba(23, 33, 28, 0.1);
}
</style>
