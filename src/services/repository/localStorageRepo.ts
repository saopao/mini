import type { AppSettings, LedgerRepository, Repository } from './types'
import type { LedgerRecord, ShopModel } from '../calculator/types'

const memoryStorage = new Map<string, string>()

export const STORAGE_KEYS = {
  shopModel: 'kd_shop_model',
  ledgerRecords: 'kd_ledger_records',
  appSettings: 'kd_app_settings',
  eventLogs: 'kd_event_logs'
} as const

function readRaw(key: string): string | null {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const value = uni.getStorageSync(key)
      return typeof value === 'string' ? value : value ? JSON.stringify(value) : null
    }
  } catch {
    return null
  }
  return memoryStorage.get(key) ?? null
}

function writeRaw(key: string, value: string): void {
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(key, value)
      return
    }
  } catch {
    memoryStorage.set(key, value)
    return
  }
  memoryStorage.set(key, value)
}

function removeRaw(key: string): void {
  try {
    if (typeof uni !== 'undefined' && uni.removeStorageSync) {
      uni.removeStorageSync(key)
      return
    }
  } catch {
    memoryStorage.delete(key)
    return
  }
  memoryStorage.delete(key)
}

function createJsonRepository<T>(key: string): Repository<T> {
  return {
    get() {
      const raw = readRaw(key)
      if (!raw) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    set(value: T) {
      writeRaw(key, JSON.stringify(value))
    },
    remove() {
      removeRaw(key)
    }
  }
}

export const shopRepository = createJsonRepository<ShopModel>(STORAGE_KEYS.shopModel)

export const settingsRepository = createJsonRepository<AppSettings>(STORAGE_KEYS.appSettings)

export const ledgerRepository: LedgerRepository = {
  list() {
    const raw = readRaw(STORAGE_KEYS.ledgerRecords)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as LedgerRecord[]) : []
    } catch {
      return []
    }
  },
  setAll(records: LedgerRecord[]) {
    writeRaw(STORAGE_KEYS.ledgerRecords, JSON.stringify(records))
  },
  add(record: LedgerRecord) {
    this.setAll([record, ...this.list()])
  },
  update(record: LedgerRecord) {
    this.setAll(this.list().map((item) => (item.id === record.id ? record : item)))
  },
  remove(id: string) {
    this.setAll(this.list().filter((item) => item.id !== id))
  },
  clear() {
    removeRaw(STORAGE_KEYS.ledgerRecords)
  }
}

export function clearAllLocalData(): void {
  removeRaw(STORAGE_KEYS.shopModel)
  removeRaw(STORAGE_KEYS.ledgerRecords)
  removeRaw(STORAGE_KEYS.appSettings)
  removeRaw(STORAGE_KEYS.eventLogs)
}
