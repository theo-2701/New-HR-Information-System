import { useState, useEffect, useRef } from 'react'

const PRODUCTS = [
  { id: 'HRIS',        icon: 'users',      name: 'HRIS',                   desc: 'Human Resource Information System' },
  { id: 'Recruitment', icon: 'briefcase',  name: 'Recruitment',            desc: 'Talent pipeline & assessments' },
  { id: 'Performance', icon: 'award',      name: 'Performance Management', desc: 'Reviews, goals & calibration' },
  { id: 'Insights',    icon: 'line-chart', name: 'Insights',               desc: 'AI workforce analytics' },
]

export const NOTIFS = [
  { cat: 'payroll',       icon: 'wallet',       iconClass: 'notif-icon--payroll',    source: 'SEVAKA Payroll',     time: '13:47',   unread: true,  tag: 'Payroll',       tagClass: 'tag-payroll',    msg: 'Proses kalkulasi <b>payroll periode 05/2026</b> selesai. Siap untuk persetujuan.' },
  { cat: 'timeoff',       icon: 'calendar-x-2', iconClass: 'notif-icon--timeoff',    source: 'Lia Permata',        time: '11:20',   unread: true,  tag: 'Time Off',      tagClass: 'tag-timeoff',    msg: 'Mengajukan <b>cuti tahunan 3 hari</b> (10–12 Jun) — menunggu persetujuan Anda.' },
  { cat: 'attendance',    icon: 'clock-alert',  iconClass: 'notif-icon--attendance', source: 'SEVAKA Attendance',  time: '09:15',   unread: true,  tag: 'Attendance',    tagClass: 'tag-attendance', msg: 'Anda belum melakukan <b>clock-out</b> kemarin (27 Mei). Mohon konfirmasi.' },
  { cat: 'reimbursement', icon: 'receipt',      iconClass: 'notif-icon--reimburse',  source: 'SEVAKA Finance',     time: 'Kemarin', unread: false, tag: 'Reimbursement', tagClass: 'tag-reimburse',  msg: 'Reimbursement <b>Rp 1.250.000</b> telah disetujui dan akan dibayar 31 Mei.' },
  { cat: 'mpp',           icon: 'users-round',  iconClass: 'notif-icon--mpp',        source: 'Theodorus F.K.',     time: '2 hari',  unread: false, tag: 'MPP',           tagClass: 'tag-mpp',        msg: '<b>Manpower Plan Q3 2026</b> telah diperbarui — silakan tinjau alokasi divisi Engineering.' },
]

interface TopnavProps {
  bellActive?: boolean
  onInboxNavigate?: () => void
}

