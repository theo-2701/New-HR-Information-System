import { useCallback, useEffect, useRef, useState } from 'react'
import { formatRupiah, payrollService } from '../services/payrollService'
import type { ConfirmConfig, PayrollRun } from '../types'

export function usePayrollHistory() {
  const [year, setYear] = useState(2026)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null)

  const rowsRef = useRef(rows) // for stable callbacks
  rowsRef.current = rows

  const load = useCallback(async (y: number) => {
    setLoading(true)
    try {
      const data = await payrollService.getHistory(y)
      setRows(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(year) }, [year, load])

  const filtered = query
    ? rows.filter(r => r.period.toLowerCase().includes(query.toLowerCase()))
    : rows

  // State machine: mutate the in-memory row, sync to backend, re-render
  const updateRow = useCallback((id: string, patch: Partial<PayrollRun>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
    payrollService.updateRunState(id, {
      published: patch.published ?? rowsRef.current.find(r => r.id === id)!.published,
      locked:    patch.locked    ?? rowsRef.current.find(r => r.id === id)!.locked,
    })
  }, [])

  function openPrimaryConfirm(row: PayrollRun) {
    if (row.published) {
      setConfirmConfig({
        title: 'Unpublish Payslip?',
        body: `Payslip for period ${row.period} will be unpublished from employees.`,
        primaryLabel: 'Unpublish Payslip',
        isDanger: true,
        onConfirm: () => updateRow(row.id, { published: false }),
      })
    } else if (row.locked) {
      setConfirmConfig({
        title: 'Publish Payslip?',
        body: `Payslip for period ${row.period} will be published to employees.`,
        primaryLabel: 'Publish Payslip',
        onConfirm: () => updateRow(row.id, { published: true, locked: true }),
      })
    } else {
      setConfirmConfig({
        title: 'Publish Payslip?',
        body: `If you publish payslip for ${row.period}, payroll in this period will be automatically locked.`,
        primaryLabel: 'Lock & Publish Payslip',
        onConfirm: () => updateRow(row.id, { published: true, locked: true }),
      })
    }
  }

  function openLockConfirm(row: PayrollRun) {
    if (!row.locked) {
      setConfirmConfig({
        title: 'Lock Payroll?',
        body: `Payroll for period ${row.period} will be locked.`,
        primaryLabel: 'Lock Payroll',
        onConfirm: () => updateRow(row.id, { locked: true }),
      })
    } else if (row.published) {
      setConfirmConfig({
        title: 'Unlock Payroll?',
        body: `Payroll for period ${row.period} is published. Unlocking it will also unpublish the payslip from employees.`,
        primaryLabel: 'Unlock & Unpublish Payslip',
        isDanger: true,
        onConfirm: () => updateRow(row.id, { locked: false, published: false }),
      })
    } else {
      setConfirmConfig({
        title: 'Unlock Payroll?',
        body: `Payroll for period ${row.period} will be unlocked.`,
        primaryLabel: 'Unlock Payroll',
        onConfirm: () => updateRow(row.id, { locked: false }),
      })
    }
  }

  return {
    year, setYear,
    query, setQuery,
    rows: filtered,
    loading,
    formatRupiah,
    confirmConfig,
    setConfirmConfig,
    openPrimaryConfirm,
    openLockConfirm,
  }
}
