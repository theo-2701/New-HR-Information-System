import { useState, useEffect, useRef } from 'react'
import { useT, useLocaleStore } from '@/i18n'

const PRODUCTS = [
  { id: 'HRIS',        icon: 'users',      name: 'HRIS',                   desc: 'Human Resource Information System' },
  { id: 'Recruitment', icon: 'briefcase',  name: 'Recruitment',            desc: 'Talent pipeline & assessments' },
  { id: 'Performance', icon: 'award',      name: 'Performance Management', desc: 'Reviews, goals & calibration' },
  { id: 'Insights',    icon: 'line-chart', name: 'Insights',               desc: 'AI workforce analytics' },
]

const NOTIF_META = [
  { cat: 'payroll',       icon: 'wallet',       iconClass: 'notif-icon--payroll',    unread: true  },
  { cat: 'timeoff',       icon: 'calendar-x-2', iconClass: 'notif-icon--timeoff',    unread: true  },
  { cat: 'attendance',    icon: 'clock-alert',  iconClass: 'notif-icon--attendance', unread: true  },
  { cat: 'reimbursement', icon: 'receipt',      iconClass: 'notif-icon--reimburse',  unread: false },
  { cat: 'mpp',           icon: 'users-round',  iconClass: 'notif-icon--mpp',        unread: false },
]

interface TopnavProps {
  bellActive?: boolean
  onInboxNavigate?: () => void
}

export default function Topnav({ bellActive = false, onInboxNavigate }: TopnavProps) {
  const t = useT()
  const n = t.notifications
  const { locale, toggleLocale } = useLocaleStore()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState('HRIS')
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadState, setUnreadState] = useState(NOTIF_META.map(m => m.unread))
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

  const unreadCount = unreadState.filter(Boolean).length

  function markAllRead() {
    setUnreadState(NOTIF_META.map(() => false))
  }

  const notifs = NOTIF_META.map((meta, i) => ({
    ...meta,
    ...n.items[i],
    unread: unreadState[i],
  }))

  function visibleNotifs() {
    if (notifTab === 'unread')   return notifs.filter(x => x.unread)
    if (notifTab === 'mentions') return notifs.filter(x => x.cat === 'timeoff')
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

  const tabKeys = ['all', 'unread', 'mentions'] as const

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

        {/* Language toggle */}
        <button
          className="icon-btn"
          aria-label="Toggle language"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
          onClick={toggleLocale}
          style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '.04em', minWidth: '36px' }}
        >
          {locale === 'en' ? 'EN' : 'ID'}
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

          <div className={`notif-pop${notifOpen ? ' is-open' : ''}`} role="dialog" aria-label={n.title}>
            <div className="notif-pop__arrow" aria-hidden="true" />
            <header className="notif-pop__head">
              <div className="notif-pop__heading">
                <span className="notif-pop__title">{n.title}</span>
                {unreadCount > 0 && (
                  <span className="notif-pop__badge">{unreadCount} {n.new}</span>
                )}
              </div>
              <button className="notif-pop__markread" type="button" onClick={markAllRead}>
                {n.markAllRead}
              </button>
            </header>

            <div className="notif-pop__tabs" role="tablist">
              {tabKeys.map(tk => (
                <button
                  key={tk}
                  className={`notif-pop__tab${notifTab === tk ? ' is-on' : ''}`}
                  onClick={() => setNotifTab(tk)}
                >
                  {n.tabs[tk]}
                </button>
              ))}
            </div>

            <ul className="notif-pop__list">
              {visibleNotifs().map((notif, i) => (
                <li
                  key={i}
                  className={`notif-item${notif.unread ? ' is-unread' : ''}`}
                  data-cat={notif.cat}
                  onClick={() => handleNotifItemClick(notif.cat)}
                >
                  <span className={`notif-item__icon ${notif.iconClass}`}>
                    <i data-lucide={notif.icon} />
                  </span>
                  <div className="notif-item__body">
                    <div className="notif-item__row">
                      <span className="notif-item__source">{notif.source}</span>
                      <span className="notif-item__time">{notif.time}</span>
                    </div>
                    <p className="notif-item__msg" dangerouslySetInnerHTML={{ __html: notif.msg }} />
                    <span className={`notif-item__tag tag-${notif.cat}`}>{notif.tag}</span>
                  </div>
                  <span className="notif-item__unread" aria-label="unread" />
                </li>
              ))}
            </ul>

            <footer className="notif-pop__foot">
              <a className="notif-pop__cta" href="#inbox" onClick={handleInboxCta}>
                <span>{n.viewAllInbox}</span>
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
