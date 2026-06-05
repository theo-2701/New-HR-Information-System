import { useState } from 'react'
import { Dialog, DialogContent } from '../shared/Dialog'
import { ChevronDown, Plus, X } from 'lucide-react'
import { BANKS } from '../../services/payrollService'
import { PrimaryButton, SecondaryButton } from './ConfirmModal'
import type { EBankingFormState, EBankingFilter } from '../../types'

const FILTER_TYPES = [
  { key: 'branch',      label: 'Branch',            values: ['Head Office', 'Bandung Branch', 'Surabaya Branch', 'Medan Branch'] },
  { key: 'organization',label: 'Organization',      values: ['Finance', 'Engineering', 'People & Culture', 'Sales'] },
  { key: 'jobposition', label: 'Job position',      values: ['Staff', 'Supervisor', 'Manager', 'Director'] },
  { key: 'joblevel',    label: 'Job level',         values: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'] },
  { key: 'employees',   label: 'Employees',         values: ['Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Bruce Banner'] },
  { key: 'empstatus',   label: 'Employment status', values: ['Permanent', 'Contract', 'Probation', 'Intern'] },
  { key: 'periodsched', label: 'Period schedules',  values: ['Monthly (25th)', 'End of month', 'Bi-weekly'] },
  { key: 'bankname',    label: 'Bank name',         values: BANKS },
  { key: 'costcenter',  label: 'Cost center',       values: ['CC-100 · HQ', 'CC-200 · Sales', 'CC-300 · Ops'] },
]

const DEFAULT_STATE: EBankingFormState = {
  salaryType: 'Salary', period: null, bankName: null,
  fileType: 'txt', format: 'old', transferDate: '', otherBank: false, filters: [],
}

interface Props {
  open: boolean
  periods: string[]
  presetPeriod?: string | null
  onClose: () => void
}

export function EBankingModal({ open, periods, presetPeriod, onClose }: Props) {
  const [form, setForm] = useState<EBankingFormState>(() =>
    ({ ...DEFAULT_STATE, period: presetPeriod ?? null })
  )

  function patch(p: Partial<EBankingFormState>) { setForm(f => ({ ...f, ...p })) }

  function addFilter() {
    const used = form.filters.map(f => f.typeKey)
    const next = FILTER_TYPES.find(t => !used.includes(t.key))
    if (next) patch({ filters: [...form.filters, { typeKey: next.key, value: null }] })
  }

  function removeFilter(i: number) {
    patch({ filters: form.filters.filter((_, idx) => idx !== i) })
  }

  function updateFilter(i: number, p: Partial<EBankingFilter>) {
    patch({ filters: form.filters.map((f, idx) => idx === i ? { ...f, ...p } : f) })
  }

  const canAddMore = form.filters.length < FILTER_TYPES.length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 rounded-[16px] overflow-hidden flex flex-col"
        style={{ width: 'min(720px, calc(100vw - 48px))', maxWidth: 'none', maxHeight: '88vh', boxShadow: 'var(--shadow-popup)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <h2 className="text-[24px] font-bold m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
            Download E-Banking
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 flex flex-col gap-0" style={{ scrollbarWidth: 'thin' }}>
          <SectionHeading>Set payroll history data</SectionHeading>

          {/* Salary type */}
          <FieldBlock label="Salary type">
            <RadioRow>
              {(['Salary', 'THR'] as const).map(v => (
                <RadioOpt key={v} name="ebSalary" value={v} checked={form.salaryType === v} onChange={() => patch({ salaryType: v })} />
              ))}
            </RadioRow>
          </FieldBlock>

          {/* Period */}
          <FieldBlock label="Period">
            <SelectCtl
              value={form.period}
              placeholder="Select period"
              options={periods}
              onSelect={v => patch({ period: v })}
            />
          </FieldBlock>

          {/* Bank */}
          <FieldBlock label="Bank name">
            <SelectCtl
              value={form.bankName}
              placeholder="Select bank"
              options={BANKS}
              onSelect={v => patch({ bankName: v })}
            />
          </FieldBlock>

          {/* Bank-dependent fields */}
          {form.bankName && (
            <>
              <FieldBlock label="File type">
                <RadioRow>
                  <RadioOpt name="ebFile" value="txt" label="Text (.txt)" checked={form.fileType === 'txt'} onChange={() => patch({ fileType: 'txt' })} />
                  <RadioOpt name="ebFile" value="csv" label="CSV (.csv)" checked={form.fileType === 'csv'} onChange={() => patch({ fileType: 'csv' })} />
                </RadioRow>
              </FieldBlock>

              <FieldBlock label="Format">
                <RadioRow>
                  <RadioOpt name="ebFormat" value="old" label="Old" checked={form.format === 'old'} onChange={() => patch({ format: 'old' })} />
                  <RadioOpt name="ebFormat" value="new" label="New" checked={form.format === 'new'} onChange={() => patch({ format: 'new' })} />
                </RadioRow>
              </FieldBlock>

              <FieldBlock label="Transfer date">
                <input
                  type="date"
                  value={form.transferDate}
                  onChange={e => patch({ transferDate: e.target.value })}
                  className="w-full h-[50px] rounded-[8px] px-4 text-[15px] font-medium border-none outline-none cursor-pointer"
                  style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)', color: form.transferDate ? 'var(--fg-1)' : 'var(--fg-4)' }}
                />
              </FieldBlock>

              <FieldBlock label="Transfer to">
                <label className="inline-flex items-center gap-[10px] cursor-pointer select-none font-medium text-[15px]" style={{ color: 'var(--fg-1)' }}>
                  <CheckboxInput checked={form.otherBank} onChange={v => patch({ otherBank: v })} />
                  Other bank
                </label>
              </FieldBlock>
            </>
          )}

          {/* Divider */}
          <div className="my-6" style={{ height: '1px', background: 'var(--border-1)' }} />

          <SectionHeading>Add filter to your payroll history</SectionHeading>
          <p className="text-[14px] mt-[-6px] mb-[18px]" style={{ color: 'var(--fg-3)' }}>All data will be shown if no filter selected</p>

          {/* Filter rows */}
          <div className="flex flex-col gap-[14px]">
            {form.filters.map((f, i) => (
              <EBFilterRow
                key={i}
                filter={f}
                usedKeys={form.filters.filter((_, idx) => idx !== i).map(x => x.typeKey)}
                onChange={p => updateFilter(i, p)}
                onRemove={() => removeFilter(i)}
              />
            ))}
          </div>

          {/* Add filter */}
          <div className="mt-[18px]">
            <button
              type="button"
              onClick={addFilter}
              disabled={!canAddMore}
              className="inline-flex items-center gap-3 h-[50px] px-[14px] pr-[22px] rounded-[8px] font-bold text-[15px] cursor-pointer transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: '1px solid var(--border-2)',
                background: '#fff',
                boxShadow: canAddMore ? 'var(--shadow-inset-rim)' : 'none',
                color: 'var(--color-secondary-600)',
              }}
            >
              <span
                className="w-[26px] h-[26px] flex items-center justify-center rounded-[4px] flex-shrink-0"
                style={{ background: canAddMore ? 'var(--color-secondary-500)' : 'var(--color-secondary-100)' }}
              >
                <Plus size={16} color="white" />
              </span>
              Add Filter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[14px] px-8 py-[18px] flex-shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onClose}>Download</PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EBFilterRow({ filter, usedKeys, onChange, onRemove }: {
  filter: EBankingFilter
  usedKeys: string[]
  onChange: (p: Partial<EBankingFilter>) => void
  onRemove: () => void
}) {
  const def = FILTER_TYPES.find(t => t.key === filter.typeKey)!
  const availTypes = FILTER_TYPES.filter(t => !usedKeys.includes(t.key))

  return (
    <div
      className="grid items-center gap-[14px] rounded-[12px] p-[14px]"
      style={{ gridTemplateColumns: '1fr auto 1fr auto', background: 'var(--color-mist)' }}
    >
      <SelectCtl
        value={def.label}
        options={availTypes.map(t => t.label)}
        onSelect={label => {
          const picked = FILTER_TYPES.find(t => t.label === label)
          if (picked) onChange({ typeKey: picked.key, value: null })
        }}
      />
      <span style={{ color: 'var(--fg-3)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
      <SelectCtl
        value={filter.value}
        placeholder={def.label ? `Select ${def.label.toLowerCase()}` : 'Select value'}
        options={def.values ?? []}
        onSelect={v => onChange({ value: v })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="w-[38px] h-[38px] flex-shrink-0 flex items-center justify-center rounded-[8px] border-none cursor-pointer transition-colors"
        style={{ background: 'transparent', color: 'var(--color-error-500)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-error-50)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <X size={20} />
      </button>
    </div>
  )
}

function SelectCtl({ value, placeholder = 'Select', options, onSelect }: {
  value: string | null
  placeholder?: string
  options: string[]
  onSelect: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between h-[50px] rounded-[8px] px-4 cursor-pointer border-none transition-all"
        style={{ background: '#fff', boxShadow: 'var(--shadow-inset-rim)' }}
      >
        <span className="text-[15px] font-medium" style={{ color: value ? 'var(--fg-1)' : 'var(--fg-4)' }}>
          {value ?? placeholder}
        </span>
        <ChevronDown size={18} style={{ color: 'var(--fg-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[10px] overflow-hidden"
          style={{ background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-card)', maxHeight: '232px', overflowY: 'auto' }}
        >
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onSelect(opt); setOpen(false) }}
              className="w-full text-left px-4 py-[10px] text-[14px] font-medium cursor-pointer border-none bg-transparent transition-colors"
              style={{ color: opt === value ? 'var(--color-secondary-700)' : 'var(--fg-1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-[18px] mb-[14px] m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>{children}</h3>
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <label className="block font-bold text-[15px] mb-2" style={{ color: 'var(--fg-1)' }}>{label}</label>
      {children}
    </div>
  )
}

function RadioRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-6">{children}</div>
}

function RadioOpt({ name, value, label, checked, onChange }: {
  name: string; value: string; label?: string; checked: boolean; onChange: () => void
}) {
  return (
    <label className="inline-flex items-center gap-[10px] cursor-pointer font-medium text-[15px]" style={{ color: 'var(--fg-1)' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors"
        style={{ borderColor: checked ? 'var(--color-secondary-500)' : 'var(--border-2)' }}
      >
        {checked && <span className="w-[8px] h-[8px] rounded-full" style={{ background: 'var(--color-secondary-500)' }} />}
      </span>
      {label ?? value}
    </label>
  )
}

function CheckboxInput({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-5 h-5 flex-shrink-0 rounded-[5px] flex items-center justify-center transition-all"
      style={{
        background: checked ? 'var(--color-secondary-500)' : '#fff',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--color-error-500)',
      }}
    >
      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  )
}
