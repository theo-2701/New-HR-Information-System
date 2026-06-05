import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { FILTER_DEFS } from '../../services/payrollService'
import type { FilterDef, FilterKey } from '../../types'

interface Props {
  addedKeys: FilterKey[]
  selections: Record<FilterKey, string[]>
  activeKey: FilterKey | null
  onAdd: (key: FilterKey) => void
  onRemove: (key: FilterKey) => void
  onToggle: (key: FilterKey) => void
  onSelect: (key: FilterKey, items: string[]) => void
}

export function FilterEngine({ addedKeys, selections, activeKey, onAdd, onRemove, onToggle, onSelect }: Props) {
  const [lovOpen, setLovOpen] = useState(false)
  const [lovSearch, setLovSearch] = useState('')
  const lovRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  // Close LOV when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!lovRef.current?.contains(e.target as Node) && e.target !== addBtnRef.current) {
        setLovOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const availableDefs = FILTER_DEFS.filter(d => !addedKeys.includes(d.key))
  const filteredAvail = lovSearch
    ? availableDefs.filter(d => d.title.toLowerCase().includes(lovSearch.toLowerCase()))
    : availableDefs

  if (addedKeys.length === 0) {
    return (
      <EmptyState
        addBtnRef={addBtnRef}
        lovOpen={lovOpen}
        setLovOpen={setLovOpen}
        lovRef={lovRef}
        lovSearch={lovSearch}
        setLovSearch={setLovSearch}
        filteredAvail={filteredAvail}
        onAdd={key => { onAdd(key); setLovOpen(false); setLovSearch('') }}
      />
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-0">
        {addedKeys.map(key => {
          const def = FILTER_DEFS.find(d => d.key === key)!
          const isOpen = activeKey === key
          const sel = selections[key] ?? []
          return (
            <FilterBlock
              key={key}
              def={def}
              isOpen={isOpen}
              selections={sel}
              onToggle={() => onToggle(key)}
              onRemove={() => onRemove(key)}
              onSelect={items => onSelect(key, items)}
            />
          )
        })}
      </div>

      {/* Footer add button */}
      <div className="relative mt-4">
        <AddFilterButton ref={addBtnRef} onClick={() => { setLovOpen(v => !v); setLovSearch('') }} />
        {lovOpen && (
          <LovMenu
            ref={lovRef}
            search={lovSearch}
            onSearch={setLovSearch}
            items={filteredAvail}
            onPick={key => { onAdd(key); setLovOpen(false); setLovSearch('') }}
          />
        )}
      </div>
    </div>
  )
}

function FilterBlock({ def, isOpen, selections, onToggle, onRemove, onSelect }: {
  def: FilterDef
  isOpen: boolean
  selections: string[]
  onToggle: () => void
  onRemove: () => void
  onSelect: (items: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? def.items.filter(i => i.toLowerCase().includes(search.toLowerCase()))
    : def.items
  const allVisible = filtered.every(i => selections.includes(i))

  function toggle(item: string) {
    onSelect(
      selections.includes(item)
        ? selections.filter(s => s !== item)
        : [...selections, item]
    )
  }

  function toggleAll() {
    if (allVisible) {
      onSelect(selections.filter(s => !filtered.includes(s)))
    } else {
      const next = [...selections]
      filtered.forEach(i => { if (!next.includes(i)) next.push(i) })
      onSelect(next)
    }
  }

  const summary = selections.length ? selections.join(', ') : '…'

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
      {/* Head row */}
      <div className="flex items-center gap-2">
        <span className="flex-1 font-bold text-[15px]" style={{ color: 'var(--fg-1)' }}>{def.title}</span>
        <button type="button" onClick={onRemove} className="p-1 rounded cursor-pointer border-none bg-transparent" style={{ color: 'var(--fg-4)' }}>
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded cursor-pointer border-none bg-transparent transition-transform duration-[180ms]"
          style={{ color: 'var(--fg-3)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Summary line */}
      {!isOpen && (
        <p className="mt-1 text-[13px] font-medium truncate" style={{ color: 'var(--fg-3)' }}>
          is any of <span style={{ color: selections.length ? 'var(--color-secondary-700)' : 'var(--fg-4)' }}>{summary}</span>
        </p>
      )}

      {/* Expanded body */}
      {isOpen && (
        <div className="mt-3 flex flex-col gap-2">
          {/* Search */}
          <div
            className="flex items-center gap-2 h-10 rounded-[8px] px-3"
            style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)' }}
          >
            <input
              className="flex-1 min-w-0 border-none bg-transparent outline-none text-[14px]"
              style={{ color: 'var(--fg-1)' }}
              placeholder={`Search ${def.title.toLowerCase()}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={16} style={{ color: 'var(--fg-4)' }} />
          </div>

          {/* Options (max 5 visible) */}
          <div className="flex flex-col overflow-y-auto" style={{ maxHeight: '180px' }}>
            <FilterOpt
              checked={allVisible && filtered.length > 0}
              indeterminate={selections.some(s => filtered.includes(s)) && !allVisible}
              label="Select all"
              onChange={toggleAll}
            />
            {filtered.map(item => (
              <FilterOpt
                key={item}
                checked={selections.includes(item)}
                label={item}
                onChange={() => toggle(item)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-[13px] py-2 px-2" style={{ color: 'var(--fg-4)' }}>No matching results</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterOpt({ checked, indeterminate = false, label, onChange }: {
  checked: boolean
  indeterminate?: boolean
  label: string
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className="flex items-center gap-[10px] py-[7px] px-2 cursor-pointer rounded-[6px] hover:bg-[#f3fafd] transition-colors">
      <input ref={ref} type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className="w-5 h-5 flex-shrink-0 rounded-[5px] flex items-center justify-center transition-all"
        style={{
          background: checked ? 'var(--color-error-500)' : '#fff',
          boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--color-error-500)',
        }}
      >
        {checked && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {indeterminate && !checked && <span className="w-[10px] h-[2px] rounded" style={{ background: 'var(--color-error-500)' }} />}
      </span>
      <span className="text-[14px] font-medium" style={{ color: 'var(--fg-2)' }}>{label}</span>
    </label>
  )
}

// ── LOV (List of Values) menu ──────────────────────────────────────────────

const AddFilterButton = ({ onClick, ref }: { onClick: () => void; ref: React.RefObject<HTMLButtonElement | null> }) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-3 h-[50px] px-[14px] pr-[22px] rounded-[8px] font-bold text-[15px] cursor-pointer transition-all duration-[180ms]"
    style={{
      border: '1px solid var(--border-2)',
      background: '#fff',
      boxShadow: 'var(--shadow-inset-rim)',
      color: 'var(--color-secondary-600)',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
  >
    <span
      className="w-[26px] h-[26px] flex items-center justify-center rounded-[4px] flex-shrink-0"
      style={{ background: 'var(--color-secondary-500)' }}
    >
      <Plus size={16} color="white" />
    </span>
    Add Filter
  </button>
)

const LovMenu = ({ ref, search, onSearch, items, onPick }: {
  ref: React.RefObject<HTMLDivElement | null>
  search: string
  onSearch: (v: string) => void
  items: FilterDef[]
  onPick: (key: FilterKey) => void
}) => (
  <div
    ref={ref}
    className="absolute left-0 top-full mt-2 z-50 rounded-[12px] overflow-hidden min-w-[240px]"
    style={{
      background: '#fff',
      border: '1px solid var(--border-1)',
      boxShadow: 'var(--shadow-popup)',
    }}
  >
    <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <Search size={16} style={{ color: 'var(--fg-4)' }} />
      <input
        autoFocus
        className="flex-1 min-w-0 border-none bg-transparent outline-none text-[14px]"
        style={{ color: 'var(--fg-1)' }}
        placeholder="Search filter"
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
    </div>
    <div className="py-1 max-h-[220px] overflow-y-auto">
      {items.map(d => (
        <button
          key={d.key}
          type="button"
          onClick={() => onPick(d.key)}
          className="w-full text-left px-4 py-[10px] text-[14px] font-semibold cursor-pointer border-none bg-transparent transition-colors"
          style={{ color: 'var(--fg-1)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {d.title}
        </button>
      ))}
      {items.length === 0 && (
        <p className="px-4 py-3 text-[14px]" style={{ color: 'var(--fg-4)' }}>No matching filter</p>
      )}
    </div>
  </div>
)

function EmptyState({ addBtnRef, lovOpen, setLovOpen, lovRef, lovSearch, setLovSearch, filteredAvail, onAdd }: {
  addBtnRef: React.RefObject<HTMLButtonElement | null>
  lovOpen: boolean
  setLovOpen: (v: boolean | ((v: boolean) => boolean)) => void
  lovRef: React.RefObject<HTMLDivElement | null>
  lovSearch: string
  setLovSearch: (v: string) => void
  filteredAvail: FilterDef[]
  onAdd: (key: FilterKey) => void
}) {
  return (
    <div className="flex flex-col items-center py-10 gap-3 text-center">
      <span style={{ color: 'var(--fg-4)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4.5h18l-7 8.5v6l-4 2v-8z"/>
        </svg>
      </span>
      <p className="font-bold text-[16px] m-0" style={{ color: 'var(--fg-2)' }}>No filters have been set yet</p>
      <p className="text-[14px] m-0" style={{ color: 'var(--fg-3)' }}>Your filter will be displayed here</p>
      <div className="relative mt-2">
        <AddFilterButton ref={addBtnRef} onClick={() => { setLovOpen(v => !v); setLovSearch('') }} />
        {lovOpen && (
          <LovMenu
            ref={lovRef}
            search={lovSearch}
            onSearch={setLovSearch}
            items={filteredAvail}
            onPick={onAdd}
          />
        )}
      </div>
    </div>
  )
}
