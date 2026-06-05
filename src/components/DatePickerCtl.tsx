import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

type DpMode = 'days' | 'months' | 'years'

const DP_OPEN_EVENT = 'sevaka:dp-open'

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  return `${dd} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
function sameDay(a: Date | null, b: Date | null): boolean {
  return !!a && !!b &&
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
}

export default function DatePickerCtl({ placeholder = 'Select Date' }: { placeholder?: string }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<DpMode>('days')
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState<Date | null>(null)
  const [pendingSel, setPendingSel] = useState<Date | null>(null)
  const ctlRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const instanceId = useRef(Symbol())

  function openDP() {
    if (!ctlRef.current) return
    const r = ctlRef.current.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.left, window.innerWidth - 316))
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow < 360 && r.top > 360 ? r.top - 360 : r.bottom + 6
    setPos({ top, left })
    setPendingSel(selected)
    setViewDate(selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })())
    setMode('days')
    document.dispatchEvent(new CustomEvent(DP_OPEN_EVENT, { detail: instanceId.current }))
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      if (ctlRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const handleResize = () => setOpen(false)
    const handleScroll = () => {
      if (!ctlRef.current) { setOpen(false); return }
      const r = ctlRef.current.getBoundingClientRect()
      const bodyEl = document.querySelector('.ae-body')
      if (bodyEl) {
        const br = bodyEl.getBoundingClientRect()
        if (r.bottom < br.top || r.top > br.bottom) { setOpen(false); return }
      } else if (r.bottom < 0 || r.top > window.innerHeight) {
        setOpen(false); return
      }
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 316))
      const spaceBelow = window.innerHeight - r.bottom
      const top = spaceBelow < 360 && r.top > 360 ? r.top - 360 : r.bottom + 6
      setPos({ top, left })
    }
    const handleOtherDpOpen = (e: Event) => {
      if ((e as CustomEvent).detail !== instanceId.current) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleResize)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener(DP_OPEN_EVENT, handleOtherDpOpen)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener(DP_OPEN_EVENT, handleOtherDpOpen)
    }
  }, [open])

  function step(dir: number) {
    const v = new Date(viewDate)
    if (mode === 'days') v.setMonth(v.getMonth() + dir)
    else if (mode === 'months') v.setFullYear(v.getFullYear() + dir)
    else v.setFullYear(v.getFullYear() + dir * 12)
    setViewDate(new Date(v.getFullYear(), v.getMonth(), 1))
  }

  function applyDate() {
    if (pendingSel) setSelected(pendingSel)
    setOpen(false)
  }

  const today = new Date()
  const y = viewDate.getFullYear()
  const m = viewDate.getMonth()
  const yStart = y - (y % 12)

  function buildDayGrid(): Date[] {
    const first = new Date(y, m, 1)
    const startIdx = (first.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - startIdx + i))
  }

  return (
    <>
      <div
        ref={ctlRef}
        className="ctl ctl--date"
        onMouseDown={e => e.stopPropagation()}
        onClick={() => open ? setOpen(false) : openDP()}
      >
        <input
          type="text"
          readOnly
          placeholder={placeholder}
          value={selected ? fmtDate(selected) : ''}
          style={{ cursor: 'pointer' }}
        />
        <svg className="ctl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      </div>

      {open && createPortal(
        <div
          className={`dp is-${mode}`}
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="dp__head">
            <button className="dp__nav" type="button" onClick={() => step(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              className="dp__title"
              type="button"
              onClick={() => setMode(m2 => m2 === 'days' ? 'months' : 'years')}
            >
              {mode === 'days'
                ? `${MONTHS[m]} ${y}`
                : mode === 'months'
                  ? y
                  : `${yStart} – ${yStart + 11}`}
            </button>
            <button className="dp__nav" type="button" onClick={() => step(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="dp__view dp__view--days">
            <div className="dp__weekdays">
              {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
            </div>
            <div className="dp__grid">
              {buildDayGrid().map((d, i) => {
                const out = d.getMonth() !== m
                const isTod = sameDay(d, today)
                const isSel = sameDay(d, pendingSel)
                return (
                  <button
                    key={i}
                    type="button"
                    className={['dp__day', out && 'is-out', isTod && 'is-today', isSel && 'is-sel'].filter(Boolean).join(' ')}
                    onClick={() => {
                      const sel = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                      setPendingSel(sel)
                      setViewDate(new Date(sel.getFullYear(), sel.getMonth(), 1))
                    }}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="dp__view dp__view--months">
            <div className="dp__cells">
              {MONTHS_SHORT.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  className={['dp__cell', pendingSel && pendingSel.getFullYear() === y && pendingSel.getMonth() === idx && 'is-sel'].filter(Boolean).join(' ')}
                  onClick={() => { setViewDate(new Date(y, idx, 1)); setMode('days') }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="dp__view dp__view--years">
            <div className="dp__cells">
              {Array.from({ length: 12 }, (_, i) => yStart + i).map(yr => (
                <button
                  key={yr}
                  type="button"
                  className={['dp__cell', pendingSel && pendingSel.getFullYear() === yr && 'is-sel'].filter(Boolean).join(' ')}
                  onClick={() => { setViewDate(new Date(yr, m, 1)); setMode('months') }}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="dp__foot">
            <span className={`dp__value${pendingSel ? '' : ' is-empty'}`}>
              {pendingSel ? fmtDate(pendingSel) : 'DD Mon YYYY'}
            </span>
            <button className="dp__set" type="button" onClick={applyDate}>Set Date</button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