export default function Topnav({ bellActive = false, onInboxNavigate }: TopnavProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState('HRIS')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFS)
  const [notifTab, setNotifTab] = useState<'all' | 'unread' | 'mentions'>('all')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const pickerRef = useRef<HTMLDivElement>(null)
  const notifRef  = useRef<HTMLDivElement>(null)
  const userRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false)
      if (userRef.current   && !userRef.current.contains(e.target as Node))   setUserMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': '1.75' } })
  })

  const unreadCount = notifs.filter(n => n.unread).length

  function markAllRead() {
    setNotifs(ns => ns.map(n => ({ ...n, unread: false })))
  }

  function visibleNotifs() {
    if (notifTab === 'unread')   return notifs.filter(n => n.unread)
    if (notifTab === 'mentions') return notifs.filter(n => n.cat === 'timeoff')
    return notifs
  }

  function handleNotifItemClick(cat: string) {
    if (onInboxNavigate) onInboxNavigate()
    else window.location.hash = `#inbox?cat=${cat}`
  }

  function handleInboxCta(e: React.MouseEvent) {
    e.preventDefault()
    setNotifOpen(false)
    if (onInboxNavigate) onInboxNavigate()
  }

  return (
    <header className="topnav">
      {/* Brand */}
      <div className="brand">
        <div className="brand__s">S</div>
        <div className="brand__text">
          <span className="brand__name">SEVAKA</span>
          <span className="brand__sub">Human Resource Information System</span>
        </div>
      </div>

      <div className="topnav__divider" />

      {/* Product picker */}
      <div className={`product-picker${pickerOpen ? ' is-open' : ''}`} ref={pickerRef}>
        <button
          className="product-picker__btn"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          onClick={e => { e.stopPropagation(); setPickerOpen(o => !o) }}
        >
          <span className="product-picker__now">{activeProduct}</span>
          <svg className="product-picker__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div className="product-menu" role="listbox">
          <div className="product-menu__head">SEVAKA products</div>
          {PRODUCTS.map(p => (
            <button
              key={p.id}
              className={`product-opt${activeProduct === p.id ? ' is-on' : ''}`}
              role="option"
              onClick={() => { setActiveProduct(p.id); setPickerOpen(false) }}
            >
              <span className="product-opt__icon"><i data-lucide={p.icon} /></span>
              <span className="product-opt__text">
                <span className="product-opt__name">{p.name}</span>
                <span className="product-opt__desc">{p.desc}</span>
              </span>
              {activeProduct === p.id && (
                <svg className="product-opt__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right cluster */}
      <div className="topnav__right">
        <button className="pill-ai" type="button">
          <i data-lucide="sparkles" />SUMMARIZE DATA
        </button>
        <button className="icon-btn" aria-label="add"><i data-lucide="plus" /></button>
        <button className="icon-btn" aria-label="search"><i data-lucide="search" /></button>

        {/* Notification bell */}
        <div className="notif-wrap pos-rel" ref={notifRef}>
          <button
            className={`icon-btn${bellActive ? ' is-active-page' : ''}`}
            aria-label="notifications"
            onClick={e => { e.stopPropagation(); setNotifOpen(o => !o) }}
          >
            <i data-lucide="bell" />
            {unreadCount > 0 && <span className="dot" aria-hidden="true" />}
          </button>

          <div className={`notif-pop${notifOpen ? ' is-open' : ''}`} role="dialog" aria-label="Notifications">
            <div className="notif-pop__arrow" aria-hidden="true" />
            <header className="notif-pop__head">
              <div className="notif-pop__heading">
                <span className="notif-pop__title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="notif-pop__badge">{unreadCount} new</span>
                )}
              </div>
              <button className="notif-pop__markread" type="button" onClick={markAllRead}>
                Mark all read
              </button>
            </header>

            <div className="notif-pop__tabs" role="tablist">
              {(['all', 'unread', 'mentions'] as const).map(t => (
                <button
                  key={t}
                  className={`notif-pop__tab${notifTab === t ? ' is-on' : ''}`}
                  onClick={() => setNotifTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <ul className="notif-pop__list">
              {visibleNotifs().map((n, i) => (
                <li
                  key={i}
                  className={`notif-item${n.unread ? ' is-unread' : ''}`}
                  data-cat={n.cat}
                  onClick={() => handleNotifItemClick(n.cat)}
                >
                  <span className={`notif-item__icon ${n.iconClass}`}>
                    <i data-lucide={n.icon} />
                  </span>
                  <div className="notif-item__body">
                    <div className="notif-item__row">
                      <span className="notif-item__source">{n.source}</span>
                      <span className="notif-item__time">{n.time}</span>
                    </div>
                    <p className="notif-item__msg" dangerouslySetInnerHTML={{ __html: n.msg }} />
                    <span className={`notif-item__tag ${n.tagClass}`}>{n.tag}</span>
                  </div>
                  <span className="notif-item__unread" aria-label="unread" />
                </li>
              ))}
            </ul>

            <footer className="notif-pop__foot">
              <a className="notif-pop__cta" href="#inbox" onClick={handleInboxCta}>
                <span>Lihat semua di Inbox</span>
                <i data-lucide="arrow-right" />
              </a>
            </footer>
          </div>
        </div>

        <button className="icon-btn" aria-label="apps"><i data-lucide="layout-grid" /></button>

        {/* User chip */}
        <div className="user-chip pos-rel" ref={userRef}>
          <div className="user-chip__avatar" title="Tony Stark">
            <svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="avBg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a8d479" />
                  <stop offset="100%" stopColor="#6ba23f" />
                </linearGradient>
              </defs>
              <rect width="42" height="42" fill="url(#avBg)" />
              <ellipse cx="21" cy="18" rx="9" ry="10" fill="#f0c39a" />
              <path d="M14 12 q7 -8 14 0 q1 4 -2 6 q-3 -4 -10 -4 q-3 0 -4 4 q-2 -2 2 -6z" fill="#3d2415" />
              <path d="M14 22 q1 6 7 7 q6 -1 7 -7 q-3 2 -7 2 q-4 0 -7 -2z" fill="#3d2415" />
              <path d="M6 42 q3 -10 15 -10 q12 0 15 10z" fill="#1f4a26" />
            </svg>
          </div>
          <div className="user-chip__text">
            <span className="user-chip__name">Tony Stark</span>
            <span className="user-chip__role">Administrator</span>
          </div>
          <button
            className="icon-btn"
            aria-label="user menu"
            style={{ background: 'transparent', width: '24px', height: '24px', boxShadow: 'none' }}
            onClick={e => { e.stopPropagation(); setUserMenuOpen(o => !o) }}
          >
            <i data-lucide="chevron-down" />
          </button>
          <div className={`menu${userMenuOpen ? ' is-open' : ''}`}>
            <button className="menu__item"><i data-lucide="user" />My profile</button>
            <button className="menu__item"><i data-lucide="settings" />Account settings</button>
            <button className="menu__item"><i data-lucide="help-circle" />Help &amp; support</button>
            <div className="menu__divider" />
            <button className="menu__item" style={{ color: 'var(--color-error-600)' }}>
              <i data-lucide="log-out" />Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
