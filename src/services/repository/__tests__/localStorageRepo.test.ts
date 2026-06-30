import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LedgerRecord, ShopModel } from '../../calculator/types'
import {
  clearAllLocalData,
  clearStorageErrors,
  getStorageError,
  ledgerRepository,
  recoverStorageKey,
  shopRepository,
  STORAGE_KEYS
} from '../localStorageRepo'

type TestUniStorage = {
  getStorageSync?: (key: string) => unknown
  setStorageSync?: (key: string, value: unknown) => void
  removeStorageSync?: (key: string) => void
}

const originalUni = (globalThis as { uni?: TestUniStorage }).uni

const model: ShopModel = {
  id: 'shop_storage_test',
  industryId: 'tea_drink',
  industryName: '奶茶/饮品',
  status: 'planning',
  initialInvestment: 120000,
  monthlyFixedCost: 18000,
  businessDaysPerMonth: 26,
  grossMarginRate: 0.65,
  paybackMonths: 12,
  avgOrderValue: 25,
  maxDailyOrders: 120,
  createdAt: '2026-06-29T00:00:00.000Z',
  updatedAt: '2026-06-29T00:00:00.000Z'
}

describe('local storage repository recovery state', () => {
  afterEach(() => {
    if (originalUni === undefined) {
      delete (globalThis as { uni?: TestUniStorage }).uni
    } else {
      ;(globalThis as { uni?: TestUniStorage }).uni = originalUni
    }
    clearAllLocalData()
    clearStorageErrors()
    vi.restoreAllMocks()
  })

  it('records platform read failures instead of treating them as empty data', () => {
    ;(globalThis as { uni?: TestUniStorage }).uni = {
      getStorageSync: vi.fn(() => {
        throw new Error('read failed')
      }),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn()
    }

    expect(shopRepository.get()).toBeNull()
    expect(getStorageError(STORAGE_KEYS.shopModel)).toMatchObject({
      key: STORAGE_KEYS.shopModel,
      kind: 'read',
      message: 'read failed'
    })
  })

  it('records parse failures and clears the error after recovery', () => {
    const removeStorageSync = vi.fn()
    ;(globalThis as { uni?: TestUniStorage }).uni = {
      getStorageSync: vi.fn(() => '{bad json'),
      setStorageSync: vi.fn(),
      removeStorageSync
    }

    expect(shopRepository.get()).toBeNull()
    expect(getStorageError(STORAGE_KEYS.shopModel)).toMatchObject({
      key: STORAGE_KEYS.shopModel,
      kind: 'parse'
    })

    recoverStorageKey(STORAGE_KEYS.shopModel)

    expect(removeStorageSync).toHaveBeenCalledWith(STORAGE_KEYS.shopModel)
    expect(getStorageError(STORAGE_KEYS.shopModel)).toBeNull()
  })

  it('records invalid ledger payloads and clears the error after valid writes', () => {
    let storedValue = JSON.stringify({ records: [] })
    ;(globalThis as { uni?: TestUniStorage }).uni = {
      getStorageSync: vi.fn(() => storedValue),
      setStorageSync: vi.fn((_key, value) => {
        storedValue = String(value)
      }),
      removeStorageSync: vi.fn()
    }

    expect(ledgerRepository.list()).toEqual([])
    expect(getStorageError(STORAGE_KEYS.ledgerRecords)).toMatchObject({
      key: STORAGE_KEYS.ledgerRecords,
      kind: 'parse'
    })

    ledgerRepository.setAll([createRecord()])

    expect(getStorageError(STORAGE_KEYS.ledgerRecords)).toBeNull()
    expect(ledgerRepository.list()).toHaveLength(1)
  })
})

function createRecord(): LedgerRecord {
  return {
    id: 'rec_storage_test',
    shopId: model.id,
    date: '2026-06-29',
    type: 'income',
    amount: 200,
    category: '堂食',
    createdAt: '2026-06-29T08:00:00.000Z',
    updatedAt: '2026-06-29T08:00:00.000Z'
  }
}
