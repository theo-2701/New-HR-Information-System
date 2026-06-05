import { useCallback, useEffect, useRef, useState } from 'react'
import { payrollService } from '../services/payrollService'
import type { Employee, PayrollStep, RunPayrollConfig } from '../types'

const CHECKLIST_SKIP_KEY = 'pp_skip_checklist'

export function useRunPayroll() {
  const [step, setStep] = useState<PayrollStep>(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showChecklist, setShowChecklist] = useState(false)
  const [skipChecklist, setSkipChecklist] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<number | null>(null) // row index
  const [showResetModal, setShowResetModal] = useState(false)
  const [showContinueModal, setShowContinueModal] = useState(false)
  const [config, setConfig] = useState<RunPayrollConfig>({
    period: 'Mar 2026',
    paymentSchedule: 'Default (25 Mar 2026)',
    useCustomBpjs: false,
    selectedEmployeeIds: [],
  })

  // Load employees once
  useEffect(() => {
    payrollService.getEmployees().then(setEmployees)
  }, [])

  // Persist checklist skip preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHECKLIST_SKIP_KEY)
      if (stored === 'true') setSkipChecklist(true)
    } catch {}
  }, [])

  const openChecklist = useCallback(() => {
    const skip = (() => { try { return localStorage.getItem(CHECKLIST_SKIP_KEY) === 'true' } catch { return false } })()
    if (!skip) setShowChecklist(true)
  }, [])

  const closeChecklist = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain) {
      try { localStorage.setItem(CHECKLIST_SKIP_KEY, 'true') } catch {}
      setSkipChecklist(true)
    }
    setShowChecklist(false)
  }, [])

  const selectedEmployees = employees.filter(e => config.selectedEmployeeIds.includes(e.id))

  function assignEmployees(ids: string[]) {
    setConfig(c => ({ ...c, selectedEmployeeIds: ids }))
  }

  function selectAll() {
    setConfig(c => ({ ...c, selectedEmployeeIds: employees.map(e => e.id) }))
  }

  function clearAll() {
    setConfig(c => ({ ...c, selectedEmployeeIds: [] }))
  }

  function goNext() {
    if (step === 1 && config.selectedEmployeeIds.length === 0) return false
    setStep(s => Math.min(s + 1, 3) as PayrollStep)
    return true
  }

  function goBack() {
    setStep(s => Math.max(s - 1, 1) as PayrollStep)
  }

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'progress' | 'summary'>('progress')

  function startProgress() {
    setProgress(0)
    setPhase('progress')
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 4, 100)
        if (next >= 100) {
          if (progressRef.current) clearInterval(progressRef.current)
          setTimeout(() => setPhase('summary'), 600)
        }
        return next
      })
    }, 90)
  }

  function skipToSummary() {
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(100)
    setPhase('summary')
  }

  return {
    step, setStep,
    employees, selectedEmployees,
    config, setConfig,
    showChecklist, openChecklist, closeChecklist, skipChecklist,
    showAssignModal, setShowAssignModal,
    showEditModal, setShowEditModal,
    showResetModal, setShowResetModal,
    showContinueModal, setShowContinueModal,
    assignEmployees, selectAll, clearAll,
    goNext, goBack,
    progress, phase, startProgress, skipToSummary,
  }
}
