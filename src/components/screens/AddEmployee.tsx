import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ═══════════════════════════════════════════════════════════════════
   DATE PICKER
═══════════════════════════════════════════════════════════════════ */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

type DpMode = 'days' | 'months' | 'years'

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

function DatePickerCtl({ placeholder = 'Select Date' }: { placeholder?: string }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<DpMode>('days')
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState<Date | null>(null)
  const [pendingSel, setPendingSel] = useState<Date | null>(null)
  const ctlRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

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
    setOpen(true)
  }

  /* Close on outside click / resize; follow control on scroll, close when out of view */
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
    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleResize)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('scroll', handleScroll, true)
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
          {/* Head: prev / title / next */}
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

          {/* Days view */}
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

          {/* Months view */}
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

          {/* Years view */}
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

          {/* Footer */}
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

/* ═══════════════════════════════════════════════════════════════════
   SELECT CTL
═══════════════════════════════════════════════════════════════════ */
function SelectCtl({ placeholder, options, disabled = false }: { placeholder: string; options: string[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (disabled) {
    return (
      <div className="ctl ctl--select is-disabled">
        <span className="ctl__value">{placeholder}</span>
        <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    )
  }
  return (
    <div ref={ref} className={`ctl ctl--select${open ? ' is-open' : ''}`} onClick={() => setOpen(o => !o)}>
      <span className={`ctl__value${value ? ' has-value' : ''}`}>{value || placeholder}</span>
      <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      <div className="dropdown" onClick={e => e.stopPropagation()}>
        {options.map(o => (
          <div key={o} className={`dropdown__opt${value === o ? ' is-sel' : ''}`} onClick={() => { setValue(o); setOpen(false) }}>{o}</div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ADD EMPLOYEE WIZARD
═══════════════════════════════════════════════════════════════════ */
interface AddEmployeeProps { goTo: (screen: string) => void }

interface SbuRow { id: number }

export default function AddEmployee({ goTo }: AddEmployeeProps) {
  const [step, setStep] = useState(1)
  const TOTAL = 4
  const bodyRef = useRef<HTMLDivElement>(null)

  /* Step 1 */
  const [gender, setGender] = useState('male')
  const [citizenAddr, setCitizenAddr] = useState('')
  const [resAddr, setResAddr] = useState('')
  const [syncAddr, setSyncAddr] = useState(false)

  /* Step 2 — SBU */
  const [sbuRows, setSbuRows] = useState<SbuRow[]>([{ id: 1 }])

  /* Step 3 */
  const [salaryType, setSalaryType] = useState('monthly')
  const [overtime, setOvertime] = useState('yes')

  /* Step 4 */
  const [inviteNow, setInviteNow] = useState(false)
  const [onboarding, setOnboarding] = useState(false)

  /* Modals */
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => { if (syncAddr) setResAddr(citizenAddr) }, [syncAddr, citizenAddr])

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  function goStep(n: number) {
    setStep(Math.max(1, Math.min(TOTAL, n)))
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }

  function addSbuRow() { setSbuRows(prev => [...prev, { id: Date.now() }]) }
  function removeSbuRow(id: number) { setSbuRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev) }

  /* ── Stepper dot ── */
  function StepItem({ n }: { n: number }) {
    const done = n < step
    const current = n === step
    return (
      <div className={`step${done ? ' is-done is-clickable' : ''}${current ? ' is-current' : ''}`} onClick={() => done && goStep(n)}>
        <div className="step__dot">
          {done
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            : n}
        </div>
        {n < TOTAL && <div className="step__line"></div>}
        <div className="step__label">Step {n}</div>
        <div className="step__sub">{['Personal Data', 'Employment Data', 'Payroll', 'Invite Employee'][n - 1]}</div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <main className="app__main app__main--wizard">
      <div className="ae-shell">
        <section className="ae-panel">

          {/* Header + stepper */}
          <header className="ae-head">
            <button className="ae-crumb" onClick={() => goTo('employee')}>
              Employee List
            </button>
            <h1 className="ae-title">Add Employee</h1>
            <div className="ae-head__rule"></div>
            <div className="stepper">{[1,2,3,4].map(n => <StepItem key={n} n={n} />)}</div>
          </header>

          {/* Scrollable body */}
          <div className="ae-body" ref={bodyRef}>

            {/* ──────────── STEP 1: Personal Data ──────────── */}
            <div className={`ae-step-pane${step === 1 ? ' is-active' : ''}`}>
              <div className="ae-section">
                <div className="ae-section__title">Personal Data</div>
                <div className="ae-section__sub">Fill all employee personal basic information data</div>
              </div>
              <div className="ae-grid">
                <div className="fld span-2">
                  <label className="fld__label">Full name <span className="req">*</span></label>
                  <div className="ctl"><input type="text" placeholder="Full name" /></div>
                </div>
                <div className="fld span-2">
                  <label className="fld__label">Email <span className="req">*</span></label>
                  <div className="ctl"><input type="email" placeholder="Email" /></div>
                  <span className="fld__help">This email is used for log in</span>
                </div>
                <div className="fld">
                  <label className="fld__label">Phone number</label>
                  <div className="ctl"><input type="text" placeholder="Phone Number" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Additional phone number</label>
                  <div className="ctl"><input type="text" placeholder="Additional phone number" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Place of birth</label>
                  <div className="ctl"><input type="text" placeholder="Place of birth" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Birthdate <span className="req">*</span></label>
                  <DatePickerCtl placeholder="Select Date" />
                </div>
                <div className="fld">
                  <label className="fld__label">Gender</label>
                  <div className="radio-row">
                    <label className="radio"><input type="radio" name="gender" checked={gender === 'male'} onChange={() => setGender('male')} /><span className="radio__dot"></span>Male</label>
                    <label className="radio"><input type="radio" name="gender" checked={gender === 'female'} onChange={() => setGender('female')} /><span className="radio__dot"></span>Female</label>
                  </div>
                </div>
                <div className="fld">
                  <label className="fld__label">Marital status <span className="req">*</span></label>
                  <SelectCtl placeholder="Marital Status" options={['Single','Married','Divorced','Widowed']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Blood type</label>
                  <SelectCtl placeholder="Blood type" options={['A','B','AB','O']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Religion <span className="req">*</span></label>
                  <SelectCtl placeholder="Religion" options={['Islam','Kristen Protestan','Katolik','Hindu','Buddha','Konghucu']} />
                </div>
              </div>

              <div className="ae-divider"></div>

              <div className="ae-section">
                <div className="ae-section__title">Identify &amp; Address</div>
                <div className="ae-section__sub">Employee identify address information</div>
              </div>
              <div className="ae-grid">
                <div className="fld">
                  <label className="fld__label">NIK (NPWP 16 Digit)</label>
                  <div className="ctl"><input type="text" placeholder="0000 0000 0000 0000" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Passport number</label>
                  <div className="ctl"><input type="text" placeholder="Passport number" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Passport expiry date</label>
                  <SelectCtl placeholder="Select Date" options={[]} disabled />
                </div>
                <div className="fld">
                  <label className="fld__label">Postal code <span className="req">*</span></label>
                  <div className="ctl"><input type="text" placeholder="Postal code" /></div>
                </div>
                <div className="fld span-2">
                  <label className="fld__label">Citizen ID address</label>
                  <div className="ctl ctl--area">
                    <textarea placeholder="Citizen ID address" value={citizenAddr} onChange={e => setCitizenAddr(e.target.value)}></textarea>
                  </div>
                  <label className="mini-check">
                    <input type="checkbox" checked={syncAddr} onChange={e => setSyncAddr(e.target.checked)} />
                    <span className="mini-check__box"></span>Use as residential address
                  </label>
                </div>
                <div className="fld span-2">
                  <label className="fld__label">Residential Address</label>
                  <div className={`ctl ctl--area${syncAddr ? ' is-disabled' : ''}`}>
                    <textarea placeholder="Residential Address" value={resAddr} readOnly={syncAddr} onChange={e => !syncAddr && setResAddr(e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* ──────────── STEP 2: Employment Data ──────────── */}
            <div className={`ae-step-pane${step === 2 ? ' is-active' : ''}`}>
              <div className="ae-section">
                <div className="ae-section__title">Employment Data</div>
                <div className="ae-section__sub">Fill all employee data information related to company</div>
              </div>
              <div className="ae-grid">
                <div className="fld">
                  <label className="fld__label">Employee ID <span className="req">*</span></label>
                  <div className="ctl"><input type="text" placeholder="Employee ID" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Barcode</label>
                  <div className="ctl"><input type="text" placeholder="Barcode" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Group structure</label>
                  <SelectCtl placeholder="Select group" options={['SEVAKA Group','SEVAKA Tech','SEVAKA Retail']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Employment status <span className="req">*</span></label>
                  <SelectCtl placeholder="Select employment status" options={['Permanent','Contract (PKWT)','Probation','Internship']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Join date <span className="req">*</span></label>
                  <DatePickerCtl placeholder="Select date" />
                </div>
                <div></div>
                <div className="fld">
                  <label className="fld__label">Branch</label>
                  <SelectCtl placeholder="Select Branch" options={['Head Office — Jakarta','Branch — Surabaya','Branch — Bandung']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Organization <span className="req">*</span></label>
                  <SelectCtl placeholder="Select organization" options={['Engineering','Human Resources','Finance','Sales & Marketing']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Job position <span className="req">*</span></label>
                  <SelectCtl placeholder="Select job position" options={['Software Engineer','HR Specialist','Accountant','Account Executive']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Job Level <span className="req">*</span></label>
                  <SelectCtl placeholder="Select job level" options={['Staff','Supervisor','Manager','Director']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Grade</label>
                  <SelectCtl placeholder="Select grade" options={[]} disabled />
                </div>
                <div className="fld">
                  <label className="fld__label">Class</label>
                  <SelectCtl placeholder="Select class" options={[]} disabled />
                </div>
                <div className="fld">
                  <label className="fld__label">Schedule <span className="req">*</span></label>
                  <SelectCtl placeholder="Select schedule" options={[]} disabled />
                </div>
                <div></div>
                <div className="fld">
                  <label className="fld__label">Approval line</label>
                  <SelectCtl placeholder="Select approval line" options={['Default Approval Line','Engineering Line','Finance Line']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Manager</label>
                  <SelectCtl placeholder="Select manager" options={['Pepper Potts','Bruce Banner','Natasha Romanoff']} />
                </div>
                {/* SBU */}
                <div className="ae-sbu">
                  <label className="fld__label ae-sbu__label">SBU</label>
                  <div className="sbu-list">
                    {sbuRows.map(row => (
                      <div key={row.id} className="sbu-row">
                        <SelectCtl placeholder="Select SBU group" options={['SBU Group A','SBU Group B']} />
                        <div className="sbu-cell">
                          <SelectCtl placeholder="Select SBU" options={['SBU 01','SBU 02','SBU 03']} />
                          <button className="sbu-remove" type="button" onClick={() => removeSbuRow(row.id)} aria-label="Remove SBU">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="ae-addother" type="button" onClick={addSbuRow}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                    Add Other
                  </button>
                </div>
              </div>
            </div>

            {/* ──────────── STEP 3: Payroll ──────────── */}
            <div className={`ae-step-pane${step === 3 ? ' is-active' : ''}`}>
              <div className="ae-section">
                <div className="ae-section__title">Salary</div>
                <div className="ae-section__sub">Input employee salary info</div>
              </div>
              <div className="ae-grid">
                <div className="fld">
                  <label className="fld__label">Basic Salary <span className="req">*</span></label>
                  <div className="ctl"><span className="ctl__prefix">RP</span><input type="text" placeholder="Input nominal" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Salary type</label>
                  <div className="radio-row">
                    <label className="radio"><input type="radio" name="salarytype" checked={salaryType === 'monthly'} onChange={() => setSalaryType('monthly')} /><span className="radio__dot"></span>Monthly</label>
                    <label className="radio"><input type="radio" name="salarytype" checked={salaryType === 'daily'} onChange={() => setSalaryType('daily')} /><span className="radio__dot"></span>Daily</label>
                  </div>
                </div>
                <div className="fld">
                  <div className="fld__labelrow">
                    <label className="fld__label">Payment Schedule</label>
                    <span className="fld__link">Settings</span>
                  </div>
                  <SelectCtl placeholder="Select schedule" options={['Monthly — End of month','Monthly — 25th','Bi-weekly']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Prorate Setting</label>
                  <SelectCtl placeholder="Select prorate setting" options={[]} disabled />
                </div>
                <div className="fld span-2">
                  <label className="fld__label">Allowed for overtime</label>
                  <div className="radio-row">
                    <label className="radio"><input type="radio" name="overtime" checked={overtime === 'yes'} onChange={() => setOvertime('yes')} /><span className="radio__dot"></span>Yes</label>
                    <label className="radio"><input type="radio" name="overtime" checked={overtime === 'no'} onChange={() => setOvertime('no')} /><span className="radio__dot"></span>No</label>
                  </div>
                </div>
                <div className="fld span-2">
                  <label className="fld__label">Bank name</label>
                  <SelectCtl placeholder="Select bank" options={['Bank BCA','Bank Mandiri','Bank BNI','Bank BRI']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Account number</label>
                  <div className="ctl"><input type="text" placeholder="Account number" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">Account holder name</label>
                  <div className="ctl"><input type="text" placeholder="Account holder name" /></div>
                </div>
              </div>

              <div className="ae-divider"></div>
              <div className="ae-section">
                <div className="ae-section__title">Tax Configuration</div>
                <div className="ae-section__sub">Select the tax calculation type relevant to your company</div>
              </div>
              <div className="ae-grid">
                <div className="fld">
                  <label className="fld__label">NPWP</label>
                  <div className="ctl"><input type="text" placeholder="00.000.000.0-000.000" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">PTKP status <span className="req">*</span></label>
                  <SelectCtl placeholder="Select PTKP status" options={['TK/0','K/0','K/1','K/2','K/3']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Tax method</label>
                  <SelectCtl placeholder="Gross" options={['Gross','Gross Up','Net']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Tax salary <span className="req">*</span></label>
                  <SelectCtl placeholder="Taxable" options={['Taxable','Non-taxable']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Taxable date</label>
                  <DatePickerCtl placeholder="Select date" />
                </div>
                <div className="fld">
                  <label className="fld__label">Employment tax status <span className="req">*</span></label>
                  <SelectCtl placeholder="Permanent" options={['Permanent','Non-permanent']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Beginning netto</label>
                  <div className="ctl"><span className="ctl__prefix">RP</span><input type="text" placeholder="Input nominal" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">PPH21 paid</label>
                  <div className="ctl"><span className="ctl__prefix">RP</span><input type="text" placeholder="Input nominal" /></div>
                </div>
              </div>

              <div className="ae-divider"></div>
              <div className="ae-section">
                <div className="ae-section__title">BPJS Configuration</div>
                <div className="ae-section__sub">Employee BPJS payment arrangements</div>
              </div>
              <div className="ae-grid">
                <div className="fld">
                  <label className="fld__label">BPJS Ketenagakerjaan number</label>
                  <div className="ctl"><input type="text" placeholder="0000000000" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">NPP BPJS Ketenagakerjaan</label>
                  <SelectCtl placeholder="Select NPP BPJS Ketenagakerjaan" options={['NPP 0001','NPP 0002']} />
                </div>
                <div className="fld">
                  <label className="fld__label">BPJS Ketenagakerjaan date</label>
                  <DatePickerCtl placeholder="Select date" />
                </div>
                <div></div>
                <div className="fld">
                  <label className="fld__label">BPJS Kesehatan number</label>
                  <div className="ctl"><input type="text" placeholder="0000000000000" /></div>
                </div>
                <div className="fld">
                  <label className="fld__label">BPJS Kesehatan family</label>
                  <SelectCtl placeholder="Select BPJS Kesehatan family" options={['0 — Self only','1 — Spouse','2 — Spouse + 1 child','3 — Spouse + 2 children']} />
                </div>
                <div className="fld">
                  <label className="fld__label">BPJS Kesehatan date</label>
                  <DatePickerCtl placeholder="Select date" />
                </div>
                <div className="fld">
                  <label className="fld__label">BPJS Kesehatan cost</label>
                  <SelectCtl placeholder="Select BPJS Kesehatan cost" options={['Borne by company','Borne by employee']} />
                </div>
                <div className="fld">
                  <label className="fld__label">JHT cost</label>
                  <SelectCtl placeholder="Select JHT cost" options={['Borne by company','Borne by employee']} />
                </div>
                <div></div>
                <div className="fld">
                  <label className="fld__label">Jaminan pensiun cost</label>
                  <SelectCtl placeholder="Select jaminan pensiun cost" options={['Borne by company','Borne by employee']} />
                </div>
                <div className="fld">
                  <label className="fld__label">Jaminan pensiun date</label>
                  <DatePickerCtl placeholder="Select date" />
                </div>
              </div>
            </div>

            {/* ──────────── STEP 4: Invite Employee ──────────── */}
            <div className={`ae-step-pane${step === 4 ? ' is-active' : ''}`}>
              <div className="invite">
                <div className="invite__art">
                  <svg viewBox="0 0 240 240" width="240" height="240" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="120" cy="120" r="116" fill="#5fd6df"/>
                    <clipPath id="inv-clip"><circle cx="120" cy="120" r="116"/></clipPath>
                    <g clipPath="url(#inv-clip)">
                      <path d="M60 240 q0 -64 60 -78 q60 14 60 78 z" fill="#1f3a5f"/>
                      <path d="M104 158 L120 240 L136 158 L120 150 Z" fill="#ffffff"/>
                      <path d="M120 158 l-9 12 9 46 9 -46 z" fill="#e8552d"/>
                      <path d="M104 156 l16 14 -10 8 -12 -16 z" fill="#f3f5f7"/>
                      <path d="M136 156 l-16 14 10 8 12 -16 z" fill="#f3f5f7"/>
                      <rect x="108" y="132" width="24" height="30" rx="10" fill="#f0c39a"/>
                      <ellipse cx="120" cy="104" rx="34" ry="38" fill="#f7d0a8"/>
                      <path d="M86 100 q-4 -44 34 -48 q40 2 36 46 q-6 -18 -16 -22 q4 10 -2 16 q-18 -16 -44 -6 q-6 4 -8 14z" fill="#5a3825"/>
                    </g>
                  </svg>
                  <span className="badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                </div>
                <div className="invite__title">Invite the employee to access SEVAKA</div>
                <div className="invite__sub">Wrap things up by sending an invite so they can get started immediately.</div>
                <div className="invite__opts">
                  <label className="invite-opt">
                    <input type="checkbox" checked={inviteNow} onChange={e => setInviteNow(e.target.checked)} />
                    <span className="invite-opt__box"></span>
                    <span>
                      <span className="invite-opt__title">Invite to SEVAKA now</span>
                      <span className="invite-opt__desc">We'll send an email so they can log in right away.</span>
                    </span>
                  </label>
                  <label className="invite-opt">
                    <input type="checkbox" checked={onboarding} onChange={e => setOnboarding(e.target.checked)} />
                    <span className="invite-opt__box"></span>
                    <span>
                      <span className="invite-opt__title">Start onboarding journey</span>
                      <span className="invite-opt__desc">Help them settle in with our product familiarization guide.</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </div>{/* end ae-body */}

          {/* Sticky footer */}
          <footer className="ae-foot">
            {step === 1 && (
              <>
                <button className="btn btn--secondary" type="button" onClick={() => goTo('employee')}>Cancel</button>
                <button className="btn btn--primary" type="button" onClick={() => goStep(2)}>Next</button>
              </>
            )}
            {(step === 2 || step === 3) && (
              <>
                <button className="btn btn--secondary" type="button" onClick={() => goStep(step - 1)}>Back</button>
                <button className="btn btn--primary" type="button" onClick={() => goStep(step + 1)}>Next</button>
              </>
            )}
            {step === 4 && (
              <>
                <button className="btn btn--secondary" type="button" onClick={() => setConfirmOpen(true)}>Submit &amp; Add Another</button>
                <button className="btn btn--primary" type="button" onClick={() => setConfirmOpen(true)}>Submit</button>
              </>
            )}
          </footer>

        </section>
      </div>

      {/* Confirm modal */}
      <div className={`modal-scrim${confirmOpen ? ' is-open' : ''}`} onClick={() => setConfirmOpen(false)}>
        <div className="modal modal--ask" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal__close" type="button" onClick={() => setConfirmOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="modal__title">Confirm submission?</h2>
          <div className="modal__rule"></div>
          <p className="modal__body">Are you sure you want to submit? Please make sure all employee information is correct before proceeding.</p>
          <div className="modal__foot">
            <button className="btn btn--secondary" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={() => { setConfirmOpen(false); setSuccessOpen(true) }}>Submit</button>
          </div>
        </div>
      </div>

      {/* Success modal */}
      <div className={`modal-scrim${successOpen ? ' is-open' : ''}`} onClick={() => setSuccessOpen(false)}>
        <div className="modal modal--success" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal__close" type="button" onClick={() => setSuccessOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div className="success__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h2 className="success__title">Employee Added</h2>
          <p className="success__desc">The new employee has been added to your directory. We'll send invitation and onboarding emails if you enabled them.</p>
          <button className="btn btn--primary success__cta" type="button" onClick={() => { setSuccessOpen(false); goTo('employee') }}>
            Go to Employee Directory
          </button>
          <button className="success__link" type="button" onClick={() => { setSuccessOpen(false); setStep(1) }}>
            Add another employee
          </button>
        </div>
      </div>
    </main>
  )
}
