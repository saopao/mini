<template>
  <wd-config-provider :theme-vars="wotThemeVars" custom-class="app-wot-provider">
    <view class="app-page" :class="{ 'app-page--tab': tab }">
      <slot />
    </view>
  </wd-config-provider>
</template>

<script setup lang="ts">
defineProps<{
  tab?: boolean
}>()

const wotThemeVars = {
  colorTheme: '#079b55',
  colorSuccess: '#079b55',
  colorWarning: '#f59e0b',
  colorDanger: '#ef4444',
  colorInfo: '#2563eb',
  colorTitle: '#17211c',
  colorContent: '#4b6357',
  colorSecondary: '#6c7a72',
  colorAid: '#9aa7a0',
  colorTip: '#9aa7a0',
  colorBorder: '#e5eee9',
  colorBorderLight: '#eef3f0',
  colorBg: '#f7faf8',
  buttonDisabledOpacity: '1',
  buttonPrimaryBgColor: '#079b55',
  buttonPrimaryColor: '#ffffff',
  buttonErrorBgColor: '#ef4444',
  buttonErrorColor: '#ffffff',
  buttonInfoBgColor: '#ffffff',
  buttonInfoColor: '#06733f',
  buttonInfoPlainBorderColor: '#e5eee9',
  buttonInfoPlainNormalColor: '#06733f',
  buttonPlainBgColor: '#ffffff',
  buttonLargeHeight: '48px',
  buttonLargeRadius: '32rpx',
  buttonLargeFs: '14px',
  buttonLargePadding: '0 36rpx',
  cardBg: '#ffffff',
  cardPadding: '26rpx',
  cardRadius: '24rpx',
  cardMargin: '0',
  cardShadowColor: '0 8px 22px rgba(21, 48, 36, 0.07)',
  cardContentColor: '#17211c',
  inputBg: '#ffffff',
  inputCellBg: '#ffffff',
  inputBorderColor: '#e5eee9',
  inputNotEmptyBorderColor: '#079b55',
  inputColor: '#17211c',
  inputPlaceholderColor: '#9aa7a0',
  inputDisabledColor: '#9aa7a0',
  inputErrorColor: '#ef4444',
  inputFs: '14px',
  inputInnerHeight: '27px',
  inputInnerHeightNoBorder: '27px',
  inputCellHeight: '44px'
}
</script>

<style scoped lang="scss">
:deep(.app-wot-provider) {
  min-height: 100vh;
  background: #f7faf8;
  background: var(--color-bg-page);
}

.app-page {
  min-height: 100vh;
  padding: 28rpx 32rpx 48rpx;
  background: #f7faf8;
  background: var(--color-bg-page);
}

.app-page--tab {
  padding-bottom: calc(144rpx + env(safe-area-inset-bottom));
}
</style>
