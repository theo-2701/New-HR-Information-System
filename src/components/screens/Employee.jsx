import { useEffect, useState } from 'react'

const TABS = [
  'Employee List',
  'Organization Structure',
  'Employee Transfer',
  'Mass Resignation',
  'Import/Export Prorate',
  'PTKP Status Adjustment',
]

const EMPLOYEES = [
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: 'Lorem Ipsum', parentBranch: 'Lorem Ipsum', org: 'Lorem Ipsum', position: 'Lorem Ipsum' },
  { name: 'Nama Lorem', id: 'EMP12345', branch: '25/11/2025',  parentBranch: '25/11/2025',  org: '25/11/2025',  position: '25/11/2025'  },
  { name: 'Nama Lorem', id: 'EMP12345', branch: '25/11/2025',  parentBranch: '25/11/2025',  org: '25/11/2025',  position: '25/11/2025'  },
]

const S = {
  silver:      '#94a3b8',
  obsidian:    '#111827',
  cloud:       '#fafcfe',
  vapor:       '#f1f5f9',
  ocean:       '#026a9f',
  oceanSoft:   '#d9edf7',
  skyMuted:    '#7ab9d4',
  fog:         '#eaecf0',
  white:       '#ffffff',
  thHead:      '#87ceeb',   /* primary-300 — table header bg */
  thRow:       '#f3fafd',   /* primary-50 — table row hover */
}

function SortBoth({ light }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ marginLeft: 4, flexShrink: 0, opacity: light ? 0.7 : 1, color: light ? S.cloud : S.silver }}>
      <path d="M5 1L8 4.5H2L5 1Z" fill="currentColor" />
      <path d="M5 11L2 7.5H8L5 11Z" fill="currentColor" />
    </svg>
  )
}

function SortDown({ light }) {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ marginLeft: 4, flexShrink: 0, opacity: light ? 0.7 : 1, color: light ? S.cloud : S.silver }}>
      <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
    </svg>
  )
}

