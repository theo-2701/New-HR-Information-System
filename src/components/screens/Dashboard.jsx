import { useState, useEffect, useRef } from 'react'
import bannerImg from '../../assets/banner.png'

const TODAY = new Date()
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const dateStr = `${DAYS[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`

export default function Dashboard({ goTo }) {
  const [moreOpen, setMoreOpen]   = useState(false)
  const [tableTab, setTableTab]   = useState('Contract & Probation')
  const [activeDot, setActiveDot] = useState(0)
  const moreRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  })

  return (
    <div className="app__scroll">

      {/* =========== HERO =========== */}
      <section className="dash-hero">
        <div className="dash-hero__copy">
          <div>
            <h1 className="dash-hero__title">Selamat Datang,<br/><span>Tessa!</span></h1>
            <span className="dash-hero__date">{dateStr}</span>
          </div>
          <div className="dash-hero__pills">
            <button className="hero-pill"><span>Live Attendance</span></button>
            <button className="hero-pill"><span>Request Time Off</span></button>
            <div className="pos-rel" ref={moreRef}>
              <button className="hero-pill" onClick={e => { e.stopPropagation(); setMoreOpen(o => !o) }}>
                <span>More Request</span>
                <i data-lucide="chevron-down"></i>
              </button>
              <div className={`menu${moreOpen ? ' is-open' : ''}`} style={{ top: 'calc(100% + 8px)', left: 0, right: 'auto', minWidth: '220px' }}>
                <button className="menu__item"><i data-lucide="file-text"></i>Reimbursement</button>
                <button className="menu__item"><i data-lucide="briefcase"></i>Business trip</button>
                <button className="menu__item"><i data-lucide="calendar-plus"></i>Overtime</button>
                <button className="menu__item"><i data-lucide="clock"></i>Shift change</button>
                <button className="menu__item"><i data-lucide="user-plus"></i>New employee</button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="dash-hero__art" aria-hidden="true">
          <svg viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cardGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="100%" stopColor="#e8f3fa"/>
              </linearGradient>
              <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#062a44" floodOpacity=".22"/>
              </filter>
            </defs>
            <circle cx="240" cy="160" r="170" fill="rgba(255,255,255,.25)"/>
            {/* Main dashboard card */}
            <g filter="url(#cardShadow)" transform="translate(140,52)">
              <rect x="0" y="0" width="260" height="184" rx="14" fill="url(#cardGrad)"/>
              <rect x="0" y="0" width="260" height="32" rx="14" fill="#0e3f60"/>
              <rect x="0" y="18" width="260" height="14" fill="#0e3f60"/>
              <circle cx="14" cy="16" r="3.5" fill="#ff6f5a"/><circle cx="26" cy="16" r="3.5" fill="#fde68a"/><circle cx="38" cy="16" r="3.5" fill="#7fc1de"/>
              <rect x="58" y="13" width="120" height="6" rx="3" fill="rgba(255,255,255,.35)"/>
              <g transform="translate(16,46)">
                <rect x="0" y="0" width="68" height="44" rx="6" fill="white" stroke="#cfe6f2" strokeWidth="1"/>
                <rect x="8" y="8" width="32" height="3" rx="1.5" fill="#9bc4dc"/>
                <text x="8" y="32" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="16" fontWeight="700" fill="#0e3f60">1,284</text>
                <rect x="78" y="0" width="68" height="44" rx="6" fill="white" stroke="#cfe6f2" strokeWidth="1"/>
                <rect x="86" y="8" width="32" height="3" rx="1.5" fill="#9bc4dc"/>
                <text x="86" y="32" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="16" fontWeight="700" fill="#0e3f60">94<tspan fontSize="11" fill="#5b94b8">%</tspan></text>
                <rect x="156" y="0" width="72" height="44" rx="6" fill="#0284c7"/>
                <rect x="164" y="8" width="32" height="3" rx="1.5" fill="rgba(255,255,255,.6)"/>
                <text x="164" y="32" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="16" fontWeight="700" fill="white">+24</text>
              </g>
              <g transform="translate(16,104)">
                <rect x="0" y="0" width="140" height="64" rx="6" fill="white" stroke="#cfe6f2" strokeWidth="1"/>
                <g stroke="#eaf2f7" strokeWidth="1"><line x1="8" y1="20" x2="132" y2="20"/><line x1="8" y1="36" x2="132" y2="36"/><line x1="8" y1="52" x2="132" y2="52"/></g>
                <rect x="14" y="38" width="10" height="18" rx="2" fill="#7fc1de"/>
                <rect x="32" y="28" width="10" height="28" rx="2" fill="#7fc1de"/>
                <rect x="50" y="20" width="10" height="36" rx="2" fill="#0284c7"/>
                <rect x="68" y="30" width="10" height="26" rx="2" fill="#7fc1de"/>
                <rect x="86" y="14" width="10" height="42" rx="2" fill="#0284c7"/>
                <rect x="104" y="22" width="10" height="34" rx="2" fill="#7fc1de"/>
                <rect x="122" y="10" width="10" height="46" rx="2" fill="#0284c7"/>
                <g transform="translate(152,0)">
                  <rect x="0" y="0" width="76" height="64" rx="6" fill="white" stroke="#cfe6f2" strokeWidth="1"/>
                  <g transform="translate(38,32)">
                    <circle r="18" fill="none" stroke="#eaf2f7" strokeWidth="7"/>
                    <circle r="18" fill="none" stroke="#0284c7" strokeWidth="7" strokeDasharray="62 113.1" transform="rotate(-90)"/>
                    <circle r="18" fill="none" stroke="#7fc1de" strokeWidth="7" strokeDasharray="34 113.1" strokeDashoffset="-62" transform="rotate(-90)"/>
                    <circle r="18" fill="none" stroke="#fde68a" strokeWidth="7" strokeDasharray="17 113.1" strokeDashoffset="-96" transform="rotate(-90)"/>
                  </g>
                </g>
              </g>
            </g>
            {/* Floating leave pill */}
            <g filter="url(#cardShadow)" transform="translate(40,90)">
              <rect x="0" y="0" width="160" height="48" rx="10" fill="white"/>
              <circle cx="24" cy="24" r="16" fill="#0284c7"/>
              <circle cx="24" cy="20" r="6" fill="#fde6cc"/>
              <path d="M10 38 q4 -10 14 -10 q10 0 14 10 z" fill="#fde6cc"/>
              <rect x="48" y="12" width="76" height="6" rx="3" fill="#0e3f60"/>
              <rect x="48" y="24" width="56" height="4" rx="2" fill="#9bc4dc"/>
              <circle cx="140" cy="24" r="10" fill="#1f8a5b"/>
              <path d="M135 24 l4 4 l7 -8" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            {/* Floating notification card */}
            <g filter="url(#cardShadow)" transform="translate(46,180)">
              <rect x="0" y="0" width="170" height="56" rx="10" fill="white"/>
              <rect x="8" y="10" width="36" height="36" rx="8" fill="#fde68a"/>
              <path d="M26 18 a8 8 0 0 1 8 8 v6 l3 3 H15 l3 -3 v -6 a8 8 0 0 1 8 -8 z m -2 22 a2 2 0 0 0 4 0 z" fill="#a26b0b"/>
              <rect x="54" y="14" width="100" height="6" rx="3" fill="#0e3f60"/>
              <rect x="54" y="26" width="80" height="4" rx="2" fill="#9bc4dc"/>
              <rect x="54" y="36" width="60" height="4" rx="2" fill="#cfe6f2"/>
            </g>
            {/* Calendar tile */}
            <g filter="url(#cardShadow)" transform="translate(370,28)">
              <rect x="0" y="0" width="72" height="80" rx="10" fill="white"/>
              <rect x="0" y="0" width="72" height="22" rx="10" fill="#e85a3d"/>
              <rect x="0" y="14" width="72" height="8" fill="#e85a3d"/>
              <text x="36" y="58" textAnchor="middle" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="24" fontWeight="700" fill="#0e3f60">{TODAY.getDate()}</text>
              <text x="36" y="72" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="#5b94b8" letterSpacing="1">{MONTHS[TODAY.getMonth()].toUpperCase().slice(0,3)}</text>
            </g>
            {/* Avatar stack */}
            <g filter="url(#cardShadow)" transform="translate(320,212)">
              <rect x="0" y="0" width="118" height="44" rx="22" fill="white"/>
              <circle cx="22" cy="22" r="14" fill="#7fc1de" stroke="white" strokeWidth="2"/>
              <circle cx="44" cy="22" r="14" fill="#fde68a" stroke="white" strokeWidth="2"/>
              <circle cx="66" cy="22" r="14" fill="#0284c7" stroke="white" strokeWidth="2"/>
              <circle cx="88" cy="22" r="14" fill="#cfe6f2" stroke="white" strokeWidth="2"/>
              <text x="88" y="26" textAnchor="middle" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="11" fontWeight="700" fill="#0e3f60">+12</text>
            </g>
            <g fill="white" opacity=".7">
              <path d="M260 36 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z"/>
              <path d="M120 60 l1.4 4 l4 1.4 l-4 1.4 l-1.4 4 l-1.4 -4 l-4 -1.4 l4 -1.4 z"/>
            </g>
          </svg>
        </div>
      </section>

      {/* =========== STAT GRID =========== */}
      <section className="stat-grid">

        {/* Gender Diversity */}
        <div className="stat-card">
          <div className="stat-card__head">
            <h3 className="stat-card__title">Gender Diversity <span className="info-i"><i data-lucide="info"></i></span></h3>
            <button className="stat-card__menu" aria-label="more"><i data-lucide="more-vertical"></i></button>
          </div>
          <div className="stat-card__body">
            <div className="donut-wrap">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" fill="none" stroke="#0284c7" strokeWidth="18" strokeDasharray="117.6 226.2" transform="rotate(-90 50 50)"/>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#87ceeb" strokeWidth="18" strokeDasharray="81.4 226.2" strokeDashoffset="-117.6" transform="rotate(-90 50 50)"/>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#fde68a" strokeWidth="18" strokeDasharray="27.2 226.2" strokeDashoffset="-199" transform="rotate(-90 50 50)"/>
              </svg>
              <div className="donut-legend">
                <div className="donut-legend__row"><span className="donut-legend__dot" style={{background:'#0284c7'}}></span>Female</div>
                <div className="donut-legend__row"><span className="donut-legend__dot" style={{background:'#87ceeb'}}></span>Male</div>
                <div className="donut-legend__row"><span className="donut-legend__dot" style={{background:'#fde68a'}}></span>Not Filled</div>
              </div>
            </div>
          </div>
          <div className="stat-card__foot"><button className="filter-btn">Filter <i data-lucide="chevron-down"></i></button></div>
        </div>

        {/* Staff Active */}
        <div className="stat-card">
          <div className="stat-card__head">
            <h3 className="stat-card__title">Staff Active <span className="info-i"><i data-lucide="info"></i></span></h3>
            <button className="stat-card__menu" aria-label="more"><i data-lucide="more-vertical"></i></button>
          </div>
          <div className="stat-card__body">
            <div className="barchart-wrap">
              <svg viewBox="0 0 320 220" preserveAspectRatio="none">
                <g fontFamily="Inter" fontSize="11" fill="#94a3b8">
                  <text x="2" y="24">500</text><line x1="28" y1="20" x2="320" y2="20" stroke="#eef3f7"/>
                  <text x="2" y="64">400</text><line x1="28" y1="60" x2="320" y2="60" stroke="#eef3f7"/>
                  <text x="2" y="104">300</text><line x1="28" y1="100" x2="320" y2="100" stroke="#eef3f7"/>
                  <text x="2" y="144">200</text><line x1="28" y1="140" x2="320" y2="140" stroke="#eef3f7"/>
                  <text x="2" y="184">100</text><line x1="28" y1="180" x2="320" y2="180" stroke="#eef3f7"/>
                </g>
                <g fill="#0284c7">
                  <rect x="38"  y="112" width="32" height="88"  rx="3"/>
                  <rect x="84"  y="50"  width="32" height="150" rx="3"/>
                  <rect x="130" y="68"  width="32" height="132" rx="3"/>
                  <rect x="176" y="20"  width="32" height="180" rx="3"/>
                  <rect x="222" y="68"  width="32" height="132" rx="3"/>
                  <rect x="268" y="20"  width="32" height="180" rx="3"/>
                </g>
                <g fontFamily="Inter" fontSize="11" fill="#475569" textAnchor="middle">
                  <text x="54"  y="216">Jun</text><text x="100" y="216">Jul</text>
                  <text x="146" y="216">Aug</text><text x="192" y="216">Sept</text>
                  <text x="238" y="216">Okt</text><text x="284" y="216">Nov</text>
                </g>
              </svg>
            </div>
          </div>
          <div className="stat-card__foot"><button className="filter-btn">Filter <i data-lucide="chevron-down"></i></button></div>
        </div>

        {/* Monthly Turnover */}
        <div className="stat-card">
          <div className="stat-card__head">
            <h3 className="stat-card__title">Monthly Turnover <span className="info-i"><i data-lucide="info"></i></span></h3>
            <button className="stat-card__menu" aria-label="more"><i data-lucide="more-vertical"></i></button>
          </div>
          <div className="stat-card__body">
            <div className="linechart-wrap">
              <svg viewBox="0 0 320 220" preserveAspectRatio="none">
                <g fontFamily="Inter" fontSize="11" fill="#94a3b8">
                  <text x="2" y="44">10%</text><line x1="28" y1="40" x2="320" y2="40" stroke="#eef3f7"/>
                  <text x="6" y="124">5%</text><line x1="28" y1="120" x2="320" y2="120" stroke="#eef3f7"/>
                  <text x="6" y="204">0%</text><line x1="28" y1="200" x2="320" y2="200" stroke="#eef3f7"/>
                </g>
                <path d="M 54 160 L 100 120 L 146 120 L 192 80 L 238 120 L 284 120" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <g fill="white" stroke="#0284c7" strokeWidth="2.5">
                  <circle cx="54"  cy="160" r="5"/><circle cx="100" cy="120" r="5"/>
                  <circle cx="146" cy="120" r="5"/><circle cx="192" cy="80"  r="5"/>
                  <circle cx="238" cy="120" r="5"/><circle cx="284" cy="120" r="5"/>
                </g>
                <g fontFamily="Inter" fontSize="11" fill="#475569" textAnchor="middle">
                  <text x="54"  y="216">Jun</text><text x="100" y="216">Jul</text>
                  <text x="146" y="216">Aug</text><text x="192" y="216">Sept</text>
                  <text x="238" y="216">Okt</text><text x="284" y="216">Nov</text>
                </g>
              </svg>
            </div>
          </div>
          <div className="stat-card__foot"><button className="filter-btn">Filter <i data-lucide="chevron-down"></i></button></div>
        </div>

        {/* Job Level */}
        <div className="stat-card">
          <div className="stat-card__head">
            <h3 className="stat-card__title">Job Level <span className="info-i"><i data-lucide="info"></i></span></h3>
            <button className="stat-card__menu" aria-label="more"><i data-lucide="more-vertical"></i></button>
          </div>
          <div className="stat-card__body">
            <div className="joblevel-bar">
              <span style={{width:'40%',background:'#bce0f3'}}></span>
              <span style={{width:'25%',background:'#0e4a73'}}></span>
              <span style={{width:'15%',background:'#fde68a'}}></span>
              <span style={{width:'10%',background:'#7eb9d4'}}></span>
              <span style={{width:'6%', background:'#0284c7'}}></span>
              <span style={{width:'3%', background:'#cfe6f2'}}></span>
              <span style={{width:'0.9%',background:'#0a3a5a'}}></span>
              <span style={{width:'0.1%',background:'#062234'}}></span>
            </div>
            <div className="joblevel-ticks"><span>0%</span><span>100%</span></div>
            <div className="joblevel-total"><span>Total</span><b>1000</b></div>
            <div className="joblevel-list">
              {[['#bce0f3','Staff',400,'40%'],['#0e4a73','Operator',250,'25%'],['#fde68a','Manager',150,'15%'],
                ['#7eb9d4','Supervisor',100,'10%'],['#0284c7','Intern',60,'6%'],['#cfe6f2','Specialist',30,'3%'],
                ['#0a3a5a','VP',9,'0.9%'],['#062234','CEO',1,'0.1%']].map(([bg,name,count,pct]) => (
                <div key={name} className="joblevel-row">
                  <span className="joblevel-row__sw" style={{background:bg}}></span>
                  <span className="joblevel-row__name">{name}</span>
                  <span className="joblevel-row__count">{count}</span>
                  <span className="joblevel-row__pct">{pct}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stat-card__foot"><button className="filter-btn">Filter <i data-lucide="chevron-down"></i></button></div>
        </div>

      </section>

      {/* =========== MID ROW =========== */}
      <section className="mid-row">

        {/* Quick Links */}
        <aside className="qlinks">
          <div>
            <h4 className="qlinks__heading">Quick Links</h4>
            <div className="qlinks__list">
              <a className="qlink"><i data-lucide="user" className="qlink__icon"></i>Employee Profile</a>
              <a className="qlink"><i data-lucide="repeat" className="qlink__icon"></i>Employee Transfer</a>
              <a className="qlink"><i data-lucide="building" className="qlink__icon"></i>Company Settings</a>
              <a className="qlink"><i data-lucide="puzzle" className="qlink__icon"></i>Integrations</a>
            </div>
          </div>
          <div>
            <h4 className="qlinks__heading">Application</h4>
            <div className="qlinks__list">
              <a className="qlink"><i data-lucide="file-text" className="qlink__icon"></i>Forms</a>
              <a className="qlink"><i data-lucide="award" className="qlink__icon"></i>Performance Review</a>
              <a className="qlink"><i data-lucide="users-round" className="qlink__icon"></i>Talent Management</a>
              <a className="qlink"><i data-lucide="lightbulb" className="qlink__icon"></i>Insight</a>
              <a className="qlink"><i data-lucide="calendar-clock" className="qlink__icon"></i>Timesheet</a>
              <a className="qlink"><i data-lucide="file-stack" className="qlink__icon"></i>Document Template</a>
              <a className="qlink"><i data-lucide="graduation-cap" className="qlink__icon"></i>Training</a>
            </div>
          </div>
        </aside>

        {/* Banner */}
        <div className="banner">
          <div className="banner__art" aria-hidden="true">
            <img src={bannerImg} alt="" draggable="false"/>
          </div>
          <div className="banner__copy">
            <p className="banner__text">Pantau kehadiran tim secara real-time dan setujui permintaan cuti dengan lebih cepat melalui sistem HRIS.</p>
            <a className="banner__cta">Pelajari Selengkapnya <i data-lucide="arrow-right"></i></a>
          </div>
          <div className="banner__dots">
            {[0,1,2,3].map(i => (
              <button key={i} className={`banner__dot${activeDot === i ? ' is-on' : ''}`} aria-label={`slide ${i+1}`} onClick={() => setActiveDot(i)}></button>
            ))}
          </div>
        </div>

        {/* Side stack */}
        <div className="side-stack">
          <div className="leave-card">
            <div className="leave-section">
              <span className="leave-section__label">Annual Leave Balance <span className="info-i"><i data-lucide="info"></i></span></span>
              <span className="leave-section__value">10 <small>Days</small></span>
              <a className="leave-section__cta">Request annual leave <i data-lucide="arrow-right"></i></a>
            </div>
            <div className="leave-card__divider"></div>
            <div className="leave-section">
              <span className="leave-section__label">Sick Leave Used</span>
              <span className="leave-section__value">4 <small>Days</small></span>
              <a className="leave-section__cta">Request sick leave <i data-lucide="arrow-right"></i></a>
            </div>
            <a className="leave-card__viewall">View all</a>
          </div>

          <div className="whoisoff-card">
            <div className="whoisoff-card__head">
              <h4 className="whoisoff-card__title">Who's Off</h4>
              <button className="whoisoff-card__pick">Today <i data-lucide="chevron-down"></i></button>
            </div>
            <div className="whoisoff-card__date">Tue, 09 December 2025</div>
            <div>
              {['Mitsui Tiga','Mitsui Empat','Mitsui Lima'].map(name => (
                <div key={name} className="whoisoff-row">
                  <div className="whoisoff-row__avatar">
                    <svg viewBox="0 0 36 36"><rect width="36" height="36" fill="#5db95d"/><circle cx="18" cy="14" r="9" fill="#a8d479"/><path d="M6 36 q4 -9 12 -9 q8 0 12 9z" fill="#2b6a2b"/></svg>
                  </div>
                  <div className="whoisoff-row__meta">
                    <span className="whoisoff-row__name">{name}</span>
                    <span className="whoisoff-row__sub">Cuti Tahunan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* =========== TABLE CARD =========== */}
      <section className="table-card">
        <div className="tabs-pills">
          {['Announcement','Contract & Probation','Tasks'].map(t => (
            <button key={t} className={`tab-pill${tableTab === t ? ' is-on' : ''}`} onClick={() => setTableTab(t)}>{t}</button>
          ))}
        </div>

        <div className="info-banner">
          <span className="info-banner__icon"></span>
          <span>Introducing the Evaluation Review Cycle. Elevate your organization's success with the power of timely and data-driven review! <a href="#" onClick={e => e.preventDefault()}>Learn more</a></span>
        </div>

        <div className="table-toolbar">
          <button className="table-toolbar__filter">
            <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><i data-lucide="filter"></i>Filter</span>
            <i data-lucide="chevron-down"></i>
          </button>
          <button className="table-toolbar__icon" aria-label="Notifications"><i data-lucide="bell"></i><span className="dot"></span></button>
          <div className="table-toolbar__search">
            <input type="text" placeholder="Search here"/>
            <i data-lucide="search"></i>
          </div>
        </div>

        <table className="dash-table">
          <thead>
            <tr>
              <th><label className="checkbox" style={{margin:0}}><input type="checkbox"/><span className="checkbox__box"></span></label></th>
              <th>Employee</th>
              <th>Status</th>
              <th>End Date</th>
              <th>Total Contract Duration</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3].map(i => (
              <tr key={i}>
                <td><label className="checkbox" style={{margin:0}}><input type="checkbox"/><span className="checkbox__box"></span></label></td>
                <td>Lorem Ipsum</td>
                <td><span className="status-pill">Active</span></td>
                <td>12/12/2025</td>
                <td>12 Months</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-foot">
          <div className="table-foot__left">
            <span>Showing</span>
            <button className="table-foot__select">10 <i data-lucide="chevron-down"></i></button>
            <span>from 3 rows</span>
          </div>
          <div className="table-foot__pages">
            <button className="table-foot__btn" aria-label="first" disabled><i data-lucide="chevrons-left"></i></button>
            <button className="table-foot__btn" aria-label="prev"  disabled><i data-lucide="chevron-left"></i></button>
            <span className="table-foot__page-input">1</span>
            <button className="table-foot__btn" aria-label="next"><i data-lucide="chevron-right"></i></button>
            <button className="table-foot__btn" aria-label="last"><i data-lucide="chevrons-right"></i></button>
            <span style={{marginLeft:'8px'}}>from 1</span>
          </div>
        </div>
      </section>

    </div>
  )
}
