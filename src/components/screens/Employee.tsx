import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ── Static data ────────────────────────────────────────────────── */
const TABS = [
  'Employee List',
  'Organization Structure',
  'Employee Transfer',
  'Mass Resignation',
  'Import/Export Prorate',
  'PTKP Status Adjustment',
]

const EMPLOYEES = [
  { name: 'Alexandra Chen',   id: 'EMP-0241', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Engineering',      position: 'Software Engineer' },
  { name: 'Bimo Santoso',     id: 'EMP-0242', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Human Resources',  position: 'HR Specialist' },
  { name: 'Clara Widianti',   id: 'EMP-0243', branch: 'Branch — Surabaya',     parentBranch: 'SEVAKA Corp', org: 'Finance',          position: 'Accountant' },
  { name: 'Dani Prasetyo',    id: 'EMP-0244', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Product',          position: 'Product Manager' },
  { name: 'Elena Kusuma',     id: 'EMP-0245', branch: 'Branch — Bandung',      parentBranch: 'SEVAKA Corp', org: 'Marketing',        position: 'Marketing Lead' },
  { name: 'Felix Hartawan',   id: 'EMP-0246', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Engineering',      position: 'QA Engineer' },
  { name: 'Grace Tanaka',     id: 'EMP-0247', branch: 'Branch — Bali',         parentBranch: 'SEVAKA Corp', org: 'Sales',            position: 'Sales Executive' },
  { name: 'Hendra Wijaya',    id: 'EMP-0248', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Engineering',      position: 'UI/UX Designer' },
  { name: 'Indira Puspita',   id: 'EMP-0249', branch: 'Branch — Medan',        parentBranch: 'SEVAKA Corp', org: 'Operations',       position: 'Operations Manager' },
  { name: 'Johan Surya',      id: 'EMP-0250', branch: 'Head Office — Jakarta', parentBranch: 'SEVAKA Corp', org: 'Legal',            position: 'Legal Analyst' },
]

const SUMMARY_STATS = [
  { label: 'View Company',    value: 'SEVAKA', info: false },
  { label: 'Total Employees', value: '77',     info: true  },
  { label: 'New Hires',       value: '3',      info: true  },
  { label: 'Leaving',         value: '0',      info: false },
]

const TABLE_COLS = ['Employee', 'Employee ID', 'Branch', 'Parent Branch', 'Organization', 'Job Position']

interface FilterDef { key: string; title: string; items: string[] }
const FILTER_DEFS: FilterDef[] = [
  { key: 'status',       title: 'Status',            items: ['Active', 'Inactive', 'On Leave', 'Suspended', 'Resigned', 'Terminated'] },
  { key: 'employment',   title: 'Employment Status', items: ['Permanent', 'Contract (PKWT)', 'Probation', 'Internship', 'Outsource', 'Freelance'] },
  { key: 'branch',       title: 'Branch',            items: ['Head Office — Jakarta', 'Branch — Surabaya', 'Branch — Bandung', 'Branch — Medan', 'Branch — Bali', 'Branch — Makassar'] },
  { key: 'organization', title: 'Organization',      items: ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal', 'Product'] },
  { key: 'position',     title: 'Job Position',      items: ['Software Engineer', 'HR Specialist', 'Accountant', 'Product Manager', 'Sales Executive', 'UI/UX Designer', 'QA Engineer', 'Data Analyst'] },
  { key: 'level',        title: 'Job Level',         items: ['Staff', 'Supervisor', 'Manager', 'Senior Manager', 'Director', 'Vice President', 'C-Level'] },
  { key: 'sbu',          title: 'SBU',               items: ['SBU Group A', 'SBU Group B', 'SBU Group C', 'SBU Energy', 'SBU Retail', 'SBU Digital'] },
]

/* ── Types ─────────────────────────────────────────────────────── */
interface EmployeeProps {
  goTo: (screen: string) => void
}

/* ── Component ──────────────────────────────────────────────────── */
export default function Employee({ goTo: _goTo }: EmployeeProps) {
  /* Tab / view */
  const [tab, setTab] = useState('Employee List')
  const [view, setView] = useState<'directory' | 'organization'>('directory')

  /* Table */
  const [allChecked, setAllChecked] = useState(false)
  const [checkedRows, setCheckedRows] = useState<boolean[]>(Array(10).fill(false))
  const [openAction, setOpenAction] = useState<number | null>(null)

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filterOpen, setFilterOpen] = useState(false)
  const [addedKeys, setAddedKeys] = useState<string[]>([])
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [blockSearch, setBlockSearch] = useState<Record<string, string>>({})
  // Applied state (what's shown as chips + badge)
  const [appliedKeys, setAppliedKeys] = useState<string[]>([])
  const [appliedSelections, setAppliedSelections] = useState<Record<string, string[]>>({})

  /* LOV popover */
  const [lovOpen, setLovOpen] = useState(false)
  const [lovSearch, setLovSearch] = useState('')
  const [lovPos, setLovPos] = useState({ top: 0, left: 0 })
  const lovBtnRef = useRef<HTMLButtonElement | null>(null)

  /* Other modals */
  const [transferOpen, setTransferOpen] = useState(false)
  const [resignOpen, setResignOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState({ title: 'Success', desc: 'Your changes have been saved.' })

  /* ── Lucide icons ─────────────────────────────────────────────── */
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  /* ── Close menus on outside click ───────────────────────────── */
  const closeAllActions = useCallback(() => setOpenAction(null), [])
  useEffect(() => {
    document.addEventListener('click', closeAllActions)
    return () => document.removeEventListener('click', closeAllActions)
  }, [closeAllActions])

  useEffect(() => {
    if (!lovOpen) return
    const handler = (e: MouseEvent) => {
      if (lovBtnRef.current && lovBtnRef.current.contains(e.target as Node)) return
      setLovOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [lovOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFilterOpen(false)
        setTransferOpen(false)
        setResignOpen(false)
        setDeleteOpen(false)
        setImportOpen(false)
        setSuccessOpen(false)
        setLovOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* ── Table helpers ───────────────────────────────────────────── */
  function handleAllCheck(checked: boolean) {
    setAllChecked(checked)
    setCheckedRows(Array(10).fill(checked))
  }
  function handleRowCheck(i: number, checked: boolean) {
    const next = [...checkedRows]
    next[i] = checked
    setCheckedRows(next)
    setAllChecked(next.every(Boolean))
  }

  /* ── Filter helpers ──────────────────────────────────────────── */
  function openLov(btn: HTMLButtonElement) {
    const rect = btn.getBoundingClientRect()
    const menuH = 320
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < menuH + 16 && rect.top > menuH + 16
      ? rect.top - menuH - 8
      : rect.bottom + 8
    const left = Math.min(rect.left, window.innerWidth - 296 - 8)
    setLovPos({ top: Math.max(8, top), left: Math.max(8, left) })
    setLovSearch('')
    setLovOpen(true)
  }

  function addFilter(key: string) {
    setAddedKeys(prev => [...prev, key])
    setActiveFilterKey(key)
    setLovOpen(false)
  }

  function removeFilter(key: string) {
    const next = addedKeys.filter(k => k !== key)
    setAddedKeys(next)
    setSelections(prev => { const s = { ...prev }; delete s[key]; return s })
    if (activeFilterKey === key) setActiveFilterKey(next[next.length - 1] ?? null)
  }

  function toggleFilterBlock(key: string) {
    setActiveFilterKey(prev => prev === key ? null : key)
  }

  function setSelection(key: string, items: string[]) {
    setSelections(prev => ({ ...prev, [key]: items }))
  }

  function applyFilters() {
    const activeApplied = addedKeys.filter(k => (selections[k] ?? []).length > 0)
    setAppliedKeys(activeApplied)
    setAppliedSelections({ ...selections })
    setFilterOpen(false)
  }

  function resetFilterModal() {
    setAddedKeys([])
    setSelections({})
    setActiveFilterKey(null)
    setBlockSearch({})
  }

  function clearAllApplied() {
    setAppliedKeys([])
    setAppliedSelections({})
    setAddedKeys([])
    setSelections({})
    setActiveFilterKey(null)
  }

  function clearChip(key: string) {
    const nextApplied = appliedKeys.filter(k => k !== key)
    setAppliedKeys(nextApplied)
    setAppliedSelections(prev => { const s = { ...prev }; delete s[key]; return s })
    setAddedKeys(prev => prev.filter(k => k !== key))
    setSelections(prev => { const s = { ...prev }; delete s[key]; return s })
  }

  const filterCount = appliedKeys.length
  const availableFilterDefs = FILTER_DEFS.filter(d => !addedKeys.includes(d.key))
  const filteredLovDefs = availableFilterDefs.filter(d =>
    d.title.toLowerCase().includes(lovSearch.toLowerCase())
  )

  /* ── Success helper ──────────────────────────────────────────── */
  function showSuccess(title: string, desc: string) {
    setSuccessMsg({ title, desc })
    setSuccessOpen(true)
  }

  /* ── Chip text helper ────────────────────────────────────────── */
  function chipLabel(key: string): string {
    const def = FILTER_DEFS.find(d => d.key === key)!
    const sel = appliedSelections[key] ?? []
    if (!sel.length) return def.title
    const first = sel[0]
    return sel.length > 1
      ? `${def.title}: ${first} +${sel.length - 1}`
      : `${def.title}: ${first}`
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <header className="emp-head">
        <h1 className="emp-title">Employee Directory</h1>
        <nav className="emp-tabs">
          {TABS.map(t => (
            <button key={t} className={`emp-tab${tab === t ? ' is-on' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main card ───────────────────────────────────────────── */}
      <section className="emp-card">
        <div className="emp-card__head">
          <h2 className="emp-card__title">Employee List</h2>
          <div className="emp-card__actions">
            <button className="btn btn--secondary" onClick={() => setImportOpen(true)}>Add Bulk Employee</button>
            <button className="btn btn--primary" onClick={() => _goTo('add-employee')}>Add Employee</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="emp-toolbar">
          <div className="emp-toolbar__left">
            <div className="seg">
              <button className={`seg__btn${view === 'directory' ? ' is-on' : ''}`} onClick={() => setView('directory')}>
                <i data-lucide="book-open"></i>Directory
              </button>
              <button className={`seg__btn${view === 'organization' ? ' is-on' : ''}`} onClick={() => setView('organization')}>
                <i data-lucide="network"></i>Organization
              </button>
            </div>
            <button
              className={`emp-filter${filterCount > 0 ? ' is-active' : ''}`}
              onClick={() => setFilterOpen(true)}
            >
              <i data-lucide="sliders-horizontal"></i>
              Filter
              {filterCount > 0 && (
                <span className="emp-filter__count">{filterCount}</span>
              )}
            </button>
          </div>
          <div className="emp-toolbar__right">
            <button className="emp-iconbtn" data-tip="Export" aria-label="Export">
              <i data-lucide="file-output"></i>
            </button>
            <button className="emp-iconbtn" data-tip="Help" aria-label="Help">
              <i data-lucide="circle-help"></i>
            </button>
            <div className="emp-search">
              <input type="text" placeholder="Search here" />
              <i data-lucide="search"></i>
            </div>
          </div>
        </div>

        {/* ── Directory view ──────────────────────────────────────── */}
        {view === 'directory' && (
          <div className="emp-view" data-view-pane="directory">
            {/* Active filter chips */}
            {appliedKeys.length > 0 && (
              <div className="emp-activefilters">
                <span className="emp-activefilters__label">Filtered by</span>
                <div className="emp-activefilters__chips">
                  {appliedKeys.map(k => (
                    <span key={k} className="emp-chip">
                      <span className="emp-chip__txt">{chipLabel(k)}</span>
                      <button className="emp-chip__x" onClick={() => clearChip(k)} aria-label={`Remove ${k} filter`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <button className="emp-activefilters__clear" onClick={clearAllApplied}>Clear all</button>
              </div>
            )}

            {/* Summary strip */}
            <div className="emp-summary">
              <div className="emp-summary__head">Employees data in December 2025</div>
              <div className="emp-summary__grid">
                {SUMMARY_STATS.map(s => (
                  <div key={s.label} className="emp-summary__cell">
                    <span className="emp-summary__label">{s.label}</span>
                    <span className="emp-summary__value">
                      {s.value}
                      {s.info && <span className="info-i"><i data-lucide="info"></i></span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <a className="emp-insights" href="#">See full report on Insights</a>

            {/* Table */}
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>
                      <label className="checkbox" style={{ margin: 0 }}>
                        <input type="checkbox" checked={allChecked} onChange={e => handleAllCheck(e.target.checked)} />
                        <span className="checkbox__box"></span>
                      </label>
                    </th>
                    {TABLE_COLS.map(col => (
                      <th key={col}>
                        <span className="th-sort">{col} <i data-lucide="arrow-down-up"></i></span>
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map((emp, i) => (
                    <tr key={i}>
                      <td>
                        <label className="checkbox" style={{ margin: 0 }}>
                          <input type="checkbox" checked={checkedRows[i]} onChange={e => handleRowCheck(i, e.target.checked)} />
                          <span className="checkbox__box"></span>
                        </label>
                      </td>
                      <td className="col-name">{emp.name}</td>
                      <td>{emp.id}</td>
                      <td>{emp.branch}</td>
                      <td>{emp.parentBranch}</td>
                      <td>{emp.org}</td>
                      <td>{emp.position}</td>
                      <td className="col-action">
                        <div className={`action-wrap${openAction === i ? ' is-open' : ''}`}>
                          <button
                            className="action-btn"
                            type="button"
                            onClick={e => { e.stopPropagation(); setOpenAction(openAction === i ? null : i) }}
                          >
                            Actions <i data-lucide="chevron-down"></i>
                          </button>
                          <div className={`menu${openAction === i ? ' is-open' : ''}`} onClick={e => e.stopPropagation()}>
                            <button className="menu__item" onClick={() => setOpenAction(null)}>
                              View employee's info
                            </button>
                            <button className="menu__item" onClick={() => { setOpenAction(null); setTransferOpen(true) }}>
                              Transfer employee
                            </button>
                            <button className="menu__item" onClick={() => { setOpenAction(null); setResignOpen(true) }}>
                              Resign
                            </button>
                            <button className="menu__item is-muted" onClick={() => { setOpenAction(null); setDeleteOpen(true) }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="emp-foot">
              <div className="emp-foot__left">
                <span>Showing</span>
                <button className="emp-foot__select">10 <i data-lucide="chevron-down"></i></button>
                <span>from {EMPLOYEES.length} rows</span>
              </div>
              <div className="emp-foot__pages">
                <div className="emp-foot__nav">
                  <button className="emp-foot__btn" aria-label="prev" disabled><i data-lucide="chevron-left"></i></button>
                  <button className="emp-foot__btn" aria-label="first" disabled><i data-lucide="chevrons-left"></i></button>
                </div>
                <span className="emp-foot__page">1</span>
                <span>from 1</span>
                <div className="emp-foot__nav">
                  <button className="emp-foot__btn" aria-label="next"><i data-lucide="chevron-right"></i></button>
                  <button className="emp-foot__btn" aria-label="last"><i data-lucide="chevrons-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Organization view ───────────────────────────────────── */}
        {view === 'organization' && (
          <div className="emp-view" data-view-pane="organization">
            <div className="org-toolbar">
              <button className="org-notset">4 Employees Not Set</button>
            </div>
            <div className="org-scroll">
              <div className="org-canvas">
                <svg className="org-lines" viewBox="0 0 1480 900" preserveAspectRatio="none" fill="none">
                  <g stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M740 178 V300"/>
                    <path d="M360 380 V318 Q360 300 378 300 H740"/>
                    <path d="M1120 380 V318 Q1120 300 1102 300 H740"/>
                    <path d="M360 526 V700"/>
                    <path d="M1120 526 V700"/>
                  </g>
                </svg>
                <OrgNode variant="ocean" left={570} top={32} pct="20%" title="[Position Name]" count={2} name="[Name]" dept="[Department Name]" toggle={5} />
                <OrgNode variant="sky"   left={190} top={380} pct="20%" title="[Position Name]" count={1} name="[Name]" dept="[Department Name]" toggle={5} />
                <OrgNode variant="sky"   left={950} top={380} pct="20%" title="[Position Name]" count={1} name="[Name]" dept="[Department Name]" toggle={5} />
                <OrgNode variant="sand"  left={190} top={700} pct="20%" title="[Position Name]" count={2} name="[Name]" dept="[Department Name]" />
                <OrgNode variant="sand"  left={950} top={700} pct="20%" title="[Position Name]" count={2} name="[Name]" dept="[Department Name]" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════ */}

      {/* ── All Filter Modal ─────────────────────────────────────── */}
      <div className={`modal-scrim${filterOpen ? ' is-open' : ''}`} onClick={() => setFilterOpen(false)}>
        <div className="modal modal--sheet modal--filter" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <div className="modal__head">
            <button className="modal__close" type="button" onClick={() => setFilterOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <h2 className="modal__title">All Filter</h2>
          </div>

          <div className="modal__scroll">
            {addedKeys.length === 0 ? (
              /* Empty state */
              <div className="filter-empty">
                <span className="filter-empty__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5h18l-7 8.5v6l-4 2v-8z"/></svg>
                </span>
                <div className="filter-empty__title">No filters have been set yet</div>
                <div className="filter-empty__sub">Your filter will be displayed here</div>
                <div className="filter-addwrap">
                  <button
                    ref={lovBtnRef}
                    className="add-filter"
                    type="button"
                    onClick={e => { e.stopPropagation(); openLov(e.currentTarget) }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                    Add Filter
                  </button>
                </div>
              </div>
            ) : (
              /* Filled state */
              <div>
                <div className="filter-list">
                  {addedKeys.map(key => {
                    const def = FILTER_DEFS.find(d => d.key === key)!
                    const isExpanded = activeFilterKey === key
                    const sel = selections[key] ?? []
                    const search = blockSearch[key] ?? ''
                    const filteredItems = def.items.filter(it => it.toLowerCase().includes(search.toLowerCase()))
                    const allCheckedFilter = sel.length === def.items.length
                    const someChecked = sel.length > 0 && sel.length < def.items.length

                    return (
                      <div key={key} className={`filter-block${!isExpanded ? ' is-collapsed' : ''}`}>
                        <div className="filter-block__head">
                          <span className="filter-block__title">{def.title}</span>
                          <button className="filter-block__remove" type="button" onClick={() => removeFilter(key)} aria-label="Remove filter">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                          <button className="filter-block__chev" type="button" onClick={() => toggleFilterBlock(key)} aria-label="Toggle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </div>

                        <div className={`filter-block__sub${!isExpanded ? ' is-collapsed-state' : ''}`}>
                          is any of{' '}
                          <span className={`filter-block__selected${sel.length ? ' has-sel' : ''}`}>
                            {sel.length ? sel.join(', ') : '…'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="filter-block__body">
                            <div className="filter-search">
                              <input
                                type="text"
                                placeholder={`Search ${def.title.toLowerCase()}`}
                                value={search}
                                onChange={e => setBlockSearch(prev => ({ ...prev, [key]: e.target.value }))}
                              />
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </div>
                            <div className="filter-opts">
                              {/* Select all */}
                              <label className="check-red filter-opt filter-opt--all">
                                <input
                                  type="checkbox"
                                  checked={allCheckedFilter}
                                  ref={el => { if (el) el.indeterminate = someChecked }}
                                  onChange={e => {
                                    setSelection(key, e.target.checked ? [...def.items] : [])
                                  }}
                                />
                                <span className="check-red__box"></span>
                                <span className="filter-opt__txt">Select all</span>
                              </label>
                              {filteredItems.length === 0 ? (
                                <div className="filter-noresult">No matching results</div>
                              ) : (
                                filteredItems.map(item => (
                                  <label key={item} className="check-red filter-opt">
                                    <input
                                      type="checkbox"
                                      checked={sel.includes(item)}
                                      onChange={e => {
                                        setSelection(key, e.target.checked
                                          ? [...sel, item]
                                          : sel.filter(s => s !== item)
                                        )
                                      }}
                                    />
                                    <span className="check-red__box"></span>
                                    <span className="filter-opt__txt">{item}</span>
                                  </label>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="filter-add-row">
                  <div className="filter-addwrap">
                    <button
                      ref={lovBtnRef}
                      className="add-filter"
                      type="button"
                      onClick={e => { e.stopPropagation(); openLov(e.currentTarget) }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                      Add Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sheet-foot">
            {addedKeys.length > 0 && (
              <button className="sheet-foot__link" type="button" onClick={resetFilterModal}>Reset filter</button>
            )}
            <span className="sheet-foot__spacer"></span>
            <button className="btn btn--secondary" type="button" onClick={() => setFilterOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={applyFilters}>Apply</button>
          </div>
        </div>
      </div>

      {/* ── LOV Popover (portal, never clipped) ─────────────────── */}
      {lovOpen && createPortal(
        <div
          className="lov-menu"
          style={{ top: lovPos.top, left: lovPos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="lov-menu__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Search filter"
              value={lovSearch}
              onChange={e => setLovSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="lov-menu__list">
            {filteredLovDefs.length === 0 ? (
              <div className="lov-menu__noresult">
                {availableFilterDefs.length === 0 ? 'All filters have been added' : 'No matching filter'}
              </div>
            ) : (
              filteredLovDefs.map(d => (
                <button key={d.key} className="lov-menu__item" type="button" onClick={() => addFilter(d.key)}>
                  {d.title}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── Employee Transfer Modal ──────────────────────────────── */}
      <div className={`modal-scrim${transferOpen ? ' is-open' : ''}`} onClick={() => setTransferOpen(false)}>
        <div className="modal modal--sheet modal--transfer" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <div className="modal__head">
            <button className="modal__close" type="button" onClick={() => setTransferOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <h2 className="modal__title">Employee Transfer</h2>
          </div>
          <div className="modal__scroll">
            <div className="ae-grid">
              <div className="fld span-2">
                <label className="fld__label">Full Name</label>
                <div className="ctl is-disabled"><input type="text" placeholder="Nama Lorem" readOnly /></div>
              </div>
              <div className="fld">
                <label className="fld__label">Effective date <span className="req">*</span></label>
                <div className="ctl ctl--date">
                  <input type="text" placeholder="Select Date" readOnly />
                  <svg className="ctl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Transfer type <span className="req">*</span></label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select transfer type</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="tr-divider"></div>
            <div className="tr-section-head">
              <div className="tr-section-head__title">Manage Transfer</div>
              <div className="tr-section-head__sub">You can select one of the fields to transfer.</div>
            </div>

            <div className="ae-grid">
              <div className="fld">
                <label className="fld__label">Employment status</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select employment status</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div></div>
              <div className="fld">
                <label className="fld__label">Branch</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select branch</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Organization</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select organization</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Job Position</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select job position</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Job level</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select job level</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Approval line</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select approval line</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div className="fld">
                <label className="fld__label">Manager</label>
                <div className="ctl ctl--select">
                  <span className="ctl__value">Select manager</span>
                  <svg className="ctl__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="tr-divider"></div>
            <div className="tr-section-head">
              <div className="tr-section-head__title">Additional detail</div>
              <div className="tr-section-head__sub">You can add supporting data for transferring employees.</div>
            </div>

            <div className="ae-grid">
              <div className="fld span-2">
                <label className="fld__label">Attachment</label>
                <label className="file-ctl">
                  <span className="file-ctl__btn">Choose File</span>
                  <span className="file-ctl__name">No file selected</span>
                  <input type="file" style={{ display: 'none' }} />
                </label>
                <span className="tr-help">File format: .pdf, .jpg, .png, .xlsx, .xls, .jpeg, .docx, .doc — max 10 MB</span>
              </div>
              <div className="fld span-2">
                <label className="fld__label">Reason</label>
                <div className="ctl ctl--area"><textarea placeholder="Input here"></textarea></div>
              </div>
              <div className="tr-notify">
                <label className="mini-check"><input type="checkbox" /><span className="mini-check__box"></span>Notify employee's manager by email</label>
                <label className="mini-check"><input type="checkbox" /><span className="mini-check__box"></span>Notify employee by email</label>
              </div>
            </div>
          </div>
          <div className="sheet-foot">
            <button className="btn btn--secondary" type="button" onClick={() => setTransferOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={() => { setTransferOpen(false); showSuccess('Transfer Submitted', 'The employee transfer request has been submitted and is awaiting approval.') }}>Submit</button>
          </div>
        </div>
      </div>

      {/* ── Proceed Resignation Modal ────────────────────────────── */}
      <div className={`modal-scrim${resignOpen ? ' is-open' : ''}`} onClick={() => setResignOpen(false)}>
        <div className="modal modal--ask" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal__close" type="button" onClick={() => setResignOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="modal__title">Proceed Resignation?</h2>
          <div className="modal__rule"></div>
          <p className="modal__body">You will be directed to the resignation details page to set up essential data.</p>
          <div className="ask-note">
            <span className="ask-note__icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 22 20H2L12 2.5Z"/><path d="M12 9v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16.6" r="1.1" fill="#fff"/></svg>
            </span>
            Resigning will affect approval levels, payroll, and the employee's access.
          </div>
          <div className="modal__foot">
            <button className="btn btn--secondary" type="button" onClick={() => setResignOpen(false)}>Cancel</button>
            <button className="btn btn--danger" type="button" onClick={() => { setResignOpen(false); showSuccess('Resignation Initiated', 'The resignation has been initiated. Please complete the resignation details.') }}>Proceed</button>
          </div>
        </div>
      </div>

      {/* ── Confirm Delete Modal ─────────────────────────────────── */}
      <div className={`modal-scrim${deleteOpen ? ' is-open' : ''}`} onClick={() => setDeleteOpen(false)}>
        <div className="modal modal--ask" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal__close" type="button" onClick={() => setDeleteOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="modal__title">Confirm Delete Employee</h2>
          <div className="modal__rule"></div>
          <p className="modal__body">You won't be able to recover employee and its data.</p>
          <div className="modal__foot">
            <button className="btn btn--secondary" type="button" onClick={() => setDeleteOpen(false)}>Cancel</button>
            <button className="btn btn--danger" type="button" onClick={() => { setDeleteOpen(false); showSuccess('Employee Deleted', 'The employee and all of their data have been permanently removed from your directory.') }}>Delete</button>
          </div>
        </div>
      </div>

      {/* ── Import (Add Bulk) Modal ──────────────────────────────── */}
      <div className={`modal-scrim${importOpen ? ' is-open' : ''}`} onClick={() => setImportOpen(false)}>
        <div className="modal modal--sheet modal--import" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <div className="modal__head">
            <button className="modal__close" type="button" onClick={() => setImportOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <h2 className="modal__title">Import Employee</h2>
          </div>
          <div className="modal__scroll">
            <div className="import-step__title">Download and complete the template</div>
            <div className="import-step__sub">Download the template below and write your data.</div>
            <div className="import-file">
              <span className="import-file__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </span>
              <span className="import-file__name">Template_Bulk_Add_Employee.xlsx</span>
              <button className="import-file__dl" type="button" aria-label="Download template">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>
              </button>
            </div>
            <div className="import-tips__title">Few tips:</div>
            <ul className="import-tips__list">
              <li>Employee ID must be unique.</li>
              <li>Ensure Organization, Branch, and Job Positions exist in Settings.</li>
              <li>Read the 'Instruction' tab in the spreadsheet file.</li>
              <li>See 'Information Data' for a list of valid input options.</li>
            </ul>
            <div className="import-upload-label">Upload spreadsheet</div>
            <label className="file-ctl">
              <span className="file-ctl__btn">Choose File</span>
              <span className="file-ctl__name">No file selected</span>
              <input type="file" style={{ display: 'none' }} />
            </label>
          </div>
          <div className="sheet-foot">
            <button className="btn btn--secondary" type="button" onClick={() => setImportOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={() => { setImportOpen(false); showSuccess('Employees Imported', 'Your spreadsheet has been uploaded. New employees will appear in the directory shortly.') }}>Submit</button>
          </div>
        </div>
      </div>

      {/* ── Success Modal ────────────────────────────────────────── */}
      <div className={`modal-scrim${successOpen ? ' is-open' : ''}`} onClick={() => setSuccessOpen(false)}>
        <div className="modal modal--success" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal__close" type="button" onClick={() => setSuccessOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div className="success__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="success__title">{successMsg.title}</h2>
          <p className="success__desc">{successMsg.desc}</p>
          <button className="btn btn--primary success__cta" type="button" onClick={() => setSuccessOpen(false)}>Done</button>
        </div>
      </div>
    </>
  )
}

/* ── OrgNode sub-component ──────────────────────────────────────── */
interface OrgNodeProps {
  variant: 'ocean' | 'sky' | 'sand'
  left: number; top: number
  pct: string; title: string; count: number
  name: string; dept: string
  toggle?: number
}
function OrgNode({ variant, left, top, pct, title, count, name, dept, toggle }: OrgNodeProps) {
  return (
    <div className={`org-node org-node--${variant}`} style={{ left, top }}>
      <div className="org-node__header">
        <span className="org-node__pct">{pct}</span>
        <span className="org-node__title">{title}</span>
        <span className="org-node__count"><i data-lucide="user-round"></i>{count}</span>
      </div>
      <div className="org-node__body">
        <div className="org-node__name">{name}</div>
        <div className="org-node__dept">{dept}</div>
      </div>
      {toggle !== undefined && (
        <button className="org-toggle">{toggle} <i data-lucide="chevron-down"></i></button>
      )}
    </div>
  )
}
