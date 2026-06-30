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
    radial-gradient(circle at 90% 28%, rgba(255, 255, 255, 0.26), transparent 78px),
    linear-gradient(135deg, #0f9f5a, #087a43);
  padding: 20px 18px;
  color: #fff;
}

.report-conclusion::after {
  position: absolute;
  right: -26px;
  bottom: -36px;
  width: 150px;
  height: 100px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
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
  margin-top: 18px;
}

.report-conclusion__money {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 0;
}

.report-conclusion__unit,
.report-conclusion__desc {
  font-size: 13px;
}

.report-conclusion__desc {
  display: block;
  margin-top: 8px;
  opacity: 0.9;
}
</style>
