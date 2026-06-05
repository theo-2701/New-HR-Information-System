import { useState } from 'react'
import { Dialog, DialogContent } from '../shared/Dialog'
import { Search, Info } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from './ConfirmModal'

interface Props {
  open: boolean
  employeeIndex: number | null
  onClose: () => void
  onSave: (bonus: string) => void
}

export function EditComponentModal({ open, onClose, onSave }: Props) {
  const [bonus, setBonus] = useState('0')
  const [search, setSearch] = useState('')

  function handleSave() {
    onSave(bonus)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[640px] p-0 gap-0 rounded-[16px] overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100vh - 64px)', boxShadow: 'var(--shadow-popup)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <h2 className="text-[28px] font-bold m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
            Edit Component
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-[18px]">
          {/* Info note */}
          <div className="flex items-center gap-3 px-[18px] py-4 rounded-[8px]" style={{ background: 'var(--color-secondary-50)' }}>
            <span
              className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-secondary-500)' }}
            >
              <Info size={15} color="white" />
            </span>
            <span className="text-[15px] font-medium leading-snug" style={{ color: 'var(--fg-2)' }}>
              The payroll component updated here only applies to the ongoing payroll process
            </span>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-3 h-[52px] rounded-[8px] px-4 transition-all duration-[180ms]"
            style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)' }}
          >
            <input
              className="flex-1 min-w-0 border-none bg-transparent outline-none text-[16px] font-medium"
              style={{ color: 'var(--fg-1)' }}
              placeholder="Search here"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={21} style={{ color: 'var(--fg-4)' }} />
          </div>

          {/* Bonus field */}
          <MoneyField label="Bonus" value={bonus} onChange={setBonus} />

          <button
            type="button"
            className="self-start font-bold text-[17px] bg-transparent border-none p-0 cursor-pointer transition-colors"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-secondary-700)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-1)' }}
          >
            + Additional Earnings
          </button>

          {/* Overtime (disabled) */}
          <MoneyField label="Overtime" disabled />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-[18px]" style={{ borderTop: '1px solid var(--border-1)' }}>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MoneyField({ label, value = '', onChange, disabled = false }: {
  label: string
  value?: string
  onChange?: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <span className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>
        {label}
      </span>
      <div
        className="flex items-stretch h-[52px] rounded-[8px] overflow-hidden transition-all duration-[180ms]"
        style={{
          background: disabled ? 'var(--color-vapor)' : 'var(--color-cloud)',
          boxShadow: disabled ? 'none' : 'var(--shadow-inset-rim)',
        }}
      >
        <span
          className="flex items-center justify-center w-[52px] flex-shrink-0 font-bold text-[13px] tracking-wider"
          style={{
            background: disabled ? '#e7ebf0' : 'var(--color-vapor)',
            borderRight: '1px solid var(--border-1)',
            color: disabled ? 'var(--fg-4)' : 'var(--fg-2)',
          }}
        >
          RP
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder="0"
          className="flex-1 min-w-0 border-none bg-transparent outline-none px-4 text-[16px] font-medium disabled:cursor-not-allowed"
          style={{ color: 'var(--fg-1)' }}
        />
      </div>
    </div>
  )
}
