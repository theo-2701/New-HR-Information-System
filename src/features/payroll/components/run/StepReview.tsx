import { useState } from 'react'
import { FileInput, FileOutput, Search, Info } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../modals/ConfirmModal'
import { SummaryRow } from './StepSummary'
import type { Employee, RunPayrollConfig } from '../../types'

interface Props {
  config: RunPayrollConfig
  selectedEmployees: Employee[]
  onBack: () => void
  onRun: () => void
  onEditEmployee: (idx: number) => void
  onResetPeriod: () => void
}

type TableView = 'overview' | 'detail'

export function StepReview({ config, selectedEmployees, onBack, onRun, onEditEmployee, onResetPeriod }: Props) {
  const [tableView, setTableView] = useState<TableView>('overview')
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-10 pb-9 pt-[18px]" style={{ scrollbarWidth: 'thin' }}>
        {/* Section header */}
        <div className="flex flex-col gap-1 mb-5">
          <h3 className="font-bold text-[18px] m-0" style={{ color: 'var(--fg-1)' }}>Review data</h3>
          <p className="text-[14px] font-medium m-0" style={{ color: 'var(--fg-3)' }}>
            You can review or manage employee payroll components.
          </p>
        </div>

        {/* Summary row */}
        <SummaryRow config={config} employeeCount={selectedEmployees.length} />

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {/* Segmented control */}
          <div
            className="inline-flex p-1 rounded-[8px]"
            style={{ background: 'var(--color-mist)', border: '1px solid var(--border-1)' }}
          >
            {(['overview', 'detail'] as TableView[]).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setTableView(v)}
                className="px-[18px] py-[7px] rounded-[6px] font-semibold text-[15px] cursor-pointer border-none capitalize transition-all duration-[180ms]"
                style={{
                  background: tableView === v ? '#fff' : 'transparent',
                  color: tableView === v ? 'var(--color-secondary-700)' : 'var(--fg-3)',
                  boxShadow: tableView === v ? 'var(--shadow-card-sm)' : 'none',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <ToolbarBtn onClick={onResetPeriod}>Reset This Payment Schedule</ToolbarBtn>
          <ToolbarBtn onClick={onResetPeriod}>Reset This Period</ToolbarBtn>

          <span className="flex-1" />

          <IconBtn aria-label="Import"><FileInput size={22} /></IconBtn>
          <IconBtn aria-label="Export"><FileOutput size={22} /></IconBtn>

          {/* Search */}
          <div
            className="flex items-center gap-2 h-[42px] rounded-[8px] px-[14px] transition-all"
            style={{ width: '240px', background: '#fff', boxShadow: 'var(--shadow-inset-rim)' }}
          >
            <input
              className="flex-1 min-w-0 border-none bg-transparent outline-none text-[15px] font-medium"
              style={{ color: 'var(--fg-1)' }}
              placeholder="Search here"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={19} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
          </div>
        </div>

        {/* Tables */}
        {tableView === 'overview'
          ? <OverviewTable employees={selectedEmployees} onEdit={onEditEmployee} />
          : <DetailTable employees={selectedEmployees} />
        }
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-10 py-[18px] flex-shrink-0" style={{ borderTop: '1px solid var(--border-1)', background: '#fff' }}>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onRun}>Run Payroll</PrimaryButton>
      </footer>
    </div>
  )
}

// ── Tables ─────────────────────────────────────────────────────────────────

function OverviewTable({ employees, onEdit }: { employees: Employee[]; onEdit: (idx: number) => void }) {
  const TH = 'font-bold text-[16px] py-4 px-[22px] text-left whitespace-nowrap align-middle'
  const TD = 'py-[18px] px-[22px] text-[16px] font-medium whitespace-nowrap align-middle'
  const headerBg = 'linear-gradient(180deg, #9bd5ef 0%, #8ccbe9 100%)'

  return (
    <div className="overflow-x-auto rounded-[12px]" style={{ scrollbarWidth: 'thin' }}>
      <table className="w-full" style={{ minWidth: '1040px', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {['Employee','Basic Salary','Allowance','Additional Earnings','Deduction','Benefit','Total',''].map((h, i) => (
              <th
                key={h + i}
                className={TH}
                style={{
                  background: headerBg,
                  color: '#fff',
                  borderTopLeftRadius: i === 0 ? '12px' : undefined,
                  borderTopRightRadius: i === 7 ? '12px' : undefined,
                  position: i === 7 ? 'sticky' : undefined,
                  right: i === 7 ? 0 : undefined,
                  width: i === 7 ? '150px' : undefined,
                  boxShadow: i === 7 ? 'inset 1px 0 0 rgba(255,255,255,.45)' : undefined,
                }}
              >
                {h === 'Total' ? <InfoTh>{h}</InfoTh> : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <tr key={emp.id}>
              <td className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: '1px solid #e2eff6' }}>
                <EmpCell emp={emp} />
              </td>
              {['Basic Salary','Allowance','Additional Earnings','Deduction','Benefit','Total'].map(col => (
                <td key={col} className={TD} style={{ background: 'var(--color-primary-50)', borderBottom: '1px solid #e2eff6', color: 'var(--fg-4)' }}>
                  [{col}]
                </td>
              ))}
              <td
                className="py-[18px] px-[22px] text-center align-middle whitespace-nowrap"
                style={{ background: 'var(--color-primary-50)', borderBottom: '1px solid #e2eff6', position: 'sticky', right: 0, boxShadow: 'inset 1px 0 0 #d7eaf4' }}
              >
                <button
                  type="button"
                  onClick={() => onEdit(idx)}
                  className="h-[40px] min-w-[96px] px-[22px] rounded-[8px] font-bold text-[15px] cursor-pointer border-none transition-all"
                  style={{ background: '#fff', boxShadow: 'var(--shadow-inset-rim)', color: 'var(--color-secondary-700)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DetailTable({ employees }: { employees: Employee[] }) {
  const TH = 'font-bold text-[16px] py-4 px-[22px] text-left whitespace-nowrap'
  const TD = 'py-[18px] px-[22px] text-[16px] font-medium whitespace-nowrap'
  const headerBg = 'linear-gradient(180deg, #9bd5ef 0%, #8ccbe9 100%)'

  return (
    <div
      className="rounded-[16px] p-5"
      style={{ background: 'var(--color-primary-100)', border: '1px solid var(--color-primary-200)' }}
    >
      <div className="flex items-center gap-3 mb-[18px]">
        <span className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: 'var(--color-secondary-500)' }}>
          <Info size={15} color="white" />
        </span>
        <span className="text-[15px] font-medium" style={{ color: 'var(--color-secondary-900)' }}>
          This table is preview only, you can back to edit from overview tab.
        </span>
      </div>

      <div className="overflow-x-auto rounded-[12px]" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full" style={{ minWidth: '880px', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {['Employee','Basic Salary','+Bonus','+Overtime','Total'].map((h, i) => (
                <th key={h} className={TH} style={{ background: headerBg, color: '#fff', borderTopLeftRadius: i === 0 ? '12px' : undefined, borderTopRightRadius: i === 4 ? '12px' : undefined }}>
                  {h === 'Total' ? <InfoTh>{h}</InfoTh> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className={TD} style={{ background: '#fff', borderBottom: '1px solid var(--color-fog)' }}>
                  <EmpCell emp={emp} />
                </td>
                {['Basic Salary','+Bonus','+Overtime','Total'].map(col => (
                  <td key={col} className={TD} style={{ background: '#fff', borderBottom: '1px solid var(--color-fog)', color: 'var(--fg-4)' }}>
                    [{col}]
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmpCell({ emp }: { emp: Employee }) {
  return (
    <div className="flex items-center gap-[14px]">
      <span
        className="w-[46px] h-[46px] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b9def2 0%, #6ba9d2 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)' }}
      >
        <svg viewBox="0 0 48 48" fill="none" width="26" height="26">
          <circle cx="24" cy="18" r="8" fill="white" opacity="0.92"/>
          <path d="M10 42c1.5-9 7.5-13 14-13s12.5 4 14 13z" fill="white" opacity="0.92"/>
        </svg>
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-bold text-[16px] leading-tight" style={{ color: 'var(--fg-1)' }}>{emp.id} - {emp.name}</span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--color-silver)' }}>{emp.location}</span>
      </div>
    </div>
  )
}

function InfoTh({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ opacity: 0.9 }}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
    </span>
  )
}

function ToolbarBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[42px] px-[18px] rounded-[8px] font-bold text-[15px] cursor-pointer border-none transition-all duration-[180ms] whitespace-nowrap"
      style={{ background: '#fff', boxShadow: 'var(--shadow-inset-rim)', color: 'var(--color-secondary-700)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
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
      className="w-[42px] h-[42px] flex items-center justify-center rounded-[8px] cursor-pointer border-none transition-colors"
      style={{ background: 'transparent', color: 'var(--color-secondary-600)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
