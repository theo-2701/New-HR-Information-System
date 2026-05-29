import { useState, useEffect } from 'react'

const NAV = [
  { group: 'emp-profile',  icon: 'user',         label: 'Employee Profile', items: ['General', 'Time Management', 'Payroll', 'Finance', 'Files', 'Assets', 'History'] },
  { group: 'employees',    icon: 'users',         label: 'Employees',        items: ['Employee Directory', 'Manpower Planning', 'New Joiner Submission', 'Onboarding', 'Offboarding', 'Reprimand'] },
  { group: 'time',         icon: 'clock',         label: 'Time',             items: ['Time Off', 'Attendance', 'Overtime', 'Calender', 'Scheduler', 'On Call'] },
  { group: 'finance',      icon: 'credit-card',   label: 'Finance',          items: ['Benefit Reimbursement', 'Loan', 'Cash Advance'] },
  { group: 'payroll',      icon: 'wallet',        label: 'Payroll',          items: ['Payroll processing', 'Payroll components', 'Tax simulation', 'Compliance', 'Payroll allocation', 'Reports'] },
  { group: 'productivity', icon: 'bar-chart-2',   label: 'Productivity',     items: ['Projects & Tasks', 'Forms & Surveys', 'Document Templates'] },
  { group: 'company',      icon: 'building-2',    label: 'Company',          items: ['Assets', 'Announcement', 'Activity Log', 'Notification', 'Files', 'Report Builder'] },
  { group: 'applications', icon: 'layout-grid',   label: 'Applications',     items: [] },
  { group: 'integrations', icon: 'shuffle',       label: 'Integrations',     items: [] },
  { group: 'settings',     icon: 'settings',      label: 'Settings',         items: [] },
]

interface SidebarProps {
  dashboardActive?: boolean
  onDashboardClick?: () => void
}

export default function Sidebar({ dashboardActive = false, onDashboardClick }: SidebarProps) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('sidebarExpanded') === 'true' } catch { return false }
  })
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [activeBtn, setActiveBtn] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': '1.75' } })
  })

  function toggleExpand() {
    setExpanded(prev => {
      const next = !prev
      try { localStorage.setItem('sidebarExpanded', String(next)) } catch { /* noop */ }
      if (!next) setOpenGroup(null)
      return next
    })
  }

  function handleGroupClick(group: string, hasSub: boolean) {
    if (!expanded && hasSub) {
      setExpanded(true)
      try { localStorage.setItem('sidebarExpanded', 'true') } catch { /* noop */ }
      setTimeout(() => {
        setOpenGroup(group)
        setActiveBtn(group)
        setActiveItem(null)
      }, 240)
      return
    }
    if (hasSub) {
      setOpenGroup(prev => prev === group ? null : group)
      setActiveBtn(group)
      setActiveItem(null)
    } else {
      setActiveBtn(group)
      setActiveItem(null)
      setOpenGroup(null)
    }
  }

  function handleItemClick(item: string) {
    setActiveItem(item)
  }

  function handleDashboardClick() {
    setOpenGroup(null)
    setActiveBtn(null)
    setActiveItem(null)
    if (onDashboardClick) onDashboardClick()
  }

  return (
    <aside className={`sidebar${expanded ? ' is-expanded' : ''}`} id="sidebar">
      <div className="sidebar__header">
        <button className="sidebar__toggle" aria-label="Toggle sidebar" onClick={toggleExpand}>
          <i data-lucide="panel-left" />
        </button>
      </div>

      <button
        className={`sidebar__dashboard${dashboardActive ? ' is-on' : ''}`}
        data-route="home"
        onClick={handleDashboardClick}
      >
        <i data-lucide="layout-dashboard" className="sidebar__dashboard-icon" />
        <span className="sidebar__dashboard-label">Dashboard</span>
      </button>

      <nav className="sidebar__nav">
        {NAV.map(g => {
          const hasSub = g.items.length > 0
          const isOpen = openGroup === g.group
          const isActive = activeBtn === g.group
          return (
            <div key={g.group} className={`sidebar__group${isOpen ? ' is-open' : ''}`} data-group={g.group}>
              <button
                className={`sidebar__menu-btn${isActive ? ' is-on' : ''}`}
                onClick={() => handleGroupClick(g.group, hasSub)}
              >
                <i data-lucide={g.icon} />
                <span className="sidebar__menu-label">{g.label}</span>
                {hasSub && (
                  <svg className="sidebar__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>
              {hasSub && (
                <div className="sidebar__submenu">
                  {g.items.map(item => (
                    <button
                      key={item}
                      className={`sidebar__submenu-item${activeItem === item ? ' is-on' : ''}`}
                      onClick={e => { e.stopPropagation(); handleItemClick(item) }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <footer className="sidebar__footer">
        <button className="sidebar__logout" aria-label="Logout">
          <i data-lucide="log-out" />
        </button>
        <span className="sidebar__footer-text">Company ID: [ID]</span>
      </footer>
    </aside>
  )
}
