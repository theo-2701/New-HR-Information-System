import { useState } from 'react'
import type { PayrollRun } from '../../types'

interface Props {
  rows: PayrollRun[]
  formatRupiah: (n: number) => string
  onPrimary: (row: PayrollRun) => void
  onLock: (row: PayrollRun) => void
  onEbanking: (period: string) => void
}

const LOCK_OPEN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
)
const LOCK_SHUT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export function PayrollHistoryTable({ rows, formatRupiah, onPrimary, onLock, onEbanking }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const TH = 'font-bold text-[16px] py-4 px-[22px] text-left whitespace-nowrap align-middle'
  const TD = 'py-[18px] px-[22px] text-[16px] font-medium whitespace-nowrap align-middle'
  const headerBg = 'linear-gradient(180deg, #9bd5ef 0%, #8ccbe9 100%)'

  if (!rows.length) {
    return (
      <div className="py-14 text-center text-[15px] font-medium" style={{ color: 'var(--fg-3)' }}>
        No payroll runs found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[12px]" style={{ border: '1px solid var(--border-1)', scrollbarWidth: 'thin' }}>
      <table className="w-full" style={{ minWidth: '1000px', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {['Payroll Period','Payment Schedule','Employees','Total Net Pay','Report','Status','Action'].map((h, i) => (
              <th
                key={h}
                className={TH}
                style={{
                  background: headerBg,
                  color: '#fff',
                  borderTopLeftRadius: i === 0 ? '11px' : undefined,
                  borderTopRightRadius: i === 6 ? '11px' : undefined,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              {/* Period */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none' }}>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[16px]" style={{ color: 'var(--fg-1)' }}>
                    {row.period}
                    {row.note && <span className="ml-2 font-semibold text-[12px]" style={{ color: 'var(--color-tertiary-700)' }}>· {row.note}</span>}
                  </span>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--color-silver)' }}>{row.cutOff}</span>
                </div>
              </td>
              {/* Schedule */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none', color: 'var(--fg-2)' }}>
                {row.paymentSchedule}
              </td>
              {/* Employees */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none', color: 'var(--fg-2)' }}>
                {row.employees} employees
              </td>
              {/* Net Pay */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none' }}>
                <strong className="font-bold" style={{ color: 'var(--fg-1)' }}>{formatRupiah(row.netPay)}</strong>
              </td>
              {/* Report */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none' }}>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 font-semibold text-[15px] underline"
                  style={{ color: 'var(--color-secondary-600)' }}
                  onClick={e => e.preventDefault()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="19" height="19">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </a>
              </td>
              {/* Status */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none' }}>
                <StatusPill published={row.published} />
              </td>
              {/* Action */}
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: idx < rows.length - 1 ? '1px solid #e2eff6' : 'none' }}>
                <div className="flex items-center gap-2">
                  <PublishBtn row={row} onClick={() => onPrimary(row)} />
                  <LockBtn row={row} onClick={() => onLock(row)} />
                  <div className="relative">
                    <MenuBtn onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)} />
                    {openMenu === row.id && (
                      <RowMenu
                        period={row.period}
                        onEbanking={() => { setOpenMenu(null); onEbanking(row.period) }}
                        onClose={() => setOpenMenu(null)}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center h-[26px] px-[14px] rounded-full font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
      style={published
        ? { background: 'var(--color-success-100)', color: 'var(--color-success-700)' }
        : { background: 'var(--color-primary-100)', color: 'var(--color-secondary-700)' }
      }
    >
      {published ? 'Published' : 'Ready to Publish'}
    </span>
  )
}

function PublishBtn({ row, onClick }: { row: PayrollRun; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[40px] px-[18px] rounded-[8px] font-bold text-[14px] cursor-pointer border-none whitespace-nowrap transition-all duration-[180ms]"
      style={{ background: '#fff', boxShadow: 'var(--shadow-inset-rim)', color: 'var(--color-secondary-700)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
    >
      {row.published ? 'Unpublish Payslip' : 'Publish Payslip'}
    </button>
  )
}

function LockBtn({ row, onClick }: { row: PayrollRun; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={row.locked ? 'Unlock payroll' : 'Lock payroll'}
      title={row.locked ? 'Unlock payroll' : 'Lock payroll'}
      className="w-9 h-9 flex items-center justify-center rounded-[8px] cursor-pointer border-none transition-all duration-[180ms]"
      style={{
        background: row.locked ? 'var(--color-primary-100)' : 'transparent',
        color: row.locked ? 'var(--color-secondary-700)' : 'var(--color-secondary-600)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = row.locked ? 'var(--color-primary-200)' : 'var(--color-mist)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = row.locked ? 'var(--color-primary-100)' : 'transparent'
      }}
    >
      {row.locked ? LOCK_SHUT : LOCK_OPEN}
    </button>
  )
}

function MenuBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-[8px] cursor-pointer border-none transition-colors"
      style={{ background: 'transparent', color: 'var(--fg-2)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
      </svg>
    </button>
  )
}

function RowMenu({ period, onEbanking, onClose }: { period: string; onEbanking: () => void; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-1 z-50 rounded-[12px] overflow-hidden min-w-[232px]"
        style={{ background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-[10px] py-[6px] mb-1 font-bold text-[11px] uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border-1)', color: 'var(--fg-4)' }}>
          {period}
        </div>
        {[
          { label: 'Download E-Banking', onClick: onEbanking, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="19" height="19"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> },
          { label: 'Disbursement', onClick: onClose, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="19" height="19"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg> },
        ].map(({ label, onClick, icon }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 w-full px-[10px] py-[10px] font-semibold text-[14px] cursor-pointer border-none bg-transparent text-left transition-colors"
            style={{ color: 'var(--fg-1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ color: 'var(--color-secondary-600)' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
