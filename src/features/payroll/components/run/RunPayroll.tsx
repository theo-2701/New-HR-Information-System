import { ChecklistModal } from '../modals/ChecklistModal'
import { AssignEmployeeModal } from '../modals/AssignEmployeeModal'
import { EditComponentModal } from '../modals/EditComponentModal'
import { ConfirmModal } from '../modals/ConfirmModal'
import { StepSetup } from './StepSetup'
import { StepReview } from './StepReview'
import { StepSummary } from './StepSummary'
import { useRunPayroll } from '../../hooks/useRunPayroll'

interface Props {
  onGoHistory: () => void
  onCancel: () => void
}

export function RunPayroll({ onGoHistory, onCancel }: Props) {
  const rp = useRunPayroll()

  return (
    <>
      {/* Stepper header */}
      <div className="px-10 pt-7 pb-0" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <Stepper step={rp.step} />
      </div>

      {/* Step content */}
      {rp.step === 1 && (
        <StepSetup
          config={rp.config}
          onChangeConfig={p => rp.setConfig(c => ({ ...c, ...p }))}
          selectedEmployees={rp.selectedEmployees}
          onSelectEmployee={() => rp.setShowAssignModal(true)}
          onSelectAll={rp.selectAll}
          onOpenChecklist={rp.openChecklist}
          onNext={rp.goNext}
          onCancel={onCancel}
        />
      )}

      {rp.step === 2 && (
        <StepReview
          config={rp.config}
          selectedEmployees={rp.selectedEmployees}
          onBack={rp.goBack}
          onRun={() => rp.setShowContinueModal(true)}
          onEditEmployee={idx => rp.setShowEditModal(idx)}
          onResetPeriod={() => rp.setShowResetModal(true)}
        />
      )}

      {rp.step === 3 && (
        <StepSummary
          config={rp.config}
          selectedEmployees={rp.selectedEmployees}
          progress={rp.progress}
          phase={rp.phase}
          onMinimize={rp.skipToSummary}
          onGoHistory={onGoHistory}
        />
      )}

      {/* Modals */}
      <ChecklistModal
        open={rp.showChecklist}
        onClose={rp.closeChecklist}
      />

      <AssignEmployeeModal
        open={rp.showAssignModal}
        employees={rp.employees}
        selectedIds={rp.config.selectedEmployeeIds}
        onSubmit={ids => { rp.assignEmployees(ids); rp.setShowAssignModal(false) }}
        onClose={() => rp.setShowAssignModal(false)}
      />

      <EditComponentModal
        open={rp.showEditModal !== null}
        employeeIndex={rp.showEditModal}
        onClose={() => rp.setShowEditModal(null)}
        onSave={() => rp.setShowEditModal(null)}
      />

      <ConfirmModal
        config={rp.showResetModal ? {
          title: 'Reset This Period?',
          body: 'All payroll data from all employees in this period will be reset. You cannot undo this action.',
          primaryLabel: 'Reset',
          isDanger: true,
          onConfirm: () => rp.setShowResetModal(false),
        } : null}
        onClose={() => rp.setShowResetModal(false)}
      />

      <ConfirmModal
        config={rp.showContinueModal ? {
          title: 'Continue Run Payroll?',
          body: 'All changes will be saved and payroll calculation will start.',
          primaryLabel: 'Run',
          onConfirm: () => {
            rp.setShowContinueModal(false)
            rp.setStep(3)
            rp.startProgress()
          },
        } : null}
        onClose={() => rp.setShowContinueModal(false)}
      />
    </>
  )
}

// ── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Step 1', sub: 'Set Up' },
    { n: 2, label: 'Step 2', sub: 'Review' },
    { n: 3, label: 'Step 3', sub: 'Summary' },
  ]

  return (
    <div className="grid mb-0 pb-7" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {steps.map(({ n, label, sub }) => {
        const done = n < step
        const current = n === step
        return (
          <div key={n} className="flex flex-col items-start relative">
            {/* Connector line */}
            {n < 3 && (
              <div
                className="absolute top-[14px] left-[28px] right-0 h-[2px]"
                style={{ background: done ? 'var(--color-secondary-500)' : 'var(--border-1)' }}
              />
            )}
            {/* Dot */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-bold z-10 transition-all duration-[180ms]"
              style={{
                background: done || current ? 'var(--color-secondary-500)' : '#fff',
                color: done || current ? '#fff' : 'var(--fg-3)',
                boxShadow: done || current ? 'none' : '0 0 0 1.5px var(--border-2)',
                outline: current ? '4px solid var(--color-secondary-200)' : 'none',
              }}
            >
              {done ? (
                <svg viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" width="14" height="14">
                  <path d="M2 7l4 4 6-6"/>
                </svg>
              ) : n}
            </div>
            {/* Labels */}
            <p className="text-[12px] font-bold mt-2 mb-0" style={{ color: 'var(--fg-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
            <p className="text-[14px] font-semibold m-0" style={{ color: done || current ? 'var(--fg-1)' : 'var(--fg-3)' }}>{sub}</p>
          </div>
        )
      })}
    </div>
  )
}
