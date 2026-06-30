<template>
  <view class="report-conclusion">
    <view class="report-conclusion__top">
      <text class="report-conclusion__label">{{ label }}</text>
      <text class="report-conclusion__status">{{ status }}</text>
    </view>
    <view class="report-conclusion__main">
      <text class="report-conclusion__money">{{ money }}</text>
      <text class="report-conclusion__unit">每日</text>
    </view>
    <text class="report-conclusion__desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  money: string
  desc: string
  status: string
}>()
</script>

<style scoped lang="scss">
.report-conclusion {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 88% 26%, rgba(255, 255, 255, 0.24), transparent 76px),
    linear-gradient(150deg, #079e57 0%, #058249 60%, #05723f 100%);
  padding: 18px 18px 19px;
  color: #fff;
  box-shadow: 0 12px 24px rgba(6, 115, 63, 0.18);
}

.report-conclusion::after {
  position: absolute;
  right: -14px;
  bottom: -18px;
  width: 190px;
  height: 104px;
  border-radius: 58% 42% 0 0;
  background:
    linear-gradient(142deg, rgba(255, 255, 255, 0.08), transparent 72%),
    rgba(255, 255, 255, 0.08);
  content: "";
}

.report-conclusion::before {
  position: absolute;
  top: 32px;
  right: 58px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  box-shadow:
    34px 14px 0 rgba(255, 255, 255, 0.44),
    -16px 38px 0 rgba(255, 255, 255, 0.32);
  content: "";
}

.report-conclusion__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-conclusion__label {
  font-size: 13px;
  font-weight: 600;
}

.report-conclusion__status {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}

.report-conclusion__main {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 14px;
}

.report-conclusion__money {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0;
}

.report-conclusion__unit,
.report-conclusion__desc {
  font-size: 13px;
}

.report-conclusion__desc {
  display: block;
  margin-top: 7px;
  opacity: 0.9;
}
</style>
