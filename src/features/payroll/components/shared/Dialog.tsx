/**
 * Lightweight, dependency-free Dialog primitive.
 *
 * Drop-in replacement for the ShadCN `@/components/ui/dialog` API
 * (Dialog / DialogContent / DialogHeader / DialogTitle) so the payroll
 * feature works without installing `@radix-ui/react-dialog`.
 *
 * Behaviour: renders into a portal on document.body, shows a frosted scrim,
 * closes on overlay click + Escape, and locks body scroll while open.
 * A close (×) button is shown in the top-right of the content by default
 * (pass `showClose={false}` to hide it).
 */

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const DialogContext = createContext<(open: boolean) => void>(() => {})

export function Dialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <DialogContext.Provider value={onOpenChange ?? (() => {})}>
      {children}
    </DialogContext.Provider>,
    document.body,
  )
}

export function DialogContent({
  children,
  className = '',
  style,
  showClose = true,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  showClose?: boolean
}) {
  const onOpenChange = useContext(DialogContext)

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'var(--bg-scrim)', backdropFilter: 'var(--blur-scrim)' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white ${className}`}
        style={{ boxShadow: 'var(--shadow-popup)', ...style }}
        onMouseDown={e => e.stopPropagation()}
      >
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-[8px] border-none bg-transparent transition-colors"
            style={{ color: 'var(--fg-3)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-mist)'
              e.currentTarget.style.color = 'var(--color-secondary-700)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--fg-3)'
            }}
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`flex flex-col ${className}`}>{children}</div>
}

export function DialogTitle({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <h2 className={className} style={style}>
      {children}
    </h2>
  )
}
