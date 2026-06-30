<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useLedgerStore } from './stores/ledger'
import { useShopStore } from './stores/shop'
import './styles/global.scss'

onLaunch(() => {
  const shopStore = useShopStore()
  const ledgerStore = useLedgerStore()
  shopStore.load()
  ledgerStore.load()
})
</script>

<style lang="scss">
page {
  min-height: 100%;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}
</style>
