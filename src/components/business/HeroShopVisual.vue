<template>
  <view class="hero-shop">
    <view class="hero-shop__leaf hero-shop__leaf--left" />
    <view class="hero-shop__leaf hero-shop__leaf--right" />
    <view class="hero-shop__chart">
      <view class="hero-shop__bar hero-shop__bar--one" />
      <view class="hero-shop__bar hero-shop__bar--two" />
      <view class="hero-shop__bar hero-shop__bar--three" />
      <view class="hero-shop__line" />
    </view>
    <view class="hero-shop__store">
      <view class="hero-shop__awning">
        <view />
        <view />
        <view />
        <view />
      </view>
      <view class="hero-shop__body">
        <view class="hero-shop__window" />
        <view class="hero-shop__door" />
      </view>
    </view>
    <view class="hero-shop__dial">
      <view class="hero-shop__dial-ring" />
      <view class="hero-shop__dial-needle" />
    </view>
    <view class="hero-shop__calculator">
      <text>1250</text>
      <view class="hero-shop__keys">
        <view v-for="item in 9" :key="item" />
      </view>
    </view>
    <view class="hero-shop__coins">
      <view />
      <view />
      <view />
    </view>
  </view>
</template>

<style scoped lang="scss">
.hero-shop {
  position: relative;
  height: 208px;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 46%, rgba(7, 155, 85, 0.18), transparent 94px),
    linear-gradient(180deg, rgba(238, 250, 243, 0.95), rgba(255, 255, 255, 0.36));
}

.hero-shop__leaf {
  position: absolute;
  bottom: 24px;
  width: 82px;
  height: 116px;
  opacity: 0.34;
}

.hero-shop__leaf::before,
.hero-shop__leaf::after {
  position: absolute;
  width: 28px;
  height: 54px;
  border-radius: 28px 28px 2px 28px;
  background: rgba(7, 155, 85, 0.22);
  content: "";
}

.hero-shop__leaf::after {
  top: 34px;
  left: 28px;
  transform: rotate(26deg);
}

.hero-shop__leaf--left {
  left: 10px;
  transform: rotate(-18deg);
}

.hero-shop__leaf--right {
  right: -10px;
  transform: scaleX(-1) rotate(-14deg);
}

.hero-shop__chart {
  position: absolute;
  left: 26px;
  bottom: 30px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 74px;
  height: 72px;
  border-radius: 17px;
  background: #fff;
  padding: 15px 13px;
  box-shadow: 0 12px 28px rgba(21, 48, 36, 0.1);
}

.hero-shop__bar {
  width: 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #12b86d, #068345);
}

.hero-shop__bar--one {
  height: 22px;
}

.hero-shop__bar--two {
  height: 34px;
}

.hero-shop__bar--three {
  height: 48px;
}

.hero-shop__line {
  position: absolute;
  right: 11px;
  top: 14px;
  width: 24px;
  height: 18px;
  border-top: 3px solid #0aa55e;
  border-right: 3px solid #0aa55e;
  transform: rotate(-12deg);
}

.hero-shop__store {
  position: absolute;
  left: 50%;
  top: 54px;
  width: 126px;
  height: 108px;
  transform: translateX(-50%);
}

.hero-shop__awning {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: 34px;
  overflow: hidden;
  border-radius: 12px 12px 7px 7px;
  background: #fff;
  box-shadow: 0 8px 14px rgba(7, 115, 63, 0.12);
}

.hero-shop__awning view:nth-child(odd) {
  background: linear-gradient(180deg, #7fd799, #12a763);
}

.hero-shop__awning view:nth-child(even) {
  background: #f8fff9;
}

.hero-shop__body {
  position: relative;
  width: 104px;
  height: 72px;
  margin: -3px auto 0;
  border: 1px solid rgba(7, 115, 63, 0.14);
  border-radius: 8px 8px 12px 12px;
  background: linear-gradient(180deg, #f7fff9, #cbeed8);
  box-shadow: 0 14px 24px rgba(7, 115, 63, 0.16);
}

.hero-shop__window,
.hero-shop__door {
  position: absolute;
  bottom: 14px;
  border-radius: 6px;
  background: linear-gradient(180deg, #e8fff0, #5abd82);
}

.hero-shop__window {
  left: 14px;
  width: 28px;
  height: 28px;
}

.hero-shop__door {
  right: 18px;
  width: 34px;
  height: 46px;
}

.hero-shop__dial {
  position: absolute;
  left: 121px;
  bottom: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f8fff8;
  box-shadow: 0 10px 22px rgba(7, 115, 63, 0.18);
}

.hero-shop__dial-ring {
  position: absolute;
  inset: 9px;
  border: 8px solid #12a763;
  border-right-color: #ffd45f;
  border-radius: 50%;
}

.hero-shop__dial-needle {
  position: absolute;
  left: 29px;
  top: 18px;
  width: 4px;
  height: 25px;
  border-radius: 999px;
  background: #06733f;
  transform: rotate(44deg);
  transform-origin: 50% 90%;
}

.hero-shop__calculator {
  position: absolute;
  right: 29px;
  bottom: 24px;
  width: 58px;
  height: 84px;
  border-radius: 13px;
  background: linear-gradient(180deg, #f7fff9, #d9f2df);
  padding: 9px 8px;
  box-shadow: 0 12px 26px rgba(21, 48, 36, 0.12);
}

.hero-shop__calculator text {
  display: block;
  height: 18px;
  border-radius: 5px;
  background: #076d3d;
  color: #b5ff79;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
}

.hero-shop__keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 8px;
}

.hero-shop__keys view {
  height: 9px;
  border-radius: 3px;
  background: #fff;
  box-shadow: inset 0 -1px 1px rgba(7, 115, 63, 0.1);
}

.hero-shop__coins {
  position: absolute;
  right: 6px;
  bottom: 26px;
  width: 28px;
  height: 48px;
}

.hero-shop__coins view {
  position: absolute;
  right: 0;
  width: 26px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffe28a, #f5b72e);
  box-shadow: 0 2px 0 #d99b16;
}

.hero-shop__coins view:nth-child(1) {
  bottom: 0;
}

.hero-shop__coins view:nth-child(2) {
  bottom: 9px;
}

.hero-shop__coins view:nth-child(3) {
  bottom: 18px;
}
</style>
