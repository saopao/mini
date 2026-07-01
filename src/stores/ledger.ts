import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LedgerRecord, LedgerType } from '../services/calculator/types'
import {
  getStorageError,
  ledgerRepository,
  recoverStorageKey,
  STORAGE_KEYS,
  type StorageErrorState
} from '../services/repository/localStorageRepo'
import { createId, endOfMonth, endOfWeek, isDateInRange, nowIso, startOfMonth, startOfWeek, todayString } from '../utils/date'

export type LedgerRecordTypeFilter = LedgerType | 'all'
export type LedgerRecordPeriodFilter = 'week' | 'month' | 'all'

export interface LedgerRecordFilterOptions {
  shopId?: string
  type?: LedgerRecordTypeFilter
  period?: LedgerRecordPeriodFilter
  date?: string
}

export const useLedgerStore = defineStore('ledger', () => {
  const records = ref<LedgerRecord[]>([])
  const editingRecordId = ref<string | null>(null)
  const storageError = ref<StorageErrorState | null>(null)

  const hasRecords = computed(() => records.value.length > 0)
  const editingRecord = computed(() => records.value.find((record) => record.id === editingRecordId.value) ?? null)
  const hasStorageError = computed(() => Boolean(storageError.value))

  function syncStorageError() {
    storageError.value = getStorageError(STORAGE_KEYS.ledgerRecords)
  }

  function load() {
    const nextRecords = ledgerRepository.list()
    syncStorageError()
    if (storageError.value) {
      records.value = []
      editingRecordId.value = null
      return
    }
    records.value = nextRecords
  }

  function addRecord(input: {
    shopId: string
    date?: string
    type: LedgerType
    amount: number
    category: string
    remark?: string
  }): LedgerRecord {
    const now = nowIso()
    const record: LedgerRecord = {
      id: createId('rec'),
      shopId: input.shopId,
      date: input.date ?? todayString(),
      type: input.type,
      amount: input.amount,
      category: input.category,
      remark: input.remark,
      createdAt: now,
      updatedAt: now
    }
    records.value = [record, ...records.value]
    ledgerRepository.setAll(records.value)
    syncStorageError()
    return record
  }

  function updateRecord(record: LedgerRecord) {
    records.value = records.value.map((item) =>
      item.id === record.id
        ? {
            ...record,
            updatedAt: nowIso()
          }
        : item
    )
    ledgerRepository.setAll(records.value)
    syncStorageError()
  }

  function removeRecord(id: string) {
    records.value = records.value.filter((record) => record.id !== id)
    ledgerRepository.setAll(records.value)
    syncStorageError()
  }

  function clearRecords() {
    records.value = []
    editingRecordId.value = null
    ledgerRepository.clear()
    syncStorageError()
  }

  function recoverStorage() {
    records.value = []
    editingRecordId.value = null
    recoverStorageKey(STORAGE_KEYS.ledgerRecords)
    syncStorageError()
  }

  function setEditingRecord(id: string | null) {
    editingRecordId.value = id
  }

  function listRecords(options: LedgerRecordFilterOptions = {}): LedgerRecord[] {
    const type = options.type ?? 'all'
    const period = options.period ?? 'all'
    const date = options.date ?? todayString()
    const range = getFilterRange(period, date)

    return records.value
      .filter((record) => !options.shopId || record.shopId === options.shopId)
      .filter((record) => type === 'all' || record.type === type)
      .filter((record) => !range || isDateInRange(record.date, range.startDate, range.endDate))
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return b.createdAt.localeCompare(a.createdAt)
      })
  }

  function getRecordsPage(options: LedgerRecordFilterOptions = {}, page = 1, pageSize = 20) {
    const filtered = listRecords(options)
    const safePage = Math.max(1, page)
    const safePageSize = Math.max(1, pageSize)
    const visible = filtered.slice(0, safePage * safePageSize)
    return {
      records: visible,
      total: filtered.length,
      hasMore: visible.length < filtered.length
    }
  }

  function getFilterRange(period: LedgerRecordPeriodFilter, date: string) {
    if (period === 'week') {
      return {
        startDate: startOfWeek(date),
        endDate: endOfWeek(date)
      }
    }
    if (period === 'month') {
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      }
    }
    return null
  }

  return {
    records,
    storageError,
    hasRecords,
    hasStorageError,
    editingRecordId,
    editingRecord,
    load,
    addRecord,
    updateRecord,
    removeRecord,
    clearRecords,
    recoverStorage,
    setEditingRecord,
    listRecords,
    getRecordsPage
  }
})
