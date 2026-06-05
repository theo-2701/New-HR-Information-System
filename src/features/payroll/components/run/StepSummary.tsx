import { useEffect, useRef } from 'react'
import { FileText, Receipt, LayoutGrid } from 'lucide-react'
import { SecondaryButton } from '../modals/ConfirmModal'
import type { Employee, RunPayrollConfig } from '../../types'

interface Props {
  config: RunPayrollConfig
  selectedEmployees: Employee[]
  progress: number
  phase: 'progress' | 'summary'
  onMinimize: () => void
  onGoHistory: () => void
}

export function StepSummary({ config, selectedEmployees, progress, phase, onMinimize, onGoHistory }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-10 pb-9 pt-2" style={{ scrollbarWidth: 'thin' }}>
      {phase === 'progress'
        ? <ProgressView progress={progress} total={selectedEmployees.length} onMinimize={onMinimize} />
        : <SummaryView config={config} employeeCount={selectedEmployees.length} onGoHistory={onGoHistory} />
      }
    </div>
  )
}

// ── Progress ring ──────────────────────────────────────────────────────────

function ProgressView({ progress, total, onMinimize }: { progress: number; total: number; onMinimize: () => void }) {
  const CIRC = 691.15 // 2π × 110
  const done = Math.round((progress / 100) * total)

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="flex flex-col items-center text-center py-6 pb-12">
        <ProgressRing progress={progress} circumference={CIRC} />
        <p className="font-bold text-[24px] mt-9 m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>
          Processing your payroll ({done}/{total} employee)
        </p>
        <p className="text-[16px] font-medium mt-2 mb-7" style={{ color: 'var(--fg-3)' }}>
          Please wait while we set things up for you.
        </p>
        <SecondaryButton onClick={onMinimize}>Minimize</SecondaryButton>
      </div>
    </div>
  )
}

function ProgressRing({ progress, circumference }: { progress: number; circumference: number }) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference * (1 - progress / 100))
    }
  }, [progress, circumference])

  return (
    <div className="relative w-[240px] h-[240px] flex items-center justify-center">
      <svg
        width="240" height="240" viewBox="0 0 240 240"
        style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}
      >
        {/* Track */}
        <circle cx="120" cy="120" r="110" fill="none" stroke="var(--color-primary-100)" strokeWidth="4" />
        {/* Fill */}
        <circle
          ref={circleRef}
          cx="120" cy="120" r="110"
          fill="none"
          stroke="var(--color-secondary-500)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transition: 'stroke-dashoffset 90ms linear' }}
        />
      </svg>
      <span
        className="font-bold text-[76px] leading-none"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-slate)', letterSpacing: '-0.03em' }}
      >
        {progress}%
      </span>
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────────────

function SummaryView({ config, employeeCount, onGoHistory }: {
  config: RunPayrollConfig
  employeeCount: number
  onGoHistory: () => void
}) {
  return (
    <div className="pt-[18px]">
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="font-bold text-[18px] m-0" style={{ color: 'var(--fg-1)' }}>Payroll calculation is completed</h3>
        <p className="text-[14px] font-medium m-0" style={{ color: 'var(--fg-3)' }}>
          Your data to run payroll has been succesfully set with the details below.
        </p>
      </div>

      {/* Summary row */}
      <SummaryRow config={config} employeeCount={employeeCount} />

      {/* Report buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6 mb-8">
        {[
          { icon: FileText, label: 'Salary Detail' },
          { icon: Receipt,  label: 'Payslip' },
          { icon: FileText, label: 'Tax Detail' },
          { icon: LayoutGrid, label: 'Other Report' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-3 h-[60px] px-[22px] rounded-[8px] font-bold text-[17px] cursor-pointer border transition-all duration-[180ms]"
            style={{
              background: '#fff',
              borderColor: 'var(--border-1)',
              boxShadow: 'var(--shadow-inset-rim)',
              color: 'var(--color-secondary-700)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-vapor)'; e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
          >
            <Icon size={22} style={{ color: 'var(--color-secondary-600)', flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Next step CTA */}
      <div>
        <p className="font-bold text-[18px] mb-[6px]" style={{ color: 'var(--fg-1)' }}>Continue to the next step</p>
        <p className="text-[15px] font-medium leading-relaxed mb-[22px]" style={{ color: 'var(--fg-3)' }}>
          You can <b style={{ color: 'var(--fg-2)' }}>request approval, lock or unlock the payroll, publish payslip, and payroll disbursement</b> through the payroll history page.
        </p>
        <SecondaryButton onClick={onGoHistory}>Go To Payroll History</SecondaryButton>
      </div>
    </div>
  )
}

export function SummaryRow({ config, employeeCount }: { config: RunPayrollConfig; employeeCount: number }) {
  const items = [
    { label: 'Payment schedule',     value: config.paymentSchedule },
    { label: 'Payroll cut off period', value: `1 ${config.period} – last day` },
    { label: 'Employee',             value: `${employeeCount} employee${employeeCount !== 1 ? 's' : ''}` },
  ]
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', margin: '4px 0 26px' }}>
      {items.map(({ label, value }, i) => (
        <div
          key={label}
          className="flex flex-col gap-2 px-7 py-0"
          style={{ borderLeft: i > 0 ? '1px solid var(--border-1)' : 'none', paddingLeft: i === 0 ? '2px' : undefined }}
        >
          <span className="text-[15px] font-medium" style={{ color: 'var(--fg-4)' }}>{label}</span>
          <span className="font-bold text-[20px]" style={{ color: 'var(--fg-1)' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}
