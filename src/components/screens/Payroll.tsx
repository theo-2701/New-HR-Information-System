import { useState, useEffect, useRef } from 'react'

/* ── Static data ────────────────────────────────────────────────── */
const TABS = [
  'Payroll Run',
  'Payroll History',
  'Payroll Component',
  'Tax Configuration',
  'Payslip Template',
]

const PERIODS = [
  'June 2025',
  'May 2025',
  'April 2025',
  'March 2025',
  'February 2025',
  'January 2025',
]

const SUMMARY_STATS = [
  { label: 'Total Gross',    value: 'Rp 847.200.000', sub: '77 employees',  color: 'var(--color-secondary-500)' },
  { label: 'Total Deductions', value: 'Rp 124.350.000', sub: 'Tax + BPJS',  color: 'var(--color-warning-500)'   },
  { label: 'Net Payroll',    value: 'Rp 722.850.000', sub: 'Take-home pay', color: 'var(--color-success-500)'   },
  { label: 'Pending',        value: '12',              sub: 'Awaiting approval', color: 'var(--color-error-500)' },
]

interface PayrollRow {
  name: string
  id: string
  position: string
  department: string
  gross: string
  deductions: string
  net: string
  status: 'Paid' | 'Pending' | 'On Hold' | 'Draft'
}

const PAYROLL_ROWS: PayrollRow[] = [
  { name: 'Alexandra Chen',  id: 'EMP-0241', position: 'Software Engineer',    department: 'Engineering',     gross: 'Rp 18.500.000', deductions: 'Rp 2.755.000', net: 'Rp 15.745.000', status: 'Paid'    },
  { name: 'Bimo Santoso',    id: 'EMP-0242', position: 'HR Specialist',        department: 'Human Resources', gross: 'Rp 12.000.000', deductions: 'Rp 1.788.000', net: 'Rp 10.212.000', status: 'Paid'    },
  { name: 'Clara Widianti',  id: 'EMP-0243', position: 'Accountant',           department: 'Finance',         gross: 'Rp 13.500.000', deductions: 'Rp 2.011.500', net: 'Rp 11.488.500', status: 'Pending' },
  { name: 'Dani Prasetyo',   id: 'EMP-0244', position: 'Product Manager',      department: 'Product',         gross: 'Rp 22.000.000', deductions: 'Rp 3.278.000', net: 'Rp 18.722.000', status: 'Paid'    },
  { name: 'Elena Kusuma',    id: 'EMP-0245', position: 'Marketing Lead',       department: 'Marketing',       gross: 'Rp 15.000.000', deductions: 'Rp 2.235.000', net: 'Rp 12.765.000', status: 'On Hold' },
  { name: 'Felix Hartawan',  id: 'EMP-0246', position: 'QA Engineer',          department: 'Engineering',     gross: 'Rp 14.000.000', deductions: 'Rp 2.086.000', net: 'Rp 11.914.000', status: 'Pending' },
  { name: 'Grace Tanaka',    id: 'EMP-0247', position: 'Sales Executive',      department: 'Sales',           gross: 'Rp 11.500.000', deductions: 'Rp 1.713.500', net: 'Rp 9.786.500',  status: 'Paid'    },
  { name: 'Hendra Wijaya',   id: 'EMP-0248', position: 'UI/UX Designer',       department: 'Engineering',     gross: 'Rp 16.000.000', deductions: 'Rp 2.384.000', net: 'Rp 13.616.000', status: 'Draft'   },
  { name: 'Indira Puspita',  id: 'EMP-0249', position: 'Operations Manager',   department: 'Operations',      gross: 'Rp 20.000.000', deductions: 'Rp 2.980.000', net: 'Rp 17.020.000', status: 'Paid'    },
  { name: 'Johan Surya',     id: 'EMP-0250', position: 'Legal Analyst',        department: 'Legal',           gross: 'Rp 17.500.000', deductions: 'Rp 2.607.500', net: 'Rp 14.892.500', status: 'Pending' },
]

