import { useEffect, useState } from 'react'

const TABS = ['Data Personal', 'Kepegawaian', 'Identitas & Alamat', 'Info Penggajian', 'Bank', 'BPJS', 'Pajak']

export default function Profile() {
  const [tab, setTab] = useState('Data Personal')

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
            <span className="chip chip--ok">Aktif</span>
          </div>

          <div className="stack-3" style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px' }}>
            {[
              ['Employee ID', 'EMP-2041'],
              ['Email', 'tessa.h@perusahaan.id'],
              ['Telepon', '+62 812‑4471‑0099'],
              ['Manajer', 'R. Wirajaya'],
              ['Bergabung', '12 Jan 2023'],
            ].map(([k, v]) => (
              <div key={k} className="between" style={{ font: '500 12px/1.4 var(--font-body)' }}>
                <span className="muted">{k}</span>
                <span style={k === 'Email' ? { fontSize: '11px' } : {}}>{v}</span>
              </div>
            ))}
          </div>

          <button className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <i data-lucide="pencil"></i>Edit Profil
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
            <Field label="Nama Lengkap"      value="Tessa Hartanto" />
            <Field label="Nama Panggilan"    value="Tessa" />
            <Field label="Tanggal Lahir"     value="04 / 08 / 1995" />
            <Field label="Jenis Kelamin"     value="Perempuan" />
            <Field label="Status Pernikahan" value="Belum Menikah" />
            <Field label="Agama"             value="Islam" />
            <Field label="Email"             value="tessa.h@perusahaan.id" type="email" help="Your email address is your identity on SEVAKA." />
            <Field label="No. Telepon"       value="+62 812-4471-0099" type="tel" />
            <Field label="Alamat Tinggal"    value="Jl. Gatot Subroto Kav. 27, Jakarta Selatan 12950" span={2} />
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-1)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn--secondary">Batal</button>
            <button className="btn btn--primary">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, type = 'text', help, span }) {
  return (
    <div className="field" style={span ? { gridColumn: `span ${span}` } : {}}>
      <label className="field__label">{label}</label>
      <input className="field__input" defaultValue={value} type={type} />
      {help && <span className="field__help">{help}</span>}
    </div>
  )
}
