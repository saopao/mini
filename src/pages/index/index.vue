<template>
  <view class="page">
    <!-- 顶部状态仪表盘 -->
    <view class="dashboard">
      <view class="dashboard-card">
        <view class="sprout-icon">🌱</view>
        <text class="greeting-text">Hi，今天感觉累吗?</text>
        <text class="subtitle-text">听听身体的声音</text>
      </view>
    </view>

    <!-- 核心输入区 -->
    <view class="input-section">
      <view class="input-wrapper">
        <textarea 
          class="main-input" 
          v-model="userInput"
          placeholder="描述一下你的身体感受..."
          :maxlength="200"
          :auto-height="true"
          :adjust-position="false"
          placeholder-class="input-placeholder"
        />
        
        <!-- AI提示语 -->
        <view class="ai-hint" v-if="!userInput">
          <text class="hint-icon">✨</text>
          <text class="hint-text">试试说："最近总是睡不醒"</text>
        </view>
      </view>

      <!-- 开始分析按钮 - 放在输入框下方 -->
      <view class="analyze-button" @click="startAnalysis">
        <text class="analyze-text">开始分析</text>
        <text class="analyze-icon">→</text>
      </view>

      <!-- 智能建议 - 替代传统标签 -->
      <view class="suggestions-section">
        <text class="suggestions-title">💡 或者从这些开始</text>
        <view class="suggestions-list">
          <view 
            v-for="suggestion in suggestions" 
            :key="suggestion.id"
            class="suggestion-item"
            @click="selectSuggestion(suggestion.text)"
          >
            <text class="suggestion-text">{{ suggestion.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载动效 -->
    <view class="loading-overlay" v-if="isAnalyzing">
      <view class="loading-content">
        <view class="pulse-circle"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>

    <!-- 结果弹窗 -->
    <view class="result-mask" v-if="showResult" @click="closeResult">
      <view class="result-sheet" @click.stop>
        <view class="result-header">
          <text class="result-title">你的身体正在处于</text>
          <text class="result-mode">{{ resultData.mode }}</text>
        </view>
        
        <view class="result-body">
          <text class="result-description">{{ resultData.description }}</text>
        </view>

        <view class="result-actions">
          <view class="action-btn secondary" @click="shareResult">
            <text class="btn-icon">📤</text>
            <text class="btn-text">生成海报</text>
          </view>
          <view class="action-btn primary" @click="goToToday">
            <text class="btn-icon">📋</text>
            <text class="btn-text">调养清单</text>
          </view>
        </view>

        <view class="close-btn" @click="closeResult">
          <text class="close-icon">✕</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInput: '',
      isAnalyzing: false,
      showResult: false,
      loadingText: '正在读取脉搏...',
      suggestions: [
        { id: 1, text: '最近总是睡不醒，白天也很困' },
        { id: 2, text: '手脚冰凉，怕冷' },
        { id: 3, text: '容易发脾气，心情烦躁' },
        { id: 4, text: '掉头发比较严重' }
      ],
      loadingTexts: [
        '正在读取脉搏...',
        '中医认为：久视伤血...',
        '分析气血运行状态...',
        '望闻问切，辨证施治...',
        '正在生成调养方案...'
      ],
      loadingIndex: 0,
      loadingTimer: null,
      resultData: {
        mode: '气血不足模式',
        description: '根据你的症状，身体可能处于气血亏虚状态。中医认为"气为血之帅，血为气之母"，气血不足会导致疲劳、手脚冰凉等症状。建议适当休息，补充营养，调理作息。'
      }
    }
  },
  methods: {
    selectSuggestion(text) {
      this.userInput = text
    },
    
    startAnalysis() {
      if (!this.userInput.trim()) {
        uni.showToast({
          title: '请先描述你的身体感受',
          icon: 'none'
        })
        return
      }

      this.isAnalyzing = true
      this.loadingIndex = 0
      this.loadingText = this.loadingTexts[0]
      
      // 轮播加载文案
      this.loadingTimer = setInterval(() => {
        this.loadingIndex = (this.loadingIndex + 1) % this.loadingTexts.length
        this.loadingText = this.loadingTexts[this.loadingIndex]
      }, 2000)

      // 模拟AI分析（实际项目中这里调用API）
      setTimeout(() => {
        this.isAnalyzing = false
        clearInterval(this.loadingTimer)
        this.showResult = true
        
        // 这里可以根据实际输入生成不同的结果
        this.generateResult()
      }, 5000)
    },

    generateResult() {
      // 简单的模拟逻辑，实际应该调用AI接口
      const modes = [
        { mode: '气血不足模式', description: '根据你的症状，身体可能处于气血亏虚状态。中医认为"气为血之帅，血为气之母"，气血不足会导致疲劳、手脚冰凉等症状。建议适当休息，补充营养，调理作息。' },
        { mode: '肝气郁结模式', description: '情绪波动、易怒等症状提示肝气不畅。中医讲"肝主疏泄"，压力过大会导致肝气郁结。建议保持心情舒畅，适当运动，疏肝理气。' },
        { mode: '脾胃虚弱模式', description: '消化不良、腹胀等症状反映脾胃功能减弱。"脾为后天之本"，脾胃虚弱影响营养吸收。建议规律饮食，少食生冷，健脾养胃。' }
      ]
      
      this.resultData = modes[Math.floor(Math.random() * modes.length)]
    },

    closeResult() {
      this.showResult = false
      this.userInput = ''
    },

    shareResult() {
      uni.showToast({
        title: '海报生成功能开发中',
        icon: 'none'
      })
    },

    goToToday() {
      uni.switchTab({
        url: '/pages/today/index'
      })
    }
  },

  onUnload() {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #EBE8E0;
  padding-bottom: 40rpx;
}