export default function Employee({ goTo }) {
  const [tab, setTab]   = useState('Employee List')
  const [view, setView] = useState('directory')
  const [allChecked, setAllChecked] = useState(false)
  const [pageSize, setPageSize]     = useState('10')

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  return (
    <div className="app__scroll" data-screen="employee" style={{ padding: 0, gap: 0 }}>

      {/* ── Page header ── */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: S.obsidian }}>
          Employee Directory
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Secondary button — inset shadow style from design system */}
          <button style={{
            height: 36, padding: '0 16px', border: 'none', borderRadius: 8,
            background: S.white, color: S.ocean, fontWeight: 700, fontSize: 13,
            letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: `inset 0 0 2px 0 ${S.ocean}, inset 0 0 10px 0 rgba(255,255,255,0.3), inset -1px -2px 2px 0 rgba(255,255,255,0.3), inset 1px 1px 2px 0 rgba(255,255,255,0.3)`,
          }}>
            Add Bulk Employee
          </button>
          <button className="btn btn--primary" style={{ height: 36, padding: '0 16px', fontSize: 13 }}>
            Add Employee
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${S.fog}`, paddingBottom: 0 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 14px',
                marginBottom: -1,
                border: 'none',
                borderRadius: '999px 999px 0 0',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                background: tab === t ? '#012e46' : 'transparent',
                color: tab === t ? S.white : S.silver,
                transition: 'all 180ms',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '16px 24px 32px' }}>
        {tab === 'Employee List' ? (
          <div className="card" style={{ padding: 0, gap: 0 }}>

            {/* Section header + action buttons */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.fog}` }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: S.obsidian }}>Employee List</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  height: 36, padding: '0 16px', border: 'none', borderRadius: 8,
                  background: S.white, color: S.ocean, fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.04em', cursor: 'pointer',
                  boxShadow: `inset 0 0 2px 0 ${S.ocean}, inset 0 0 10px 0 rgba(255,255,255,0.3)`,
                }}>
                  Add Bulk Employee
                </button>
                <button className="btn btn--primary" style={{ height: 36, padding: '0 16px', fontSize: 13 }}>
                  Add Employee
                </button>
              </div>
            </div>

            {/* ── Toolbar ── */}
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.fog}` }}>

              {/* Left: view toggle + filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Segmented control */}
                <div style={{ background: S.cloud, border: `0.833px solid ${S.silver}`, borderRadius: 8, display: 'flex', gap: 4, alignItems: 'center', height: 36, padding: 4 }}>
                  <button
                    onClick={() => setView('directory')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      padding: '2px 8px', border: 'none', borderRadius: 4, cursor: 'pointer',
                      background: view === 'directory' ? S.oceanSoft : 'transparent',
                      color: view === 'directory' ? S.ocean : S.skyMuted,
                      fontSize: 12, fontWeight: 500, transition: 'all 180ms',
                    }}
                  >
                    <i data-lucide="book-open" style={{ width: 14, height: 14 }}></i>
                    Directory
                  </button>
                  <button
                    onClick={() => setView('org')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      padding: '2px 8px', border: 'none', borderRadius: 4, cursor: 'pointer',
                      background: view === 'org' ? S.oceanSoft : 'transparent',
                      color: view === 'org' ? S.ocean : S.skyMuted,
                      fontSize: 12, fontWeight: 500, transition: 'all 180ms',
                    }}
                  >
                    <i data-lucide="network" style={{ width: 14, height: 14 }}></i>
                    Organization
                  </button>
                </div>

                {/* Filter button */}
                <button style={{
                  height: 36, minWidth: 120, padding: '6px 16px', border: 'none', borderRadius: 8,
                  background: S.white, color: S.ocean, fontWeight: 700, fontSize: 14,
                  letterSpacing: '0.04em', cursor: 'pointer',
                  boxShadow: `inset 0 0 2px 0 ${S.ocean}, inset 0 0 10px 0 rgba(255,255,255,0.3), inset -1px -2px 2px 0 rgba(255,255,255,0.3), inset 1px 1px 2px 0 rgba(255,255,255,0.3)`,
                }}>
                  Filter
                </button>
              </div>

              {/* Right: export, help, search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: S.silver, display: 'flex', alignItems: 'center' }} aria-label="Export">
                  <i data-lucide="upload" style={{ width: 20, height: 20 }}></i>
                </button>
                <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: S.silver, display: 'flex', alignItems: 'center' }} aria-label="Help">
                  <i data-lucide="help-circle" style={{ width: 20, height: 20 }}></i>
                </button>
                {/* Search */}
                <div style={{ position: 'relative', width: 192 }}>
                  <input
                    placeholder="Search here"
                    style={{
                      width: '100%', height: 36, padding: '4px 12px',
                      paddingRight: 36, border: `0.833px solid ${S.silver}`,
                      borderRadius: 8, background: S.cloud,
                      fontSize: 12, fontWeight: 500, color: S.obsidian,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <i data-lucide="search" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: S.silver, pointerEvents: 'none' }}></i>
                </div>
              </div>
            </div>

            {/* ── Stats card ── */}
            <div style={{ margin: '16px 16px 0', borderRadius: 8, boxShadow: '0px 2px 2px rgba(17,24,39,0.04), 0px 16px 32px -8px rgba(17,24,39,0.12)' }}>
              {/* Title row */}
              <div style={{ background: S.vapor, borderRadius: '8px 8px 0 0', padding: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: S.obsidian }}>Employees data in December 2025</span>
              </div>
              {/* Stats row */}
              <div style={{ display: 'flex', border: `1px solid ${S.vapor}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 8, gap: 4 }}>
                {[
                  { label: 'View Company',    value: 'SEVAKA', info: false },
                  { label: 'Total Employees', value: '77',     info: true  },
                  { label: 'New Hires',       value: '3',      info: true  },
                  { label: 'Leaving',         value: '0',      info: false },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: 10, justifyContent: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: S.silver, lineHeight: 1.4 }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 500, color: S.obsidian, lineHeight: 1 }}>{s.value}</span>
                      {s.info && <i data-lucide="info" style={{ width: 16, height: 16, color: S.silver }}></i>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* See full report */}
            <div style={{ padding: '8px 16px 0', textAlign: 'right' }}>
              <a href="#" style={{ fontSize: 13, color: 'var(--fg-link)', fontWeight: 500 }}>See full report on Insights</a>
            </div>

            {/* ── Table ── */}
            <div style={{ margin: '12px 16px 0', overflowX: 'auto', border: `1px solid ${S.fog}`, borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: S.thHead }}>
                    <th style={{ width: 50, padding: '12px', textAlign: 'center' }}>
                      <input type="checkbox" checked={allChecked} onChange={e => setAllChecked(e.target.checked)} style={{ cursor: 'pointer', accentColor: S.ocean }} />
                    </th>
                    {[
                      { label: 'Employee',      sort: 'both' },
                      { label: 'Employee ID',   sort: 'both' },
                      { label: 'Branch',        sort: 'both' },
                      { label: 'Parent Branch', sort: 'down' },
                      { label: 'Organization',  sort: 'both' },
                      { label: 'Job Position',  sort: 'both' },
                    ].map(col => (
                      <th key={col.label} style={{ padding: '12px', textAlign: 'left', fontSize: 14, fontWeight: 700, color: S.cloud, whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'capitalize', cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {col.label}
                          {col.sort === 'both' ? <SortBoth light /> : <SortDown light />}
                        </div>
                      </th>
                    ))}
                    <th style={{ width: 120, padding: '12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map((e, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: `1px solid ${S.fog}`, background: S.white, transition: 'background 120ms' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = S.thRow}
                      onMouseLeave={ev => ev.currentTarget.style.background = S.white}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input type="checkbox" checked={allChecked} onChange={() => {}} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '10px 12px', color: S.obsidian, fontWeight: 500 }}>{e.name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--fg-2)' }}>{e.id}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--fg-2)' }}>{e.branch}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--fg-2)' }}>{e.parentBranch}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--fg-2)' }}>{e.org}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--fg-2)' }}>{e.position}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '5px 12px', border: `1px solid ${S.fog}`, borderRadius: 8,
                          background: S.white, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                          color: 'var(--fg-2)', whiteSpace: 'nowrap',
                        }}>
                          Action <i data-lucide="chevron-down" style={{ width: 13, height: 13 }}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div style={{ padding: '12px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* Showing X from Y rows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: S.silver }}>Showing</span>
                <div style={{ position: 'relative', width: 69 }}>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(e.target.value)}
                    style={{
                      width: '100%', height: 36, padding: '4px 8px 4px 12px',
                      border: `0.833px solid ${S.silver}`, borderRadius: 8,
                      background: S.cloud, fontSize: 12, fontWeight: 500,
                      color: S.obsidian, cursor: 'pointer', appearance: 'none',
                      outline: 'none',
                    }}
                  >
                    {['10', '25', '50'].map(n => <option key={n}>{n}</option>)}
                  </select>
                  <i data-lucide="chevron-down" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: S.silver, pointerEvents: 'none' }}></i>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: S.silver }}>from 1 row</span>
              </div>

              {/* Page navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[
                  { icon: 'chevrons-left', label: 'First' },
                  { icon: 'chevron-left',  label: 'Prev'  },
                ].map(btn => (
                  <button key={btn.label} aria-label={btn.label} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: S.silver, display: 'flex', alignItems: 'center' }}>
                    <i data-lucide={btn.icon} style={{ width: 20, height: 20 }}></i>
                  </button>
                ))}

                {/* Page input */}
                <input
                  defaultValue="1"
                  style={{
                    width: 54, height: 36, textAlign: 'center',
                    border: `0.833px solid ${S.silver}`, borderRadius: 8,
                    background: S.cloud, fontSize: 12, fontWeight: 500,
                    color: S.obsidian, outline: 'none',
                  }}
                />

                <span style={{ fontSize: 14, fontWeight: 500, color: S.silver }}>from 1</span>

                {[
                  { icon: 'chevron-right',  label: 'Next' },
                  { icon: 'chevrons-right', label: 'Last' },
                ].map(btn => (
                  <button key={btn.label} aria-label={btn.label} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: S.silver, display: 'flex', alignItems: 'center' }}>
                    <i data-lucide={btn.icon} style={{ width: 20, height: 20 }}></i>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: S.silver, fontSize: 14 }}>
            {tab} — coming soon
          </div>
        )}
      </div>
    </div>
  )
}
