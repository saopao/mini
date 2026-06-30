import type { LedgerRecord, ShopModel } from '../calculator/types'

export interface Repository<T> {
  get(): T | null
  set(value: T): void
  remove(): void
}

export interface LedgerRepository {
  list(): LedgerRecord[]
  setAll(records: LedgerRecord[]): void
  add(record: LedgerRecord): void
  update(record: LedgerRecord): void
  remove(id: string): void
  clear(): void
}

export interface AppSettings {
  disclaimerRead: boolean
  lastScenario?: Record<string, number>
}

export type ShopRepository = Repository<ShopModel>
export type SettingsRepository = Repository<AppSettings>
