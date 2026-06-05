import { useState } from 'react'
import { Dialog, DialogContent } from '../shared/Dialog'
import { Search, ArrowLeft, Plus, Minus } from 'lucide-react'
import { FilterEngine } from '../shared/FilterEngine'
import { PrimaryButton, SecondaryButton } from './ConfirmModal'
import type { Employee, FilterKey } from '../../types'

interface Props {
  open: boolean
  employees: Employee[]
  selectedIds: string[]
  onSubmit: (ids: string[]) => void
  onClose: () => void
}

export function AssignEmployeeModal({ open, employees, selectedIds, onSubmit, onClose }: Props) {
  const [pane, setPane] = useState<'list' | 'filter'>('list')
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds)
  const [empSearch, setEmpSearch] = useState('')
  const [assignedSearch, setAssignedSearch] = useState('')

  // Filter engine state
  const [addedKeys, setAddedKeys] = useState<FilterKey[]>([])
  const [selections, setSelections] = useState<Record<FilterKey, string[]>>({} as Record<FilterKey, string[]>)
  const [activeKey, setActiveKey] = useState<FilterKey | null>(null)

  const available = employees.filter(e =>
    !localSelected.includes(e.id) &&
    `${e.id} ${e.name}`.toLowerCase().includes(empSearch.toLowerCase())
  )

  const assigned = employees.filter(e =>
    localSelected.includes(e.id) &&
    `${e.id} ${e.name}`.toLowerCase().includes(assignedSearch.toLowerCase())
  )

  function add(id: string) { setLocalSelected(p => [...p, id]) }
  function remove(id: string) { setLocalSelected(p => p.filter(x => x !== id)) }
  function addAll() { setLocalSelected(employees.map(e => e.id)) }
  function clearAll() { setLocalSelected([]) }

  function handleSubmit() {
    onSubmit(localSelected)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 rounded-[16px] overflow-hidden flex flex-col"
        style={{
          width: 'min(1200px, calc(100vw - 48px))',
          maxWidth: 'none',
          height: 'min(calc(100vh - 48px), 940px)',
          boxShadow: 'var(--shadow-popup)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-[22px] flex-shrink-0" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <h2 className="text-[26px] font-bold m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
            Assign Employee
          </h2>
        </div>

        {/* Body: two columns */}
        <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '1fr 1px 1fr' }}>
          {/* Left column */}
          <div className="flex flex-col min-h-0 px-7 pt-[22px] pb-2">
            {pane === 'list' ? (
              <>
                <ColHead title="Employees" action={<LinkBtn onClick={addAll}>Add all</LinkBtn>} />
                <Tools search={empSearch} onSearch={setEmpSearch} onFilter={() => setPane('filter')} />
                <EmpList>
                  {available.length ? available.map(e => (
                    <EmpRow key={e.id} emp={e} action="add" onClick={() => add(e.id)} />
                  )) : (
                    <div className="h-full min-h-[140px] flex items-center justify-center text-[14px] font-medium text-center" style={{ color: 'var(--fg-4)' }}>No employees to add.</div>
                  )}
                </EmpList>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-[14px]">
                  <button
                    type="button"
                    onClick={() => setPane('list')}
                    className="inline-flex items-center gap-2 font-semibold text-[15px] bg-transparent border-none cursor-pointer p-0"
                    style={{ color: 'var(--fg-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-secondary-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-2)' }}
                  >
                    <ArrowLeft size={20} />
                    Back to select employee
                  </button>
                  {addedKeys.length > 0 && (
                    <LinkBtn onClick={() => { setAddedKeys([]); setSelections({} as Record<FilterKey, string[]>); setActiveKey(null) }}>
                      Reset filter
                    </LinkBtn>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto -mx-1 px-1">
                  <FilterEngine
                    addedKeys={addedKeys}
                    selections={selections}
                    activeKey={activeKey}
                    onAdd={k => { setAddedKeys(p => [...p, k]); setActiveKey(k) }}
                    onRemove={k => {
                      setAddedKeys(p => p.filter(x => x !== k))
                      setActiveKey(p => p === k ? (addedKeys.find(x => x !== k) ?? null) : p)
                    }}
                    onToggle={k => setActiveKey(p => p === k ? null : k)}
                    onSelect={(k, items) => setSelections(p => ({ ...p, [k]: items }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
                  <SecondaryButton onClick={() => setPane('list')}>Apply Filter</SecondaryButton>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div style={{ background: 'var(--border-1)' }} />

          {/* Right column */}
          <div className="flex flex-col min-h-0 px-7 pt-[22px] pb-2">
            <ColHead
              title={`Assigned employees (${localSelected.length})`}
              action={<LinkBtn onClick={clearAll}>Clear selection</LinkBtn>}
            />
            <div className="mb-3">
              <SearchInput value={assignedSearch} onChange={setAssignedSearch} placeholder="Search assigned" />
            </div>
            <EmpList>
              {assigned.length ? assigned.map(e => (
                <EmpRow key={e.id} emp={e} action="remove" onClick={() => remove(e.id)} />
              )) : (
                <div className="h-full min-h-[140px] flex items-center justify-center text-[14px] font-medium text-center" style={{ color: 'var(--fg-4)' }}>
                  No employees assigned yet.<br />Pick from the list on the left.
                </div>
              )}
            </EmpList>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-[18px] flex-shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ColHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-[18px] m-0" style={{ color: 'var(--fg-1)' }}>{title}</h3>
      {action}
    </div>
  )
}

function Tools({ search, onSearch, onFilter }: { search: string; onSearch: (v: string) => void; onFilter: () => void }) {
  return (
    <div className="flex gap-3 mb-3">
      <SearchInput value={search} onChange={onSearch} placeholder="Search Employee" />
      <button
        type="button"
        onClick={onFilter}
        className="flex-shrink-0 h-[48px] px-[26px] rounded-[8px] font-bold text-[15px] cursor-pointer border-none transition-all duration-[180ms]"
        style={{
          background: '#fff',
          boxShadow: 'var(--shadow-inset-rim)',
          color: 'var(--color-secondary-700)',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-press)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-rim)' }}
      >
        Filter
      </button>
    </div>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div
      className="flex-1 flex items-center gap-2 h-[48px] rounded-[8px] px-[14px] transition-all duration-[180ms]"
      style={{ background: 'var(--color-cloud)', boxShadow: 'var(--shadow-inset-rim)' }}
    >
      <input
        className="flex-1 min-w-0 border-none bg-transparent outline-none text-[15px] font-medium"
        style={{ color: 'var(--fg-1)' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <Search size={20} style={{ color: 'var(--fg-3)' }} />
    </div>
  )
}

function EmpList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto -mx-2 px-2 py-1" style={{ scrollbarWidth: 'thin' }}>
      {children}
    </div>
  )
}

function EmpRow({ emp, action, onClick }: { emp: Employee; action: 'add' | 'remove'; onClick: () => void }) {
  return (
    <div
      className="group flex items-center gap-[14px] px-3 py-3 rounded-[8px] cursor-pointer transition-colors"
      onClick={onClick}
      style={{ background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span
        className="w-[48px] h-[48px] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b9def2 0%, #6ba9d2 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)' }}
      >
        <svg viewBox="0 0 48 48" fill="none" width="26" height="26">
          <circle cx="24" cy="18" r="8" fill="white" opacity="0.92"/>
          <path d="M10 42c1.5-9 7.5-13 14-13s12.5 4 14 13z" fill="white" opacity="0.92"/>
        </svg>
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-semibold text-[17px] leading-tight truncate" style={{ color: 'var(--fg-1)' }}>
          {emp.id} - {emp.name}
        </span>
        <span className="text-[14px] font-medium" style={{ color: 'var(--color-silver)' }}>{emp.location}</span>
      </div>
      <span
        className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: action === 'remove' ? 'var(--color-error-500)' : 'var(--color-secondary-600)' }}
      >
        {action === 'add' ? <Plus size={20} /> : <Minus size={20} />}
      </span>
    </div>
  )
}

function LinkBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-[14px] underline cursor-pointer bg-transparent border-none p-0 transition-colors"
      style={{ color: 'var(--color-secondary-600)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-secondary-800)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-secondary-600)' }}
    >
      {children}
    </button>
  )
}
