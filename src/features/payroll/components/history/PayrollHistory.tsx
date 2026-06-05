import { useState } from 'react'
import { FileOutput, Search, TrendingUp } from 'lucide-react'
import { PayrollHistoryTable } from './PayrollHistoryTable'
import { ConfirmModal, SecondaryButton } from '../modals/ConfirmModal'
import { EBankingModal } from '../modals/EBankingModal'
import { usePayrollHistory } from '../../hooks/usePayrollHistory'

interface Props {
  onRunPayroll: () => void
  periods: string[]
}

export function PayrollHistory({ onRunPayroll, periods }: Props) {
  const {
    year, setYear, query, setQuery, rows, formatRupiah,
    confirmConfig, setConfirmConfig, openPrimaryConfirm, openLockConfirm,
  } = usePayrollHistory()

  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showEbanking, setShowEbanking] = useState<{ open: boolean; period?: string }>({ open: false })

  return (
    <div className="flex-1 overflow-y-auto px-10 py-[30px]" style={{ scrollbarWidth: 'thin' }}>
      {/* Head */}
      <div className="flex items-center justify-between gap-4 mb-0">
        <h2 className="font-bold text-[26px] m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
          Payroll History
        </h2>
        <div className="flex gap-3">
          <SecondaryButton onClick={() => setShowEbanking({ open: true })}>Download E-Banking</SecondaryButton>
          <SecondaryButton onClick={() => {}}>Disbursement</SecondaryButton>
        </div>
      </div>

      <div className="h-px my-5" style={{ background: 'var(--border-1)' }} />

      <p className="text-[14px] font-medium mb-0" style={{ color: 'var(--fg-3)' }}>
        Showing payroll runs for the selected year. Click{' '}
        <button type="button" onClick={onRunPayroll} className="font-semibold underline cursor-pointer bg-transparent border-none p-0" style={{ color: 'var(--color-secondary-600)' }}>
          Run Payroll
        </button>{' '}
        to start a new period, or open a report to review a completed run.
      </p>

      {/* Toolbar */}
      <div className="flex items-center gap-[10px] mt-[22px] mb-[18px]">
        {/* Year input + calendar */}
        <div className="relative">
          <div
            className="flex items-center h-[48px] rounded-[8px] overflow-hidden cursor-pointer"
            style={{ width: '210px', background: '#fff', boxShadow: 'var(--shadow-inset-rim)' }}
            onClick={() => setShowYearPicker(v => !v)}
          >
            <span className="flex-1 pl-4 font-semibold text-[16px]" style={{ color: 'var(--fg-1)' }}>{year}</span>
            <span
              className="w-[46px] h-full flex items-center justify-center flex-shrink-0"
              style={{ borderLeft: '1px solid var(--border-1)', color: 'var(--fg-3)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </span>
          </div>
          {showYearPicker && (
            <YearPicker
              current={year}
              onPick={y => { setYear(y); setShowYearPicker(false) }}
              onClose={() => setShowYearPicker(false)}
            />
          )}
        </div>

        {/* Prev / Next */}
        <NavBtn onClick={() => setYear(y => y - 1)} aria-label="Previous year">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="m15 18-6-6 6-6"/></svg>
        </NavBtn>
        <NavBtn onClick={() => setYear(y => y + 1)} aria-label="Next year">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="m9 18 6-6-6-6"/></svg>
        </NavBtn>

        <span className="flex-1" />

        <IconBtn aria-label="Insights"><TrendingUp size={23} /></IconBtn>
        <IconBtn aria-label="Export"><FileOutput size={23} /></IconBtn>

        {/* Search */}
        <div
          className="flex items-center gap-2 h-[48px] rounded-[8px] px-4 transition-all"
          style={{ width: '270px', background: '#fff', boxShadow: 'var(--shadow-inset-rim)' }}
        >
          <input
            className="flex-1 min-w-0 border-none bg-transparent outline-none text-[15px] font-medium"
            style={{ color: 'var(--fg-1)' }}
            placeholder="Search period"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Search size={20} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
        </div>
      </div>

      {/* Table */}
      <PayrollHistoryTable
        rows={rows}
        formatRupiah={formatRupiah}
        onPrimary={openPrimaryConfirm}
        onLock={openLockConfirm}
        onEbanking={period => setShowEbanking({ open: true, period })}
      />

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
        <span className="text-[15px] font-medium" style={{ color: 'var(--fg-3)' }}>
          Showing 1–{rows.length} of {rows.length} payroll runs
        </span>
        <div className="flex items-center gap-2">
          <NavBtn aria-label="Previous page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="m15 18-6-6 6-6"/></svg>
          </NavBtn>
          <span
            className="min-w-[56px] h-[42px] inline-flex items-center justify-center px-[14px] rounded-[8px] font-bold text-[15px]"
            style={{ background: '#fff', boxShadow: 'var(--shadow-inset-rim)', color: 'var(--fg-1)' }}
          >1</span>
          <span className="text-[15px] font-medium mx-[6px]" style={{ color: 'var(--fg-3)' }}>of 1</span>
          <NavBtn aria-label="Next page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="m9 18 6-6-6-6"/></svg>
          </NavBtn>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      <EBankingModal
        open={showEbanking.open}
        periods={periods}
        presetPeriod={showEbanking.period}
        onClose={() => setShowEbanking({ open: false })}
      />
    </div>
  )
}

// ── Year picker popover ────────────────────────────────────────────────────

function YearPicker({ current, onPick, onClose }: { current: number; onPick: (y: number) => void; onClose: () => void }) {
  const [base, setBase] = useState(current - (current % 12))
  const thisYear = new Date().getFullYear()

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute top-full left-0 mt-1 z-50 rounded-[12px] p-3"
        style={{ width: '260px', background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-popup)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <NavBtn onClick={() => setBase(b => b - 12)} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg>
          </NavBtn>
          <span className="font-bold text-[15px]" style={{ color: 'var(--fg-1)' }}>{base} – {base + 11}</span>
          <NavBtn onClick={() => setBase(b => b + 12)} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
          </NavBtn>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, i) => base + i).map(y => (
            <button
              key={y}
              type="button"
              disabled={y > thisYear}
              onClick={() => onPick(y)}
              className="py-2 rounded-[6px] text-[13px] font-semibold cursor-pointer border-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: y === current ? 'var(--color-secondary-500)' : 'transparent',
                color: y === current ? '#fff' : 'var(--fg-1)',
              }}
              onMouseEnter={e => { if (y !== current) e.currentTarget.style.background = 'var(--color-mist)' }}
              onMouseLeave={e => { if (y !== current) e.currentTarget.style.background = 'transparent' }}
            >{y}</button>
          ))}
        </div>
      </div>
    </>
  )
}

function NavBtn({ children, onClick, 'aria-label': label }: { children: React.ReactNode; onClick?: () => void; 'aria-label'?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-[8px] cursor-pointer border-none transition-colors"
      style={{ background: 'transparent', color: 'var(--fg-2)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)'; e.currentTarget.style.color = 'var(--color-secondary-700)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)' }}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, 'aria-label': label }: { children: React.ReactNode; 'aria-label': string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-11 h-11 flex items-center justify-center rounded-[8px] cursor-pointer border-none transition-colors"
      style={{ background: 'transparent', color: 'var(--color-secondary-600)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
