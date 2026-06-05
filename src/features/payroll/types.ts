export type PayrollTab = 'history' | 'run' | 'thr' | 'import' | 'settings'
export type PayrollStep = 1 | 2 | 3

export interface PayrollRun {
  id: string
  period: string         // "March 2026"
  cutOff: string         // "1 Mar – 31 Mar 2026"
  paymentSchedule: string // "25 Mar 2026"
  employees: number
  netPay: number         // raw IDR
  published: boolean
  locked: boolean
  note?: string          // "incl. THR"
}

export interface Employee {
  id: string
  name: string
  location: string
  assigned: boolean
}

export type FilterKey =
  | 'branch'
  | 'organization'
  | 'position'
  | 'level'
  | 'employment'
  | 'payroll'
  | 'schedule'

export interface FilterDef {
  key: FilterKey
  title: string
  items: string[]
}

export interface ActiveFilter {
  key: FilterKey
  selections: string[]
}

export interface ConfirmConfig {
  title: string
  body: string
  primaryLabel: string
  isDanger?: boolean
  onConfirm: () => void
}

export interface RunPayrollConfig {
  period: string         // "Mar 2026"
  paymentSchedule: string
  useCustomBpjs: boolean
  bpjsDate?: string
  selectedEmployeeIds: string[]
}

// E-Banking filter row
export interface EBankingFilter {
  typeKey: string
  value: string | null
}

export interface EBankingFormState {
  salaryType: 'Salary' | 'THR'
  period: string | null
  bankName: string | null
  fileType: 'txt' | 'csv'
  format: 'old' | 'new'
  transferDate: string
  otherBank: boolean
  filters: EBankingFilter[]
}