const TABLE_COLS = ['Employee', 'Employee ID', 'Department', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', '']

const STATUS_CONFIG: Record<PayrollRow['status'], { bg: string; text: string; dot: string }> = {
  Paid:    { bg: 'var(--color-success-50)',  text: 'var(--color-success-800)', dot: 'var(--color-success-500)' },
  Pending: { bg: 'var(--color-warning-50)',  text: 'var(--color-warning-800)', dot: 'var(--color-warning-500)' },
  'On Hold': { bg: 'var(--color-error-50)', text: 'var(--color-error-800)',   dot: 'var(--color-error-500)'   },
  Draft:   { bg: 'var(--color-vapor)',       text: 'var(--color-steel)',       dot: 'var(--color-silver)'      },
}

interface FilterDef { key: string; title: string; items: string[] }
const FILTER_DEFS: FilterDef[] = [
  { key: 'status',     title: 'Status',     items: ['Paid', 'Pending', 'On Hold', 'Draft'] },
  { key: 'department', title: 'Department', items: ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal', 'Product'] },
  { key: 'period',     title: 'Period',     items: PERIODS },
]

interface PayrollProps {
  goTo: (screen: string) => void
}

/* ── Component ──────────────────────────────────────────────────── */
export default function Payroll({ goTo: _goTo }: PayrollProps) {
  const [tab, setTab] = useState('Payroll Run')
  const [period, setPeriod] = useState('June 2025')
  const [periodOpen, setPeriodOpen] = useState(false)
  const periodRef = useRef<HTMLDivElement>(null)

  /* Table state */
  const [allChecked, setAllChecked] = useState(false)
  const [checkedRows, setCheckedRows] = useState<boolean[]>(Array(PAYROLL_ROWS.length).fill(false))
  const [openAction, setOpenAction] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  /* Filter state */
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [appliedSelections, setAppliedSelections] = useState<Record<string, string[]>>({})
  const filterRef = useRef<HTMLDivElement>(null)

  /* Process payroll modal */
  const [processOpen, setProcessOpen] = useState(false)

  /* Detail drawer */
  const [detailRow, setDetailRow] = useState<PayrollRow | null>(null)

  const activeFilters = Object.values(appliedSelections).flat().length

  /* Close dropdowns on outside click */
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false)
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      setOpenAction(null)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  /* Derived filtered rows */
  const filteredRows = PAYROLL_ROWS.filter(row => {
    if (search && !row.name.toLowerCase().includes(search.toLowerCase()) &&
        !row.id.toLowerCase().includes(search.toLowerCase())) return false
    if (appliedSelections.status?.length && !appliedSelections.status.includes(row.status)) return false
    if (appliedSelections.department?.length && !appliedSelections.department.includes(row.department)) return false
    return true
  })

  function toggleAll() {
    const next = !allChecked
    setAllChecked(next)
    setCheckedRows(Array(PAYROLL_ROWS.length).fill(next))
  }

  function toggleRow(i: number) {
    const next = [...checkedRows]
    next[i] = !next[i]
    setCheckedRows(next)
    setAllChecked(next.every(Boolean))
  }

  function applyFilters() {
    setAppliedSelections({ ...selections })
    setFilterOpen(false)
  }

  function clearFilters() {
    setSelections({})
    setAppliedSelections({})
    setFilterOpen(false)
  }

  function toggleSelection(key: string, item: string) {
    setSelections(prev => {
      const cur = prev[key] ?? []
      return { ...prev, [key]: cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item] }
    })
  }

  const selectedCount = checkedRows.filter(Boolean).length

  return (
    <div className="app__scroll">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--fg-1)' }}>
            Payroll Processing
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>
            Manage and process employee payroll for your organization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i data-lucide="download" style={{ width: 14, height: 14 }}></i>
            Export
          </button>
          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setProcessOpen(true)}
          >
            <i data-lucide="play-circle" style={{ width: 14, height: 14 }}></i>
            Run Payroll
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {SUMMARY_STATS.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-3)' }}>{s.label}</span>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.color, flexShrink: 0,
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)', lineHeight: 1.2 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card-sm)',
        overflow: 'hidden',
      }}>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-1)',
          padding: '0 20px',
          gap: 0,
          overflowX: 'auto',
        }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '14px 16px',
                border: 'none',
                background: 'none',
                fontSize: 13,
                fontWeight: tab === t ? 700 : 500,
                color: tab === t ? 'var(--color-secondary-500)' : 'var(--fg-3)',
                borderBottom: tab === t ? '2px solid var(--color-secondary-500)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color var(--duration-1)',
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-1)' }}>
          {/* Period picker */}
          <div style={{ position: 'relative' }} ref={periodRef}>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              onClick={e => { e.stopPropagation(); setPeriodOpen(o => !o) }}
            >
              <i data-lucide="calendar" style={{ width: 14, height: 14 }}></i>
              {period}
              <i data-lucide="chevron-down" style={{ width: 14, height: 14 }}></i>
            </button>
            {periodOpen && (
              <div className="menu is-open" style={{ top: 'calc(100% + 6px)', left: 0, minWidth: 180 }}>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    className="menu__item"
                    style={{ fontWeight: p === period ? 700 : 400, color: p === period ? 'var(--color-secondary-500)' : undefined }}
                    onClick={() => { setPeriod(p); setPeriodOpen(false) }}
                  >
                    {p === period && <i data-lucide="check" style={{ width: 12, height: 12 }}></i>}
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <i data-lucide="search" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14, color: 'var(--fg-4)', pointerEvents: 'none',
            }}></i>
            <input
              placeholder="Search employee…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px 0 32px',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                background: 'var(--bg-surface)',
                color: 'var(--fg-1)',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, position: 'relative' }}
              onClick={e => { e.stopPropagation(); setFilterOpen(o => !o); setActiveFilterKey(null) }}
            >
              <i data-lucide="sliders-horizontal" style={{ width: 14, height: 14 }}></i>
              Filter
              {activeFilters > 0 && (
                <span style={{
                  background: 'var(--color-secondary-500)', color: '#fff',
                  borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', lineHeight: 1.5,
                }}>{activeFilters}</span>
              )}
            </button>

            {filterOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 100,
                background: 'var(--bg-surface)', border: '1px solid var(--border-1)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-overlay)',
                width: 320, overflow: 'hidden',
              }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', height: 260 }}>
                  {/* Left: filter keys */}
                  <div style={{
                    width: 120, borderRight: '1px solid var(--border-1)',
                    background: 'var(--bg-raised)', padding: '8px 0',
                  }}>
                    {FILTER_DEFS.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilterKey(f.key)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '8px 12px', border: 'none', fontSize: 12, fontWeight: 500,
                          background: activeFilterKey === f.key ? 'var(--bg-accent-soft)' : 'transparent',
                          color: activeFilterKey === f.key ? 'var(--color-secondary-700)' : 'var(--fg-2)',
                          cursor: 'pointer',
                        }}
                      >
                        {f.title}
                        {(selections[f.key]?.length ?? 0) > 0 && (
                          <span style={{
                            marginLeft: 6, background: 'var(--color-secondary-500)', color: '#fff',
                            borderRadius: 'var(--radius-pill)', fontSize: 10, padding: '1px 5px',
                          }}>{selections[f.key].length}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Right: items */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {activeFilterKey ? (
                      FILTER_DEFS.find(f => f.key === activeFilterKey)?.items.map(item => {
                        const checked = (selections[activeFilterKey] ?? []).includes(item)
                        return (
                          <label key={item} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '7px 12px', cursor: 'pointer', fontSize: 12,
                            color: 'var(--fg-2)',
                          }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleSelection(activeFilterKey, item)} />
                            {item}
                          </label>
                        )
                      })
                    ) : (
                      <div style={{ padding: '24px 12px', color: 'var(--fg-4)', fontSize: 12, textAlign: 'center' }}>
                        Select a filter
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', gap: 8,
                  padding: '10px 12px', borderTop: '1px solid var(--border-1)',
                }}>
                  <button className="btn-secondary" style={{ fontSize: 12 }} onClick={clearFilters}>Clear</button>
                  <button className="btn-primary" style={{ fontSize: 12 }} onClick={applyFilters}>Apply</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {selectedCount > 0 && (
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                {selectedCount} selected
              </span>
            )}
            {selectedCount > 0 && (
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-error-600)', borderColor: 'var(--color-error-200)' }}>
                <i data-lucide="pause-circle" style={{ width: 13, height: 13 }}></i>
                Hold Selected
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        {tab === 'Payroll Run' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--bg-raised)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', width: 40 }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  {TABLE_COLS.map(col => (
                    <th key={col} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontWeight: 600, fontSize: 11, color: 'var(--fg-3)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length + 1} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--fg-4)', fontSize: 13 }}>
                      <i data-lucide="inbox" style={{ width: 32, height: 32, display: 'block', margin: '0 auto 8px' }}></i>
                      No payroll records found
                    </td>
                  </tr>
                ) : filteredRows.map((row, i) => {
                  const sc = STATUS_CONFIG[row.status]
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid var(--border-1)',
                        background: checkedRows[i] ? 'var(--bg-accent-soft)' : 'transparent',
                        transition: 'background var(--duration-1)',
                      }}
                      onMouseEnter={e => { if (!checkedRows[i]) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-raised)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = checkedRows[i] ? 'var(--bg-accent-soft)' : 'transparent' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={checkedRows[i]} onChange={() => toggleRow(i)} style={{ cursor: 'pointer' }} />
                      </td>
                      {/* Employee */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `hsl(${(row.name.charCodeAt(0) * 17) % 360}, 55%, 55%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
                          }}>
                            {row.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{row.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 1 }}>{row.position}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--fg-3)', fontFamily: 'monospace', fontSize: 12 }}>{row.id}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--fg-2)' }}>{row.department}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--fg-1)', fontWeight: 600 }}>{row.gross}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-error-600)' }}>{row.deductions}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-success-700)', fontWeight: 700 }}>{row.net}</td>
                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                          fontSize: 11, fontWeight: 600,
                          background: sc.bg, color: sc.text,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                          {row.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            style={{
                              border: 'none', background: 'none', padding: '4px 6px',
                              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                              color: 'var(--fg-3)',
                              transition: 'background var(--duration-1)',
                            }}
                            onClick={e => { e.stopPropagation(); setOpenAction(openAction === i ? null : i) }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            <i data-lucide="more-horizontal" style={{ width: 16, height: 16 }}></i>
                          </button>
                          {openAction === i && (
                            <div
                              className="menu is-open"
                              style={{ top: 'calc(100% + 4px)', right: 0, left: 'auto', minWidth: 160 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button className="menu__item" onClick={() => { setDetailRow(row); setOpenAction(null) }}>
                                <i data-lucide="eye"></i>View Payslip
                              </button>
                              <button className="menu__item">
                                <i data-lucide="edit-2"></i>Edit Components
                              </button>
                              {row.status === 'Pending' && (
                                <button className="menu__item">
                                  <i data-lucide="check-circle"></i>Approve
                                </button>
                              )}
                              {row.status !== 'On Hold' && (
                                <button className="menu__item" style={{ color: 'var(--color-warning-700)' }}>
                                  <i data-lucide="pause-circle"></i>Put On Hold
                                </button>
                              )}
                              <div style={{ borderTop: '1px solid var(--border-1)', margin: '4px 0' }} />
                              <button className="menu__item" style={{ color: 'var(--color-error-600)' }}>
                                <i data-lucide="trash-2"></i>Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Placeholder for other tabs */
          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--fg-4)' }}>
            <i data-lucide="layers" style={{ width: 40, height: 40, display: 'block', margin: '0 auto 12px' }}></i>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-3)' }}>{tab}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Content coming soon</div>
          </div>
        )}

        {/* Table footer */}
        {tab === 'Payroll Run' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', borderTop: '1px solid var(--border-1)',
            fontSize: 12, color: 'var(--fg-3)',
          }}>
            <span>Showing {filteredRows.length} of {PAYROLL_ROWS.length} employees</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3].map(p => (
                <button key={p} style={{
                  width: 28, height: 28, border: p === 1 ? '1px solid var(--color-secondary-500)' : '1px solid var(--border-1)',
                  borderRadius: 'var(--radius-sm)', background: p === 1 ? 'var(--bg-brand-soft)' : 'transparent',
                  color: p === 1 ? 'var(--color-secondary-700)' : 'var(--fg-3)',
                  fontWeight: p === 1 ? 700 : 400, fontSize: 12, cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Process Payroll Modal ── */}
      {processOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'var(--bg-scrim)', backdropFilter: 'var(--blur-scrim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setProcessOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-popup)',
              width: 480, padding: '28px 32px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-brand-soft)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <i data-lucide="play-circle" style={{ width: 20, height: 20, color: 'var(--color-secondary-500)' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>Run Payroll</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>Process payroll for {period}</p>
                </div>
              </div>
              <button
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--fg-4)', padding: 4 }}
                onClick={() => setProcessOpen(false)}
              >
                <i data-lucide="x" style={{ width: 18, height: 18 }}></i>
              </button>
            </div>

            {/* Summary */}
            <div style={{
              background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-1)', padding: '16px', marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-4)', marginBottom: 12 }}>
                Payroll Summary
              </div>
              {[
                { label: 'Period',         value: period },
                { label: 'Total Employees', value: '77' },
                { label: 'Total Gross',    value: 'Rp 847.200.000' },
                { label: 'Total Deductions', value: 'Rp 124.350.000' },
                { label: 'Net Payroll',    value: 'Rp 722.850.000', bold: true, color: 'var(--color-success-700)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-3)' }}>{item.label}</span>
                  <span style={{ fontWeight: item.bold ? 700 : 500, color: item.color ?? 'var(--fg-1)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px',
              background: 'var(--color-warning-50)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-warning-200)', marginBottom: 24,
            }}>
              <i data-lucide="alert-triangle" style={{ width: 16, height: 16, color: 'var(--color-warning-600)', flexShrink: 0, marginTop: 1 }}></i>
              <div style={{ fontSize: 12, color: 'var(--color-warning-800)', lineHeight: 1.5 }}>
                <strong>12 employees</strong> have pending items. Please review before proceeding.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setProcessOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setProcessOpen(false)}>
                <i data-lucide="check" style={{ width: 14, height: 14 }}></i>
                Confirm & Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payslip Detail Drawer ── */}
      {detailRow && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'var(--bg-scrim)', backdropFilter: 'var(--blur-scrim)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          }}
          onClick={() => setDetailRow(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              height: '100%', width: 420, padding: '28px 28px',
              boxShadow: 'var(--shadow-popup)',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Payslip Detail</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>{period}</p>
              </div>
              <button
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--fg-4)' }}
                onClick={() => setDetailRow(null)}
              >
                <i data-lucide="x" style={{ width: 18, height: 18 }}></i>
              </button>
            </div>

            {/* Employee card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-1)', marginBottom: 20,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `hsl(${(detailRow.name.charCodeAt(0) * 17) % 360}, 55%, 55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {detailRow.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{detailRow.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{detailRow.position} · {detailRow.id}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
                background: STATUS_CONFIG[detailRow.status].bg,
                color: STATUS_CONFIG[detailRow.status].text,
              }}>{detailRow.status}</span>
            </div>

            {/* Earnings */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-4)', marginBottom: 10 }}>
                Earnings
              </div>
              {[
                { label: 'Basic Salary',      value: detailRow.gross },
                { label: 'Allowances',         value: 'Rp 2.500.000' },
                { label: 'Overtime Pay',       value: 'Rp 450.000' },
                { label: 'Performance Bonus',  value: 'Rp 0' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-3)' }}>{item.label}</span>
                  <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--border-1)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--fg-1)', fontSize: 13 }}>Total Gross</span>
                <span style={{ fontWeight: 700, color: 'var(--fg-1)', fontSize: 13 }}>{detailRow.gross}</span>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-4)', marginBottom: 10 }}>
                Deductions
              </div>
              {[
                { label: 'PPh 21 (Income Tax)', value: `Rp ${(parseInt(detailRow.deductions.replace(/\D/g, '')) * 0.6).toLocaleString('id-ID')}` },
                { label: 'BPJS Kesehatan',      value: 'Rp 297.000' },
                { label: 'BPJS Ketenagakerjaan', value: 'Rp 198.000' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-3)' }}>{item.label}</span>
                  <span style={{ color: 'var(--color-error-600)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--border-1)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--fg-1)', fontSize: 13 }}>Total Deductions</span>
                <span style={{ fontWeight: 700, color: 'var(--color-error-600)', fontSize: 13 }}>{detailRow.deductions}</span>
              </div>
            </div>

            {/* Net */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', background: 'var(--color-success-50)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-200)',
              marginBottom: 24,
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-success-900)', fontSize: 14 }}>Net Take-Home</span>
              <span style={{ fontWeight: 700, color: 'var(--color-success-700)', fontSize: 16 }}>{detailRow.net}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <i data-lucide="download" style={{ width: 14, height: 14 }}></i>
                Download PDF
              </button>
              <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <i data-lucide="send" style={{ width: 14, height: 14 }}></i>
                Send to Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
