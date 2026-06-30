import type { AppSettings, LedgerRepository, Repository } from './types'
import type { LedgerRecord, ShopModel } from '../calculator/types'

const memoryStorage = new Map<string, string>()

export const STORAGE_KEYS = {
  shopModel: 'kd_shop_model',
  ledgerRecords: 'kd_ledger_records',
  appSettings: 'kd_app_settings',
  eventLogs: 'kd_event_logs'
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
export type StorageErrorKind = 'read' | 'parse'

export interface StorageErrorState {
  key: string
  kind: StorageErrorKind
  message: string
  occurredAt: string
}

const storageErrors = new Map<string, StorageErrorState>()

function formatStorageError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

function recordStorageError(key: string, kind: StorageErrorKind, error: unknown): void {
  storageErrors.set(key, {
    key,
    kind,
    message: formatStorageError(error, kind === 'read' ? '本地数据读取失败' : '本地数据格式异常'),
    occurredAt: new Date().toISOString()
  })
}

export function getStorageError(key: string): StorageErrorState | null {
  return storageErrors.get(key) ?? null
}

export function clearStorageError(key: string): void {
  storageErrors.delete(key)
}

export function clearStorageErrors(): void {
  storageErrors.clear()
}

function readRaw(key: string): string | null {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const value = uni.getStorageSync(key)
      clearStorageError(key)
      return typeof value === 'string' ? value : value ? JSON.stringify(value) : null
    }
  } catch (error) {
    recordStorageError(key, 'read', error)
    return null
  }
  clearStorageError(key)
  return memoryStorage.get(key) ?? null
}

function writeRaw(key: string, value: string): void {
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(key, value)
      clearStorageError(key)
      return
    }
  } catch {
    memoryStorage.set(key, value)
    clearStorageError(key)
    return
  }
  memoryStorage.set(key, value)
  clearStorageError(key)
}

function removeRaw(key: string): void {
  try {
    if (typeof uni !== 'undefined' && uni.removeStorageSync) {
      uni.removeStorageSync(key)
      clearStorageError(key)
      return
    }
  } catch {
    memoryStorage.delete(key)
    clearStorageError(key)
    return
  }
  memoryStorage.delete(key)
  clearStorageError(key)
}

function createJsonRepository<T>(key: string): Repository<T> {
  return {
    get() {
      const raw = readRaw(key)
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw) as T
        clearStorageError(key)
        return parsed
      } catch (error) {
        recordStorageError(key, 'parse', error)
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
      if (!Array.isArray(parsed)) {
        recordStorageError(STORAGE_KEYS.ledgerRecords, 'parse', '记账记录不是数组')
        return []
      }
      clearStorageError(STORAGE_KEYS.ledgerRecords)
      return parsed as LedgerRecord[]
    } catch (error) {
      recordStorageError(STORAGE_KEYS.ledgerRecords, 'parse', error)
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

export function recoverStorageKey(key: StorageKey): void {
  removeRaw(key)
  clearStorageError(key)
}
