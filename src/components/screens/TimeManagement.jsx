import { useEffect, useState } from 'react'

const CALENDAR_EVENTS = {
  4: ['leave'], 5: ['leave'],
  11: ['pending'],
  13: ['leave', 'pending'],
  19: ['holiday'], 22: ['holiday'],
  28: ['leave'],
}

const TODAY = 21

function buildCells() {
  const cells = []
  // Mon 27 Apr – Thu 30 Apr leading days before May 1 (Friday)
  ;[27, 28, 29, 30].forEach(d => cells.push({ day: d, muted: true }))
  for (let d = 1; d <= 31; d++) cells.push({ day: d })
  return cells
}

export default function TimeManagement() {
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

  return (
    <div className="app__scroll" data-screen="time">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>

        {/* Left: clock-in + leave balance */}
        <div className="col">
          <div className="clockin">
            <span style={{ font: '700 11px/1 var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--color-primary-200)' }}>
              Hari Ini · Kamis
            </span>
            <div className="clockin__time" id="liveClock">{clock}</div>
            <div className="clockin__date">21 Mei 2026 · Kantor Jakarta</div>
            <div className="clockin__row">
              <button className="btn" style={{ background: 'white', color: 'var(--color-secondary-700)', boxShadow: 'none', flex: 1, justifyContent: 'center' }}>
                <i data-lucide="log-in"></i>Clock In
              </button>
              <button className="btn btn--light btn--icon" aria-label="Opsi lain">
                <i data-lucide="more-horizontal"></i>
              </button>
            </div>
            <div style={{ font: '500 12px/1.4 var(--font-body)', color: 'var(--color-primary-200)', borderTop: '1px solid rgba(255,255,255,.16)', paddingTop: '12px' }}>
              Anda dijadwalkan masuk 09:00 – 18:00. Klik <b style={{ color: 'white' }}>Clock In</b> untuk mencatat kehadiran.
            </div>
          </div>

          <div className="card">
            <div className="card__head"><h3 className="card__title">Saldo Cuti Saya</h3></div>
            <div className="stack-3">
              <LeaveBar label="Tahunan" used={9}  total={12} barStyle={{}} />
              <LeaveBar label="Sakit"   used={10} total={12} barStyle={{ background: 'linear-gradient(90deg,#fde68a,#f59e0b)' }} />
              <LeaveBar label="Duka Cita" used={3} total={3} barStyle={{ background: 'linear-gradient(90deg,#34d399,#1f7f5c)' }} />
            </div>
            <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
              <i data-lucide="calendar-plus"></i>Ajukan Cuti
            </button>
          </div>
        </div>

        {/* Right: calendar */}
        <div className="card">
          <div className="card__head">
            <h3 className="card__title">Mei 2026</h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button className="icon-btn" aria-label="Bulan sebelumnya"><i data-lucide="chevron-left"></i></button>
              <button className="btn btn--secondary" style={{ height: '32px' }}>Hari ini</button>
              <button className="icon-btn" aria-label="Bulan berikutnya"><i data-lucide="chevron-right"></i></button>
            </div>
          </div>

          <div className="calendar">
            <div className="calendar__grid">
              {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
                <div key={d} className="calendar__head">{d}</div>
              ))}
            </div>
            <div className="calendar__grid">
              {cells.map((c, i) => {
                if (c.muted) return <div key={i} className="calendar__day calendar__day--muted">{c.day}</div>
                const isToday = c.day === TODAY
                const ev = CALENDAR_EVENTS[c.day] || []
                return (
                  <div key={i} className={`calendar__day${isToday ? ' calendar__day--today' : ''}`}>
                    <span>{c.day}</span>
                    <div className="dots">
                      {ev.map((t, j) => (
                        <span key={j} className={`dot${t === 'pending' ? ' amber' : t === 'holiday' ? ' green' : ''}`}></span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', font: '500 12px/1 var(--font-body)', color: 'var(--fg-3)', paddingTop: '8px', borderTop: '1px solid var(--border-1)' }}>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', verticalAlign: 'middle', marginRight: '4px' }}></span>Cuti disetujui</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', verticalAlign: 'middle', marginRight: '4px' }}></span>Permintaan tertunda</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', verticalAlign: 'middle', marginRight: '4px' }}></span>Hari libur</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaveBar({ label, used, total, barStyle }) {
  const pct = Math.round((used / total) * 100)
  return (
    <div>
      <div className="between" style={{ font: '500 12px/1 var(--font-body)', color: 'var(--fg-3)', marginBottom: '6px' }}>
        <span>{label}</span><span>{used} / {total} hari</span>
      </div>
      <div className="bar"><span style={{ width: `${pct}%`, ...barStyle }}></span></div>
    </div>
  )
}
