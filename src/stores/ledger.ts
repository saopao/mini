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
import { createId, nowIso, todayString } from '../utils/date'

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
    setEditingRecord
  }
})
