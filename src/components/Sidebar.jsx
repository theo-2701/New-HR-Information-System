import { useState, useEffect } from 'react'

const NAV_GROUPS = [
  { id: 'emp-profile',  icon: 'user',        label: 'Employee Profile',
    items: ['General','Time Management','Payroll','Finance','Files','Assets','History'] },
  { id: 'employees',   icon: 'users',       label: 'Employees',
    items: ['Employee Directory','Manpower Planning','New Joiner Submission','Onboarding','Offboarding','Reprimand'] },
  { id: 'time',        icon: 'clock',       label: 'Time',
    items: ['Time Off','Attendance','Overtime','Calendar','Scheduler','On Call'] },
  { id: 'finance',     icon: 'credit-card', label: 'Finance',
    items: ['Benefit Reimbursement','Loan','Cash Advance'] },
  { id: 'payroll',     icon: 'wallet',      label: 'Payroll',
    items: ['Payroll processing','Payroll components','Tax simulation','Compliance','Payroll allocation','Reports'] },
  { id: 'productivity',icon: 'bar-chart-2', label: 'Productivity',
    items: ['Projects & Tasks','Forms & Surveys','Document Templates'] },
  { id: 'company',     icon: 'building-2',  label: 'Company',
    items: ['Assets','Announcement','Activity Log','Notification','Files','Report Builder'] },
  { id: 'applications',icon: 'layout-grid', label: 'Applications', items: [] },
  { id: 'integrations',icon: 'shuffle',     label: 'Integrations', items: [] },
  { id: 'settings',    icon: 'settings',    label: 'Settings',     items: [] },
]

export default function Sidebar({ current, goTo }) {
  const [expanded, setExpanded] = useState(() => localStorage.getItem('sidebarExpanded') === 'true')
  const [openGroup, setOpenGroup] = useState(null)
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  function toggleSidebar() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebarExpanded', next)
    if (!next) setOpenGroup(null)
  }

  function handleGroupClick(group) {
    if (!expanded && group.items.length > 0) {
      setExpanded(true)
      localStorage.setItem('sidebarExpanded', 'true')
      setTimeout(() => setOpenGroup(group.id), 240)
      return
    }
    if (group.items.length > 0) {
      setOpenGroup(g => g === group.id ? null : group.id)
    }
    // items with no submenu: no special action
  }

  function handleSubItem(e, groupId, item) {
    e.stopPropagation()
    setActiveItem(`${groupId}__${item}`)
  }

  return (
    <aside className={`sidebar${expanded ? ' is-expanded' : ''}`} id="sidebar" aria-label="Main navigation">

      <div className="sidebar__header">
        <button className="sidebar__toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <i data-lucide="panel-left"></i>
        </button>
      </div>

      <button
        className={`sidebar__dashboard${current === 'dashboard' ? ' is-on' : ''}`}
        onClick={() => { goTo('dashboard'); setOpenGroup(null); setActiveItem(null) }}
        title={!expanded ? 'Dashboard' : undefined}
      >
        <i data-lucide="layout-dashboard" className="sidebar__dashboard-icon"></i>
        <span className="sidebar__dashboard-label">Dashboard</span>
      </button>

      <nav className="sidebar__nav">
        {NAV_GROUPS.map(group => (
          <div
            key={group.id}
            className={`sidebar__group${openGroup === group.id ? ' is-open' : ''}`}
          >
            <button
              className={`sidebar__menu-btn${activeItem?.startsWith(group.id + '__') ? ' is-on' : ''}`}
              onClick={() => handleGroupClick(group)}
              title={!expanded ? group.label : undefined}
            >
              <i data-lucide={group.icon}></i>
              <span className="sidebar__menu-label">{group.label}</span>
              {group.items.length > 0 && (
                <svg className="sidebar__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
            </button>
            {group.items.length > 0 && (
              <div className="sidebar__submenu">
                {group.items.map(item => (
                  <button
                    key={item}
                    className={`sidebar__submenu-item${activeItem === `${group.id}__${item}` ? ' is-on' : ''}`}
                    onClick={e => handleSubItem(e, group.id, item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <footer className="sidebar__footer">
        <button className="sidebar__logout" onClick={() => goTo('signin')} aria-label="Logout">
          <i data-lucide="log-out"></i>
        </button>
        <span className="sidebar__footer-text">Company ID: [ID]</span>
      </footer>
    </aside>
  )
}
