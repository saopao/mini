<template>
  <AppPage>
    <AppHeader title="开店避坑助手" />
    <view class="welcome">
      <view class="welcome__hero">
        <text class="welcome__title">开店避坑助手</text>
        <text class="welcome__subtitle">开店前先算清，开店后每天看清</text>
        <text class="welcome__desc">测回本、看压力、做推演，帮你少走弯路</text>
      </view>

      <view class="welcome__visual">
        <view class="welcome__shop">🏪</view>
        <view class="welcome__chart">
          <view class="welcome__bar welcome__bar--sm" />
          <view class="welcome__bar welcome__bar--md" />
          <view class="welcome__bar welcome__bar--lg" />
        </view>
        <view class="welcome__coin">¥</view>
      </view>

      <view class="welcome__actions">
        <AppButton block @click="startCalculate">开始测算</AppButton>
        <AppButton block variant="secondary" @click="directEnter">我已开店，直接进入</AppButton>
      </view>

      <view class="welcome__notice">
        <text class="welcome__shield">✓</text>
        <text>数据仅保存在本地，保护你的经营隐私</text>
      </view>

      <AppCard>
        <text class="welcome__disclaimer-title">免责声明</text>
        <text class="welcome__disclaimer">测算结果仅用于经营参考，不构成投资建议，也不承诺收益或回本。</text>
      </AppCard>
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import AppButton from '../../components/base/AppButton.vue'
import AppCard from '../../components/base/AppCard.vue'
import AppHeader from '../../components/base/AppHeader.vue'
import AppPage from '../../components/base/AppPage.vue'
import { trackEvent } from '../../services/analytics/events'
import { useShopStore } from '../../stores/shop'

const shopStore = useShopStore()

onShow(() => {
  shopStore.load()
  trackEvent('welcome_view')
})

function startCalculate() {
  shopStore.updateDraft({ status: 'planning' })
  uni.navigateTo({ url: '/pages/industry/index' })
}

function directEnter() {
  if (shopStore.currentModel) {
    uni.switchTab({ url: '/pages/dashboard/index' })
    return
  }
  shopStore.updateDraft({ status: 'opened' })
  uni.showToast({
    title: '先完成一次测算，今日目标才有意义',
    icon: 'none'
  })
  uni.navigateTo({ url: '/pages/industry/index' })
}
</script>

<style scoped lang="scss">
.welcome {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: calc(100vh - 78px);
}

.welcome__hero {
  padding-top: 18px;
  text-align: center;
}

.welcome__title {
  display: block;
  color: var(--color-brand-dark);
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0;
}

.welcome__subtitle {
  display: block;
  margin-top: 10px;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.welcome__desc {
  display: block;
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.welcome__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 190px;
  border-radius: 28px;
  background:
    radial-gradient(circle at 50% 40%, rgba(15, 159, 90, 0.2), transparent 86px),
    linear-gradient(180deg, rgba(234, 248, 240, 0.82), rgba(255, 255, 255, 0.42));
}

.welcome__shop {
  font-size: 88px;
}

.welcome__chart,
.welcome__coin {
  position: absolute;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.welcome__chart {
  left: 24px;
  bottom: 28px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  width: 74px;
  height: 66px;
  padding: 12px;
}

.welcome__bar {
  width: 12px;
  border-radius: 999px;
  background: var(--color-brand-primary);
}

.welcome__bar--sm {
  height: 18px;
}

.welcome__bar--md {
  height: 30px;
}

.welcome__bar--lg {
  height: 42px;
}

.welcome__coin {
  right: 26px;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  color: var(--color-brand-dark);
  font-size: 28px;
  font-weight: 800;
}

.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome__notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.welcome__shield {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
  font-size: 12px;
  font-weight: 700;
}

.welcome__disclaimer-title {
  display: block;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.welcome__disclaimer {
  display: block;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
