import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/Dialog'
import type { ConfirmConfig } from '../../types'

interface Props {
  config: ConfirmConfig | null
  onClose: () => void
}

export function ConfirmModal({ config, onClose }: Props) {
  if (!config) return null

  function handleConfirm() {
    config!.onConfirm()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-[480px] p-0 gap-0 rounded-[16px] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-popup)' }}
      >
        <DialogHeader className="px-7 pt-6 pb-0">
          <DialogTitle
            className="text-[22px] font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}
          >
            {config.title}
          </DialogTitle>
        </DialogHeader>

        {/* Divider */}
        <div className="h-px mx-7 mt-4" style={{ background: 'var(--border-1)' }} />

        <p
          className="px-7 py-5 text-[15px] leading-relaxed font-medium"
          style={{ color: 'var(--fg-2)' }}
        >
          {config.body}
        </p>

        <div
          className="flex items-center justify-end gap-3 px-7 py-4"
          style={{ borderTop: '1px solid var(--border-1)' }}
        >
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          {config.isDanger
            ? <DangerButton onClick={handleConfirm}>{config.primaryLabel}</DangerButton>
            : <PrimaryButton onClick={handleConfirm}>{config.primaryLabel}</PrimaryButton>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Shared button atoms ────────────────────────────────────────────────────

export function PrimaryButton({ children, onClick, disabled, type = 'button' }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="h-[44px] min-w-[132px] px-6 rounded-[8px] text-white font-bold text-[14px] tracking-wide cursor-pointer transition-all duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: 'var(--bg-primary-btn)',
        boxShadow: 'var(--shadow-primary)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'var(--bg-primary-btn-hover)'
        el.style.boxShadow = 'var(--shadow-primary-hover)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'var(--bg-primary-btn)'
        el.style.boxShadow = 'var(--shadow-primary)'
      }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled, type = 'button' }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="h-[44px] min-w-[132px] px-6 rounded-[8px] font-bold text-[14px] cursor-pointer transition-all duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: '#fff',
        color: 'var(--color-secondary-700)',
        boxShadow: 'var(--shadow-inset-rim)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
    >
      {children}
    </button>
  )
}

export function DangerButton({ children, onClick, disabled }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-[44px] min-w-[132px] px-6 rounded-[8px] text-white font-bold text-[14px] cursor-pointer transition-all duration-[180ms] disabled:opacity-50"
      style={{
        background: 'var(--bg-danger-btn)',
        boxShadow: 'var(--shadow-danger)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-danger-btn-hover)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-danger-btn)'
      }}
    >
      {children}
    </button>
  )
}
