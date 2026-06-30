export type AnalyticsEventName =
  | 'welcome_view'
  | 'industry_select'
  | 'calculate_submit'
  | 'report_view'
  | 'store_create'
  | 'dashboard_view'
  | 'ledger_first_entry'
  | 'ledger_entry_create'
  | 'scenario_run'
  | 'profile_view'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  payload?: Record<string, unknown>
  createdAt: string
}

const logs: AnalyticsEvent[] = []

export function trackEvent(name: AnalyticsEventName, payload?: Record<string, unknown>): void {
  const event = {
    name,
    payload,
    createdAt: new Date().toISOString()
  }
  logs.push(event)
  if (typeof console !== 'undefined') {
    console.info('[analytics]', event)
  }
}

export function getLocalAnalyticsLogs(): AnalyticsEvent[] {
  return [...logs]
}
