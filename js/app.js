// SEVAKA HRIS — App interactivity

(function () {
  'use strict';

  // ---------- Product picker ----------
  const pickerEl  = document.getElementById('productPicker');
  const pickerBtn = document.getElementById('productPickerBtn');
  const productNow = document.getElementById('productNow');

  function closePicker() { pickerEl && pickerEl.classList.remove('is-open'); }

  if (pickerBtn) {
    pickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pickerEl.classList.toggle('is-open');
    });
    document.addEventListener('click', (e) => {
      if (pickerEl && !pickerEl.contains(e.target)) closePicker();
    });
    pickerEl.querySelectorAll('.product-opt:not([disabled])').forEach((opt) => {
      opt.addEventListener('click', () => {
        pickerEl.querySelectorAll('.product-opt').forEach((o) => o.classList.remove('is-on'));
        opt.classList.add('is-on');
        if (productNow) productNow.textContent = opt.dataset.product;
        closePicker();
      });
    });
  }

  // ---------- Screen switcher ----------
  const SCREENS = ['signin', 'dashboard', 'employee', 'profile', 'time'];

  function goTo(name) {
    if (!SCREENS.includes(name)) name = 'dashboard';
    document.body.dataset.screen = name;

    document.querySelectorAll('[data-screen]').forEach((el) => {
      if (el === document.body) return;
      const screens = el.dataset.screen.split(',').map(s => s.trim());
      const active = screens.includes(name);
      if (el.matches('section[data-screen]')) {
        el.classList.toggle('is-active', active);
      } else if (el.matches('.app__scroll')) {
        el.style.display = active ? '' : 'none';
      }
    });

    // Sidebar active state
    document.querySelectorAll('.sidebar__item[data-go]').forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.go === name);
    });

    window.scrollTo(0, 0);
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
  }
  window.goTo = goTo;

  // Wire all [data-go] click targets
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); goTo(t.dataset.go); }
  });

  // ---------- Employee table ----------
  const employees = [
    { name: 'Tessa Hartanto',  id: 'EMP-2041', email: 'tessa.h@perusahaan.id',  role: 'Senior Designer',     dept: 'People Operations', status: 'ok',   tag: 'Aktif',     date: '12 Jan 2023', clr: '#87ceeb', fg: '#334155' },
    { name: 'Reza Maulana',    id: 'EMP-1108', email: 'reza.m@perusahaan.id',   role: 'Engineering Manager', dept: 'Engineering',       status: 'warn', tag: 'Cuti',      date: '04 Mar 2022', clr: '#fde68a', fg: '#72673e' },
    { name: 'Anita Pranata',   id: 'EMP-0892', email: 'anita.p@perusahaan.id',  role: 'Finance Analyst',     dept: 'Finance',           status: 'ok',   tag: 'Aktif',     date: '20 Aug 2021', clr: '#34d399', fg: 'white'   },
    { name: 'Dimas Kurnia',    id: 'EMP-3120', email: 'dimas.k@perusahaan.id',  role: 'Account Executive',   dept: 'Sales',             status: 'info', tag: 'Probation', date: '02 May 2026', clr: '#0284c7', fg: 'white'   },
    { name: 'Surya Setiawan',  id: 'EMP-1762', email: 'surya.s@perusahaan.id',  role: 'Mobile Engineer',     dept: 'Engineering',       status: 'ok',   tag: 'Aktif',     date: '14 Jun 2022', clr: '#ef4444', fg: 'white'   },
    { name: 'Mawar Lestari',   id: 'EMP-0455', email: 'mawar.l@perusahaan.id',  role: 'Recruiter',           dept: 'People Operations', status: 'ok',   tag: 'Aktif',     date: '08 Feb 2020', clr: '#7ab9d4', fg: 'white'   },
    { name: 'Bayu Pratama',    id: 'EMP-2298', email: 'bayu.p@perusahaan.id',   role: 'Product Manager',     dept: 'Product',           status: 'warn', tag: 'Cuti',      date: '17 Sep 2023', clr: '#f59e0b', fg: 'white'   },
    { name: 'Citra Wibowo',    id: 'EMP-3015', email: 'citra.w@perusahaan.id',  role: 'Content Writer',      dept: 'Marketing',         status: 'err',  tag: 'Resign',    date: '22 Jan 2024', clr: '#94a3b8', fg: 'white'   },
  ];

  function initials(name) {
    return name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
  }

  function seedEmployeeTable() {
    const tbody = document.getElementById('empTbody');
    if (!tbody) return;
    tbody.innerHTML = employees.map(e => `
      <tr>
        <td><label class="checkbox" style="margin:0">
          <input type="checkbox"><span class="checkbox__box"></span>
        </label></td>
        <td>
          <div class="table-row-id" style="cursor:pointer" data-go="profile">
            <div class="avatar avatar--sm" style="background:${e.clr};color:${e.fg}">${initials(e.name)}</div>
            <div class="table-row-id__meta">
              <span class="table-row-id__name">${e.name}</span>
              <span class="table-row-id__sub">${e.id} &middot; ${e.email}</span>
            </div>
          </div>
        </td>
        <td>${e.role}</td>
        <td class="dim">${e.dept}</td>
        <td><span class="chip chip--${e.status}">${e.tag}</span></td>
        <td class="dim">${e.date}</td>
        <td>
          <button class="icon-btn" style="width:28px;height:28px;background:transparent;box-shadow:none" aria-label="More options">
            <i data-lucide="more-horizontal"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ---------- Calendar (May 2026) ----------
  function seedCalendar() {
    const cal = document.getElementById('cal');
    if (!cal) return;

    const cells = [];
    // Mon 27 Apr – Thu 30 Apr (leading empty cells before May 1 which is a Friday)
    [27, 28, 29, 30].forEach(d => cells.push({ day: d, muted: true }));
    for (let d = 1; d <= 31; d++) cells.push({ day: d });

    const today = 21;
    const events = {
      4: ['leave'], 5: ['leave'],
      11: ['pending'],
      13: ['leave', 'pending'],
      19: ['holiday'], 22: ['holiday'],
      28: ['leave'],
    };

    cal.innerHTML = cells.map(c => {
      if (c.muted) return `<div class="calendar__day calendar__day--muted">${c.day}</div>`;
      const isToday = c.day === today;
      const ev = events[c.day] || [];
      const dots = ev.map(t => {
        if (t === 'pending') return '<span class="dot amber"></span>';
        if (t === 'holiday') return '<span class="dot green"></span>';
        return '<span class="dot"></span>';
      }).join('');
      return `<div class="calendar__day${isToday ? ' calendar__day--today' : ''}">
        <span>${c.day}</span>
        <div class="dots">${dots}</div>
      </div>`;
    }).join('');
  }

  // ---------- Live clock ----------
  function startClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    }
    tick();
    setInterval(tick, 10000);
  }

  // ---------- Tab switching ----------
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tabs__tab');
    if (!tab) return;
    const tabs = tab.closest('.tabs');
    if (!tabs) return;
    tabs.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('is-on'));
    tab.classList.add('is-on');
  });

  // ---------- Init ----------
  function init() {
    const hash = (location.hash || '').replace('#', '');
    goTo(SCREENS.includes(hash) ? hash : 'dashboard');

    seedEmployeeTable();
    seedCalendar();
    startClock();

    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
