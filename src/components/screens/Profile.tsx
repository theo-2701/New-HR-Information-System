import { useEffect, useState } from 'react'
import { useT } from '@/i18n'

export default function Profile() {
  const t = useT()
  const p = t.profile
  const [tab, setTab] = useState(p.tabs.personal)

  const TABS = [
    p.tabs.personal, p.tabs.employment, p.tabs.identity,
    p.tabs.payroll, p.tabs.bank, p.tabs.bpjs, p.tabs.tax,
  ]

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  return (
    <div className="app__scroll" data-screen="profile">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>

        {/* Left summary card */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <div className="avatar avatar--xl">TH</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: '700 18px/1.2 var(--font-display)', color: 'var(--fg-1)' }}>Tessa Hartanto</div>
              <div style={{ font: '500 12px/1.4 var(--font-body)', color: 'var(--fg-3)' }}>Senior Designer · People Operations</div>
            </div>
            <span className="chip chip--ok">{p.values.active}</span>
          </div>

          <div className="stack-3" style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px' }}>
            {[
              [p.fields.employeeId, 'EMP-2041'],
              [p.fields.email,      'tessa.h@sevaka.id'],
              [p.fields.phone,      '+62 812‑4471‑0099'],
              [p.fields.manager,    'R. Wirajaya'],
              [p.fields.joinDate,   '12 Jan 2023'],
            ].map(([k, v]) => (
              <div key={k} className="between" style={{ font: '500 12px/1.4 var(--font-body)' }}>
                <span className="muted">{k}</span>
                <span style={k === p.fields.email ? { fontSize: '11px' } : {}}>{v}</span>
              </div>
            ))}
          </div>

          <button className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <i data-lucide="pencil"></i>{p.editProfile}
          </button>
        </div>

        {/* Right tabbed form */}
        <div className="card" style={{ padding: 0 }}>
          <div className="tabs" style={{ padding: '0 16px' }}>
            {TABS.map(t => (
              <button key={t} className={`tabs__tab${tab === t ? ' is-on' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <Field label={p.fields.fullName}      value="Tessa Hartanto" />
            <Field label={p.fields.nickname}      value="Tessa" />
            <Field label={p.fields.birthDate}     value="04 / 08 / 1995" />
            <Field label={p.fields.gender}        value={p.values.female} />
            <Field label={p.fields.maritalStatus} value={p.values.single} />
            <Field label={p.fields.religion}      value={p.values.islam} />
            <Field label={p.fields.email}         value="tessa.h@sevaka.id" type="email" help={p.emailHelp} />
            <Field label={p.fields.phone}         value="+62 812-4471-0099" type="tel" />
            <Field label={p.fields.address}       value="Jl. Gatot Subroto Kav. 27, South Jakarta 12950" span={2} />
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-1)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn--secondary">{p.cancel}</button>
            <button className="btn btn--primary">{p.saveChanges}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  type?: string
  help?: string
  span?: number
}

function Field({ label, value, type = 'text', help, span }: FieldProps) {
  return (
    <div className="field" style={span ? { gridColumn: `span ${span}` } : {}}>
      <label className="field__label">{label}</label>
      <input className="field__input" defaultValue={value} type={type} />
      {help && <span className="field__help">{help}</span>}
    </div>
  )
}
