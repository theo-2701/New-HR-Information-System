import { useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../modals/ConfirmModal'
import type { Employee, RunPayrollConfig } from '../../types'

interface Props {
  config: RunPayrollConfig
  onChangeConfig: (p: Partial<RunPayrollConfig>) => void
  selectedEmployees: Employee[]
  onSelectEmployee: () => void
  onSelectAll: () => void
  onOpenChecklist: () => void
  onNext: () => boolean
  onCancel: () => void
}

const SCHEDULES = ['Default (25 Mar 2026)', 'End of month (31 Mar 2026)', 'Custom date']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function StepSetup({ config, onChangeConfig, selectedEmployees, onSelectEmployee, onSelectAll, onOpenChecklist, onNext, onCancel }: Props) {
  const [showError, setShowError] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(2026)
  const [pickerMode, setPickerMode] = useState<'months' | 'years'>('months')
  const [scheduleOpen, setScheduleOpen] = useState(false)

  function handleNext() {
    if (selectedEmployees.length === 0) { setShowError(true); return }
    setShowError(false)
    onNext()
  }

  function commitMonth(month: number, year: number) {
    onChangeConfig({ period: `${MONTHS_SHORT[month]} ${year}` })
    setMonthPickerOpen(false)
    setPickerMode('months')
  }

  const currentMonth = (() => {
    const [m, y] = (config.period ?? 'Mar 2026').split(' ')
    return { month: MONTHS_SHORT.indexOf(m), year: parseInt(y) }
  })()

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-10 pb-9 pt-2" style={{ scrollbarWidth: 'thin' }}>
        {/* Header */}
        <div className="flex flex-col gap-1 mb-5">
          <h3 className="font-bold text-[18px] m-0" style={{ color: 'var(--fg-1)' }}>Setup run payroll</h3>
          <p className="text-[14px] font-medium m-0" style={{ color: 'var(--fg-3)' }}>
            You can check payroll checklist{' '}
            <button type="button" onClick={onOpenChecklist} className="font-semibold underline cursor-pointer bg-transparent border-none p-0" style={{ color: 'var(--color-secondary-600)' }}>
              here
            </button>
          </p>
        </div>

        {/* Government banner */}
        <div
          className="grid gap-3 px-[22px] py-[18px] rounded-[8px] mb-7"
          style={{ gridTemplateColumns: '22px 1fr', background: '#d9f2e2' }}
        >
          <AlertTriangle size={22} className="mt-[1px]" style={{ color: 'var(--color-warning-500)' }} />
          <div>
            <p className="font-bold text-[15px] m-0 mb-[6px]" style={{ color: '#064e3b' }}>Government's regulation</p>
            <p className="text-[14px] font-medium leading-relaxed m-0" style={{ color: '#065f46' }}>
              Starting from 1 January 2024, Tax Calculation will be calculated based on Tarif Efektif Rata-Rata (TER) Method on accordance to government's regulation
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-[22px] mb-7">
          {/* Payroll period */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[15px]" style={{ color: 'var(--fg-1)' }}>Payroll period</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setMonthPickerOpen(v => !v); setPickerMode('months') }}
                className="w-full flex items-center justify-between h-[50px] rounded-[8px] px-4 cursor-pointer border-none transition-all"
                style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)', fontFamily: 'var(--font-body)' }}
              >
                <span className="text-[15px] font-medium" style={{ color: 'var(--fg-1)' }}>{config.period}</span>
                <CalendarIcon />
              </button>
              {monthPickerOpen && (
                <MonthPicker
                  mode={pickerMode}
                  year={pickerYear}
                  selected={currentMonth}
                  onModeToggle={() => setPickerMode(m => m === 'months' ? 'years' : 'months')}
                  onYearChange={setPickerYear}
                  onPick={commitMonth}
                  onClose={() => { setMonthPickerOpen(false); setPickerMode('months') }}
                />
              )}
            </div>
          </div>

          {/* Payment schedule */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[15px]" style={{ color: 'var(--fg-1)' }}>Payment schedule</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setScheduleOpen(v => !v)}
                className="w-full flex items-center justify-between h-[50px] rounded-[8px] px-4 cursor-pointer border-none transition-all"
                style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)' }}
              >
                <span className="text-[15px] font-medium" style={{ color: 'var(--fg-1)' }}>{config.paymentSchedule}</span>
                <ChevronIcon />
              </button>
              {scheduleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[10px] overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-card)' }}>
                  {SCHEDULES.map(s => (
                    <button key={s} type="button"
                      onClick={() => { onChangeConfig({ paymentSchedule: s }); setScheduleOpen(false) }}
                      className="w-full text-left px-4 py-[10px] text-[14px] font-medium cursor-pointer border-none bg-transparent transition-colors"
                      style={{ color: s === config.paymentSchedule ? 'var(--color-secondary-700)' : 'var(--fg-1)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom BPJS */}
          <label className="inline-flex items-center gap-[10px] cursor-pointer select-none font-medium text-[15px]" style={{ color: 'var(--fg-1)' }}>
            <BpjsCheckbox checked={config.useCustomBpjs} onChange={v => onChangeConfig({ useCustomBpjs: v })} />
            Custom date for BPJS Kesehatan
            <span style={{ color: 'var(--fg-4)' }}><Info size={16} /></span>
          </label>
        </div>

        {/* Who will be processed */}
        <p className="font-bold text-[17px] mb-[14px]" style={{ color: 'var(--fg-1)' }}>Who will be processed in this run payroll?</p>
        <div className="flex items-center gap-[22px] flex-wrap">
          <SecondaryButton onClick={onSelectEmployee}>Select Employee</SecondaryButton>
          <label className="inline-flex items-center gap-[10px] cursor-pointer select-none font-medium text-[15px]" style={{ color: 'var(--fg-1)' }}>
            <BpjsCheckbox
              checked={false}
              onChange={checked => { if (checked) onSelectAll() }}
            />
            Select all employees
          </label>
        </div>

        {/* Validation error */}
        {showError && (
          <div className="flex items-center gap-[10px] mt-4 font-semibold text-[14px]" style={{ color: 'var(--color-error-600)' }}>
            <Info size={18} style={{ color: 'var(--color-error-500)', flexShrink: 0 }} />
            Please select at least one employee to run payroll.
          </div>
        )}

        {/* Selection note */}
        {selectedEmployees.length > 0 && (
          <div
            className="flex items-center gap-3 mt-[22px] px-[18px] py-4 rounded-[8px] text-[15px] font-medium"
            style={{ background: 'var(--color-primary-100)', border: '1px solid var(--color-primary-200)', color: 'var(--color-secondary-900)' }}
          >
            <span
              className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'var(--color-secondary-500)' }}
            >
              <Info size={14} color="white" />
            </span>
            <span>
              <b>{selectedEmployees.length}</b> employee{selectedEmployees.length !== 1 && 's'} selected and will be processed in this payroll.{' '}
              <button type="button" onClick={onSelectEmployee} className="font-bold underline cursor-pointer bg-transparent border-none p-0" style={{ color: 'var(--color-secondary-700)' }}>
                View employee
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-10 py-[18px] flex-shrink-0" style={{ borderTop: '1px solid var(--border-1)', background: '#fff' }}>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={handleNext}>Next</PrimaryButton>
      </footer>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MonthPicker({ mode, year, selected, onModeToggle, onYearChange, onPick, onClose }: {
  mode: 'months' | 'years'
  year: number
  selected: { month: number; year: number }
  onModeToggle: () => void
  onYearChange: (y: number) => void
  onPick: (month: number, year: number) => void
  onClose: () => void
}) {
  const yStart = year - (year % 12)

  return (
    <>
      {/* Outside-click backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute top-full left-0 z-50 mt-1 rounded-[12px] p-3"
        style={{ width: '280px', background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-popup)' }}
      >
      {/* Nav */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => onYearChange(mode === 'months' ? year - 1 : year - 12)} className="w-8 h-8 flex items-center justify-center rounded cursor-pointer border-none bg-transparent" style={{ color: 'var(--fg-2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button type="button" onClick={onModeToggle} className="font-bold text-[15px] cursor-pointer border-none bg-transparent px-3 py-1 rounded" style={{ color: 'var(--fg-1)' }}>
          {mode === 'months' ? year : `${yStart} – ${yStart + 11}`}
        </button>
        <button type="button" onClick={() => onYearChange(mode === 'months' ? year + 1 : year + 12)} className="w-8 h-8 flex items-center justify-center rounded cursor-pointer border-none bg-transparent" style={{ color: 'var(--fg-2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {mode === 'months' && (
        <div className="grid grid-cols-4 gap-1">
          {MONTHS_SHORT.map((m, i) => (
            <button key={m} type="button"
              onClick={() => onPick(i, year)}
              className="py-2 rounded-[6px] text-[14px] font-semibold cursor-pointer border-none transition-colors"
              style={{
                background: i === selected.month && year === selected.year ? 'var(--color-secondary-500)' : 'transparent',
                color: i === selected.month && year === selected.year ? '#fff' : 'var(--fg-1)',
              }}
              onMouseEnter={e => { if (!(i === selected.month && year === selected.year)) e.currentTarget.style.background = 'var(--color-mist)' }}
              onMouseLeave={e => { if (!(i === selected.month && year === selected.year)) e.currentTarget.style.background = 'transparent' }}
            >{m}</button>
          ))}
        </div>
      )}

      {mode === 'years' && (
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, i) => yStart + i).map(y => (
            <button key={y} type="button"
              onClick={() => { onYearChange(y); onModeToggle() }}
              className="py-2 rounded-[6px] text-[14px] font-semibold cursor-pointer border-none transition-colors"
              style={{
                background: y === selected.year ? 'var(--color-secondary-500)' : 'transparent',
                color: y === selected.year ? '#fff' : 'var(--fg-1)',
              }}
            >{y}</button>
          ))}
        </div>
      )}
      </div>
    </>
  )
}

function BpjsCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-5 h-5 flex-shrink-0 rounded-[5px] flex items-center justify-center transition-all" style={{ background: checked ? 'var(--color-error-500)' : '#fff', boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--color-error-500)' }}>
      {checked && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}