/* 顶部仪表盘 */
.dashboard {
  padding: 40rpx 40rpx 32rpx;
  background: #EBE8E0;
}

.dashboard-card {
  background: linear-gradient(135deg, #D4B896 0%, #C9A87C 100%);
  border-radius: 48rpx;
  padding: 60rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  box-shadow: 0 12rpx 40rpx rgba(180, 140, 100, 0.15);
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.sprout-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
  animation: sway 3s ease-in-out infinite;
}

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.greeting-text {
  font-size: 48rpx;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.subtitle-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1rpx;
}

/* 输入区域 */
.input-section {
  padding: 32rpx 40rpx 40rpx;
}

.input-wrapper {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
  position: relative;
  min-height: 200rpx;
}

.main-input {
  width: 100%;
  min-height: 120rpx;
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
}

.input-placeholder {
  color: #BDBDBD;
}

.ai-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  border-radius: 20rpx;
}

.hint-icon {
  font-size: 28rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #6B7280;
}

/* 分析按钮 */
.analyze-button {
  background: linear-gradient(135deg, #C9A87C 0%, #B8956A 100%);
  border-radius: 48rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(184, 149, 106, 0.3);
  margin-bottom: 40rpx;
}

.analyze-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(184, 149, 106, 0.25);
}

.analyze-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.analyze-icon {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
}

/* 智能建议 */
.suggestions-section {
  margin-top: 20rpx;
}

.suggestions-title {
  font-size: 26rpx;
  color: #9CA3AF;
  margin-bottom: 20rpx;
  display: block;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.suggestion-item {
  background: rgba(255, 255, 255, 0.6);
  border: 2rpx solid rgba(201, 168, 124, 0.2);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  transition: all 0.3s;
}

.suggestion-item:active {
  background: rgba(201, 168, 124, 0.1);
  border-color: rgba(201, 168, 124, 0.4);
  transform: scale(0.98);
}

.suggestion-text {
  font-size: 28rpx;
  color: #4B5563;
  line-height: 1.5;
}

/* 加载动效 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.pulse-circle {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

.loading-text {
  font-size: 32rpx;
  color: #FFFFFF;
  text-align: center;
}

/* 结果弹窗 */
.result-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.result-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
  padding: 60rpx 40rpx 80rpx;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.result-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.result-title {
  display: block;
  font-size: 28rpx;
  color: #757575;
  margin-bottom: 16rpx;
}

.result-mode {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-body {
  background: #F5F5F5;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
}

.result-description {
  font-size: 30rpx;
  color: #424242;
  line-height: 1.8;
}

.result-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.action-btn.secondary {
  background: #F5F5F5;
  border: 2rpx solid #E0E0E0;
}

.action-btn.primary {
  background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
  box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 30rpx;
  font-weight: 600;
}

.action-btn.secondary .btn-text {
  color: #424242;
}

.action-btn.primary .btn-text {
  color: #FFFFFF;
}

.close-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 56rpx;
  height: 56rpx;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 32rpx;
  color: #757575;
}
</style>
