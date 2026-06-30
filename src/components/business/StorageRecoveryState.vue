<template>
  <AppEmpty icon="!" title="本地数据读取异常" :desc="desc">
    <view class="storage-recovery__actions">
      <AppButton block variant="secondary" @click="emit('retry')">重试读取</AppButton>
      <AppButton block variant="danger" @click="emit('recover')">清空异常数据</AppButton>
    </view>
  </AppEmpty>
</template>

<script setup lang="ts">
import AppButton from '../base/AppButton.vue'
import AppEmpty from '../base/AppEmpty.vue'

withDefaults(
  defineProps<{
    desc?: string
  }>(),
  {
    desc: '可能是本地缓存损坏。请先重试；仍失败时清空异常数据后重新测算。'
  }
)

const emit = defineEmits<{
  retry: []
  recover: []
}>()
</script>

<style scoped lang="scss">
.storage-recovery__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  margin-top: 2px;
}

@media (max-width: 340px) {
  .storage-recovery__actions {
    grid-template-columns: 1fr;
  }
}
</style>
