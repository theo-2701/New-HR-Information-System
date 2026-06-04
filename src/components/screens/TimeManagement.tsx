import { useEffect, useState } from 'react'
import React from 'react'
import { useT } from '@/i18n'

const CALENDAR_EVENTS: Record<number, string[]> = {
  4: ['leave'], 5: ['leave'],
  11: ['pending'],
  13: ['leave', 'pending'],
  19: ['holiday'], 22: ['holiday'],
  28: ['leave'],
}

const TODAY_DAY = 21
const CURRENT_MONTH_IDX = 4 // May

function buildCells() {
  const cells: { day: number; muted?: boolean }[] = []
  ;[27, 28, 29, 30].forEach(d => cells.push({ day: d, muted: true }))
  for (let d = 1; d <= 31; d++) cells.push({ day: d })
  return cells
}

export default function TimeManagement() {
  const t = useT()
  const tm = t.time
  const [clock, setClock] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setClock(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  const cells = buildCells()
  const currentMonthName = `${tm.months[CURRENT_MONTH_IDX]} 2026`

  return (
    <div className="app__scroll" data-screen="time">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>

        {/* Left: clock-in + leave balance */}
        <div className="col">
          <div className="clockin">
            <span style={{ font: '700 11px/1 var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--color-primary-200)' }}>
              {tm.todayLabel} · Thursday
            </span>
            <div className="clockin__time" id="liveClock">{clock}</div>
            <div className="clockin__date">21 {tm.months[CURRENT_MONTH_IDX]} 2026 · {tm.office}</div>
            <div className="clockin__row">
              <button className="btn" style={{ background: 'white', color: 'var(--color-secondary-700)', boxShadow: 'none', flex: 1, justifyContent: 'center' }}>
                <i data-lucide="log-in"></i>{tm.clockIn}
              </button>
              <button className="btn btn--light btn--icon" aria-label={tm.moreOptions}>
                <i data-lucide="more-horizontal"></i>
              </button>
            </div>
            <div style={{ font: '500 12px/1.4 var(--font-body)', color: 'var(--color-primary-200)', borderTop: '1px solid rgba(255,255,255,.16)', paddingTop: '12px' }}>
              {tm.scheduledHours} 09:00 – 18:00. {tm.clickToRecord} <b style={{ color: 'white' }}>{tm.clockIn}</b> {tm.toRecord}
            </div>
          </div>

          <div className="card">
            <div className="card__head"><h3 className="card__title">{tm.leaveBalance}</h3></div>
            <div className="stack-3">
              <LeaveBar label={tm.annualLeave}      used={9}  total={12} suffix={t.common.days} barStyle={{}} />
              <LeaveBar label={tm.sickLeave}        used={10} total={12} suffix={t.common.days} barStyle={{ background: 'linear-gradient(90deg,#fde68a,#f59e0b)' }} />
              <LeaveBar label={tm.bereavementLeave} used={3}  total={3}  suffix={t.common.days} barStyle={{ background: 'linear-gradient(90deg,#34d399,#1f7f5c)' }} />
            </div>
            <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
              <i data-lucide="calendar-plus"></i>{tm.requestLeave}
            </button>
          </div>
        </div>

        {/* Right: calendar */}
        <div className="card">
          <div className="card__head">
            <h3 className="card__title">{currentMonthName}</h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button className="icon-btn" aria-label={tm.prevMonth}><i data-lucide="chevron-left"></i></button>
              <button className="btn btn--secondary" style={{ height: '32px' }}>{t.common.today}</button>
              <button className="icon-btn" aria-label={tm.nextMonth}><i data-lucide="chevron-right"></i></button>
            </div>
          </div>

          <div className="calendar">
            <div className="calendar__grid">
              {tm.weekdays.map(d => (
                <div key={d} className="calendar__head">{d}</div>
              ))}
            </div>
            <div className="calendar__grid">
              {cells.map((c, i) => {
                if (c.muted) return <div key={i} className="calendar__day calendar__day--muted">{c.day}</div>
                const isToday = c.day === TODAY_DAY
                const ev = CALENDAR_EVENTS[c.day] || []
                return (
                  <div key={i} className={`calendar__day${isToday ? ' calendar__day--today' : ''}`}>
                    <span>{c.day}</span>
                    <div className="dots">
                      {ev.map((type, j) => (
                        <span key={j} className={`dot${type === 'pending' ? ' amber' : type === 'holiday' ? ' green' : ''}`}></span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', font: '500 12px/1 var(--font-body)', color: 'var(--fg-3)', paddingTop: '8px', borderTop: '1px solid var(--border-1)' }}>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', verticalAlign: 'middle', marginRight: '4px' }}></span>{tm.approvedLeave}</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', verticalAlign: 'middle', marginRight: '4px' }}></span>{tm.pendingRequest}</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', verticalAlign: 'middle', marginRight: '4px' }}></span>{tm.holiday}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface LeaveBarProps {
  label: string
  used: number
  total: number
  suffix: string
  barStyle: React.CSSProperties
}

function LeaveBar({ label, used, total, suffix, barStyle }: LeaveBarProps) {
  const pct = Math.round((used / total) * 100)
  return (
    <div>
      <div className="between" style={{ font: '500 12px/1 var(--font-body)', color: 'var(--fg-3)', marginBottom: '6px' }}>
        <span>{label}</span><span>{used} / {total} {suffix}</span>
      </div>
      <div className="bar"><span style={{ width: `${pct}%`, ...barStyle }}></span></div>
    </div>
  )
}
