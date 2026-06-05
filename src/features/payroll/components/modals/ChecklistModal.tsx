import { useState } from 'react'
import { Dialog, DialogContent } from '../shared/Dialog'
import { Mail, User, ClipboardList, Landmark, Calendar, UsersRound } from 'lucide-react'
import { PrimaryButton } from './ConfirmModal'

interface Props {
  open: boolean
  onClose: (dontShowAgain: boolean) => void
}

const ITEMS = [
  { icon: Mail,          text: <>Checking all pending request need actions. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>Open inbox</a></> },
  { icon: User,          text: <>Checking all your employees has been transferred or resigned. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>View employee</a></> },
  { icon: ClipboardList, text: <>Make sure you have done update the payroll component. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>Update</a></> },
  { icon: Landmark,      text: <>Ensure custom rate & currency rates reflect the latest value. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>View settings</a></> },
  { icon: Calendar,      text: <>Checking employees attendance data is correct. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>View attendance</a></> },
  { icon: UsersRound,    text: <>All employees data (including new employees) has been entered correctly. <a href="#" className="font-semibold underline" style={{ color: 'var(--color-secondary-600)' }}>View employee</a></> },
]

export function ChecklistModal({ open, onClose }: Props) {
  const [dontShow, setDontShow] = useState(false)

  return (
    <Dialog open={open} onOpenChange={() => onClose(dontShow)}>
      <DialogContent
        className="max-w-[720px] p-0 gap-0 rounded-[16px] overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100vh - 64px)', boxShadow: 'var(--shadow-popup)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <h2 className="text-[28px] font-bold m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
            Payroll Checklist
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 pb-2">
          <p className="font-bold text-[15px] py-5" style={{ color: 'var(--fg-1)' }}>
            We recommend you check few things before run payroll.
          </p>
          <div>
            {ITEMS.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="grid gap-4 py-[18px]"
                style={{
                  gridTemplateColumns: '28px 1fr',
                  borderBottom: i < ITEMS.length - 1 ? '1px solid var(--color-vapor)' : 'none',
                }}
              >
                <Icon
                  size={26}
                  strokeWidth={1.6}
                  style={{ color: 'var(--color-secondary-500)', marginTop: '-2px' }}
                />
                <p className="text-[16px] font-medium leading-relaxed m-0" style={{ color: 'var(--fg-2)' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-4 px-7 py-[18px]"
          style={{ borderTop: '1px solid var(--border-1)' }}
        >
          <label className="inline-flex items-center gap-[10px] cursor-pointer select-none font-medium text-[15px]" style={{ color: 'var(--fg-1)' }}>
            <Checkbox checked={dontShow} onChange={setDontShow} />
            Don't show this again
          </label>
          <PrimaryButton onClick={() => onClose(dontShow)}>
            Run Payroll
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-5 h-5 flex-shrink-0 rounded-[5px] flex items-center justify-center transition-all duration-[180ms]"
      style={{
        background: checked ? 'var(--color-error-500)' : '#fff',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--color-error-500)',
      }}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}
