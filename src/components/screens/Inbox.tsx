import { useState, useEffect, useRef } from 'react'
// i18n hook available for future locale wiring
// import { useT } from '@/i18n'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface MsgData {
  name?: string; position?: string; dates?: string; days?: number; type?: string; balance?: number; reason?: string
  clockIn?: string; clockOut?: string; date?: string
  field?: string; before?: string; after?: string
  amount?: string; category?: string; payoutDate?: string
  hours?: number; project?: string
  headline?: string; body?: string
  from?: string; to?: string; effective?: string
}
interface Message {
  id: number; cat: string; icon: string; source: string; subject: string; tag: string
  unread: boolean; date: string; time: string; preview: string; template: string; data?: MsgData
}

// ─────────────────────────────────────────────
// Data — all in English
// ─────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: 1,  cat: 'payroll',       icon: 'wallet',       source: 'SEVAKA Payroll',     subject: 'Payroll Run',                       tag: 'Payroll',       unread: true,  date: '28 May 2026',  time: '13:47', preview: 'Payroll calculation for period 05/2026 is complete and ready for further processing.', template: 'payroll-run' },
  { id: 2,  cat: 'timeoff',       icon: 'calendar-x-2', source: 'Lia Permata',        subject: 'Annual Leave Request',              tag: 'Time Off',      unread: true,  date: '28 May 2026',  time: '11:20', preview: 'Requesting 3-day annual leave (10–12 June 2026). Awaiting your approval.', template: 'timeoff-request',   data: { name: 'Lia Permata',   position: 'Product Designer',  dates: '10–12 June 2026', days: 3,  type: 'Annual Leave',       balance: 7,  reason: 'Family event out of town.' } },
  { id: 3,  cat: 'attendance',    icon: 'clock-alert',  source: 'SEVAKA Attendance',  subject: 'Reminder: Clock-out Missing',       tag: 'Attendance',    unread: true,  date: '28 May 2026',  time: '09:15', preview: 'You did not clock out yesterday (27 May 2026). Please confirm your departure time.', template: 'attendance-clockout', data: { clockIn: '08:14', clockOut: '—', date: '27 May 2026' } },
  { id: 4,  cat: 'payroll',       icon: 'wallet',       source: 'SEVAKA Payroll',     subject: 'Payslip Period 04/2026 Available',  tag: 'Payroll',       unread: true,  date: '27 May 2026',  time: '16:02', preview: 'Your payslip for April 2026 is available and can be downloaded from the Payroll module.', template: 'payroll-payslip' },
  { id: 5,  cat: 'changedata',    icon: 'user-cog',     source: 'Andreas Wijaya',     subject: 'Change Data Request',               tag: 'Change Data',   unread: true,  date: '27 May 2026',  time: '14:30', preview: 'Requesting a bank account number change — awaiting approval.', template: 'changedata-request',  data: { name: 'Andreas Wijaya', field: 'Bank Account Number', before: '1234567890 (BCA)', after: '9876543210 (Mandiri)' } },
  { id: 6,  cat: 'timeoff',       icon: 'calendar-x-2', source: 'Bagas Pratama',      subject: 'Sick Leave Request',                tag: 'Time Off',      unread: false, date: '27 May 2026',  time: '10:05', preview: 'Requesting 1-day sick leave with a doctor\'s note attached.', template: 'timeoff-request',     data: { name: 'Bagas Pratama', position: 'Backend Engineer',  dates: '27 May 2026',     days: 1,  type: 'Sick Leave',         balance: 11, reason: 'Fever, with attached doctor\'s note.' } },
  { id: 7,  cat: 'reimbursement', icon: 'receipt',      source: 'SEVAKA Finance',     subject: 'Reimbursement Approved',            tag: 'Reimbursement', unread: false, date: '26 May 2026',  time: '17:44', preview: 'Transportation reimbursement of Rp 1,250,000 has been approved.', template: 'reimburse-approved',  data: { amount: 'Rp 1,250,000', category: 'Transportation', payoutDate: '31 May 2026' } },
  { id: 8,  cat: 'overtime',      icon: 'hourglass',    source: 'Putu Sentana',       subject: 'Overtime Request',                  tag: 'Overtime',      unread: false, date: '26 May 2026',  time: '15:10', preview: 'Requesting 3 hours of overtime (Friday, 30 May 2026) for the Q2 closing project.', template: 'overtime-request',    data: { name: 'Putu Sentana', date: '30 May 2026', hours: 3, project: 'Q2 Financial Close' } },
  { id: 9,  cat: 'announcement',  icon: 'megaphone',    source: 'SEVAKA HR',          subject: 'Public Holiday Adjustment',         tag: 'Announcement',  unread: false, date: '26 May 2026',  time: '09:30', preview: 'Announcement on national public holiday adjustment for June 2026.', template: 'announcement-generic', data: { headline: 'National Holiday Adjustment — June 2026', body: 'In accordance with the latest government calendar, 1 June (Pancasila Day) falls on a Monday. No joint leave (cuti bersama) will be applied.' } },
  { id: 10, cat: 'mpp',           icon: 'users-round',  source: 'Theodorus F.K.',     subject: 'MPP Q3 2026 Update',                tag: 'MPP',           unread: false, date: '25 May 2026',  time: '11:00', preview: 'Manpower plan Q3 2026 has been updated — please review the Engineering division allocation.', template: 'mpp-update' },
  { id: 11, cat: 'transfer',      icon: 'users',        source: 'SEVAKA Employees',   subject: 'Employee Transfer — Surabaya',      tag: 'Transfer',      unread: false, date: '24 May 2026',  time: '13:48', preview: 'Yota Rogers has been transferred from Jakarta HQ to Surabaya Branch, effective 1 July 2026.', template: 'transfer-notice',     data: { name: 'Yota Rogers', from: 'Jakarta HQ', to: 'Surabaya Branch', effective: '1 July 2026' } },
  { id: 12, cat: 'timeoff',       icon: 'calendar-x-2', source: 'Made Aditya',        subject: 'Annual Leave — Approved',           tag: 'Time Off',      unread: false, date: '23 May 2026',  time: '09:11', preview: '2-day annual leave (5–6 June) has been approved by your manager.', template: 'timeoff-approved',    data: { dates: '5–6 June 2026', days: 2 } },
  { id: 13, cat: 'attendance',    icon: 'clock-alert',  source: 'SEVAKA Attendance',  subject: 'Live Attendance Activated',         tag: 'Attendance',    unread: false, date: '22 May 2026',  time: '07:55', preview: 'The Live Attendance feature is now active. Make sure your location is within office range when clocking in.', template: 'announcement-generic', data: { headline: 'Live Attendance — Active', body: 'The Live Attendance feature with GPS validation is now active for all employees. Make sure your location is within the office radius when clocking in and out.' } },
  { id: 14, cat: 'changedata',    icon: 'user-cog',     source: 'SEVAKA Profile',     subject: 'Email Confirmation',                tag: 'Change Data',   unread: false, date: '21 May 2026',  time: '16:25', preview: 'The email change on your profile has been confirmed.', template: 'changedata-confirm' },
]

const CAT_META: Record<string, { label: string; tile: string; tag: string }> = {
  payroll:       { label: 'Payroll',           tile: 'notif-icon--payroll',      tag: 'tag-payroll' },
  timeoff:       { label: 'Time Off',          tile: 'notif-icon--timeoff',      tag: 'tag-timeoff' },
  attendance:    { label: 'Attendance',        tile: 'notif-icon--attendance',   tag: 'tag-attendance' },
  reimbursement: { label: 'Reimbursement',     tile: 'notif-icon--reimburse',    tag: 'tag-reimburse' },
  mpp:           { label: 'MPP',               tile: 'notif-icon--mpp',          tag: 'tag-mpp' },
  overtime:      { label: 'Overtime',          tile: 'notif-icon--overtime',     tag: 'tag-overtime' },
  shift:         { label: 'Change Shift',      tile: 'notif-icon--shift',        tag: 'tag-shift' },
  changedata:    { label: 'Change Data',       tile: 'notif-icon--changedata',   tag: 'tag-changedata' },
  addemp:        { label: 'Add Employee',      tile: 'notif-icon--addemp',       tag: 'tag-addemp' },
  transfer:      { label: 'Employee Transfer', tile: 'notif-icon--transfer',     tag: 'tag-transfer' },
  goal:          { label: 'Goal',              tile: 'notif-icon--goal',         tag: 'tag-goal' },
  reviews:       { label: 'Reviews',           tile: 'notif-icon--reviews',      tag: 'tag-reviews' },
  report:        { label: 'Report Builder',    tile: 'notif-icon--report',       tag: 'tag-report' },
  delegation:    { label: 'Delegation',        tile: 'notif-icon--delegation',   tag: 'tag-delegation' },
  announcement:  { label: 'Announcement',      tile: 'notif-icon--announcement', tag: 'tag-announcement' },
}

function catLabel(cat: string) {
  const labels: Record<string, string> = { all: 'All Messages', approvals: 'Approvals', announcement: 'Announcements', report: 'Report Builder' }
  return labels[cat] ?? CAT_META[cat]?.label ?? 'Messages'
}

function isApproval(m: Message) {
  return ['timeoff','overtime','changedata','reimbursement'].includes(m.cat) && /Request|Requesting/i.test(m.subject + ' ' + m.preview)
}

// ─────────────────────────────────────────────
// Detail template components
// ─────────────────────────────────────────────
function DetailEmpty() {
  return (
    <div className="detail-empty">
      <div className="detail-empty__art">
        <svg className="lucide-icon-big" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
      <h2 className="detail-empty__title">Select a message</h2>
      <p className="detail-empty__sub">Select a message from the list on the left to view its details — reports, attachments, and next steps will appear here.</p>
    </div>
  )
}

function DetailHead({ m }: { m: Message }) {
  const meta = CAT_META[m.cat] ?? {}
  return (
    <header className="detail__head">
      <div className="detail__head-main">
        <span className={`detail__icon ${meta.tile ?? ''}`}><i data-lucide={m.icon} /></span>
        <div className="detail__head-text">
          <span className="detail__source">{m.source.toUpperCase()}</span>
          <span className="detail__subject">{m.subject}</span>
        </div>
      </div>
      <div className="detail__actions">
        <div className="detail__actions-row">
          <button className="detail-action"><i data-lucide="archive" />Archive</button>
          <button className="detail-action is-danger"><i data-lucide="trash-2" />Delete</button>
        </div>
        <span className="detail__timestamp">{m.date} • {m.time}</span>
      </div>
    </header>
  )
}

function DetailBody({ m }: { m: Message }) {
  const d = m.data ?? {}
  switch (m.template) {

    case 'payroll-run': return (
      <div className="detail__body">
        <div className="detail__hero-art">
          <div className="payroll-art">
            <div className="payroll-art__tile">
              <i data-lucide="file-text" />
              <span className="payroll-art__check"><i data-lucide="check" /></span>
            </div>
            <i data-lucide="chevron-right" className="payroll-art__arrow" />
            <div className="payroll-art__tile">
              <i data-lucide="wallet" />
              <span className="payroll-art__clock"><i data-lucide="clock" /></span>
            </div>
          </div>
        </div>
        <p className="detail__intro">
          Hi <b>Tony Stark</b>, the payroll calculation for <b>period 05/2026</b> is complete.{' '}
          You can <a href="#" onClick={e => e.preventDefault()}>request approval</a>, lock/unlock payroll,
          publish payslips, download e-banking files, and process disbursements via the <b>Payroll History</b> page.
        </p>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="bar-chart-3" />View Report</button>
          <button className="btn-secondary">Go to Payroll history →</button>
        </div>
        <div className="detail__group">
          <h4 className="detail__section-h">What's next after run payroll?</h4>
          <div className="detail__followup">
            <div className="detail__followup-thumb"><i data-lucide="banknote" /></div>
            <div className="detail__followup-body">
              <span className="detail__followup-title">Payroll Disbursement</span>
              <p className="detail__followup-desc">One click to instantly distribute employee salaries to over 150 banks in Indonesia, at no cost.</p>
              <a className="detail__followup-link" href="#" onClick={e => e.preventDefault()}>Request demo →</a>
            </div>
          </div>
        </div>
        <div className="detail__group">
          <span className="detail__alt-label">Alternative solution</span>
          <div className="detail__followup">
            <div className="detail__followup-thumb"><i data-lucide="landmark" /></div>
            <div className="detail__followup-body">
              <span className="detail__followup-title">E-Banking</span>
              <p className="detail__followup-desc">Use the e-banking feature to upload files to your bank's system for payroll payment processing.</p>
            </div>
          </div>
        </div>
      </div>
    )

    case 'payroll-payslip': return (
      <div className="detail__body">
        <p className="detail__intro">Your payslip for <b>period April 2026</b> is now available. You can download it from the Payroll module or copy the summary to email.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Period</span><span className="detail__info-value">April 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Net Pay</span><span className="detail__info-value">Rp 12,450,000</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Payment Date</span><span className="detail__info-value">28 April 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Account</span><span className="detail__info-value">BCA •••• 7890</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="download" />Download Payslip</button>
          <button className="btn-secondary">View full payslip →</button>
        </div>
      </div>
    )

    case 'timeoff-request': return (
      <div className="detail__body">
        <div className="detail__hero-art">
          <div className="req-avatar">{(d.name ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
        </div>
        <p className="detail__intro"><b>{d.name}</b> ({d.position}) is requesting <b>{d.type}</b> for <b>{d.days} day{d.days !== 1 ? 's' : ''}</b> on <b>{d.dates}</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Type</span><span className="detail__info-value">{d.type}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Dates</span><span className="detail__info-value">{d.dates}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Duration</span><span className="detail__info-value">{d.days} day{d.days !== 1 ? 's' : ''}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Remaining Balance</span><span className="detail__info-value">{d.balance} days</span></div>
          <div className="detail__info-row" style={{ gridColumn: '1 / -1' }}><span className="detail__info-label">Reason</span><span className="detail__info-value" style={{ fontWeight: 500 }}>{d.reason}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Open in Time Off module</button>
          <button className="btn-secondary">View employee leave history →</button>
        </div>
      </div>
    )

    case 'timeoff-approved': return (
      <div className="detail__body">
        <p className="detail__intro">Your <b>{d.days}-day annual leave</b> on <b>{d.dates}</b> has been <b>approved</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Approved</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Approved by</span><span className="detail__info-value">Tony Stark — 23 May 2026</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="calendar" />Add to calendar</button>
        </div>
      </div>
    )

    case 'attendance-clockout': return (
      <div className="detail__body">
        <p className="detail__intro">You <b>did not clock out</b> on {d.date}. Please confirm your departure time to keep attendance records accurate.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Date</span><span className="detail__info-value">{d.date}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Clock-in</span><span className="detail__info-value">{d.clockIn}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Clock-out</span><span className="detail__info-value" style={{ color: 'var(--color-warning-700)' }}>{d.clockOut}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--warning">Incomplete</span></span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="log-out" />Confirm clock-out</button>
          <button className="btn-secondary">Open Attendance page →</button>
        </div>
      </div>
    )

    case 'changedata-request': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> has submitted a change request for <b>{d.field}</b>. Review the details below before approving.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Field</span><span className="detail__info-value">{d.field}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--info">Pending</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Before</span><span className="detail__info-value" style={{ color: 'var(--fg-3)', textDecoration: 'line-through' }}>{d.before}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">After</span><span className="detail__info-value" style={{ color: 'var(--color-secondary-700)' }}>{d.after}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Review in Employee Directory</button>
        </div>
      </div>
    )

    case 'changedata-confirm': return (
      <div className="detail__body">
        <p className="detail__intro">The email on your profile has been successfully updated. Your new email is now your identity on SEVAKA.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Updated</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Field</span><span className="detail__info-value">Email</span></div>
        </div>
      </div>
    )

    case 'reimburse-approved': return (
      <div className="detail__body">
        <p className="detail__intro">Your reimbursement for <b>{d.category}</b> of <b>{d.amount}</b> has been <b>approved</b> and will be paid on {d.payoutDate}.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Category</span><span className="detail__info-value">{d.category}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Amount</span><span className="detail__info-value">{d.amount}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Approved</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Payout Date</span><span className="detail__info-value">{d.payoutDate}</span></div>
        </div>
      </div>
    )

    case 'overtime-request': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> is requesting <b>{d.hours} hours of overtime</b> on <b>{d.date}</b> for the <b>{d.project}</b> project.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Date</span><span className="detail__info-value">{d.date}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Duration</span><span className="detail__info-value">{d.hours} hours</span></div>
          <div className="detail__info-row" style={{ gridColumn: '1 / -1' }}><span className="detail__info-label">Project</span><span className="detail__info-value">{d.project}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Review in Overtime module</button>
        </div>
      </div>
    )

    case 'announcement-generic': return (
      <div className="detail__body">
        <h3 style={{ font: '700 18px/1.3 var(--font-display)', margin: 0, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{d.headline}</h3>
        <p style={{ font: '400 14px/1.7 var(--font-body)', color: 'var(--fg-2)', margin: 0 }}>{d.body}</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Publisher</span><span className="detail__info-value">{m.source}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Date</span><span className="detail__info-value">{m.date}</span></div>
        </div>
      </div>
    )

    case 'mpp-update': return (
      <div className="detail__body">
        <p className="detail__intro"><b>Manpower Plan Q3 2026</b> has been updated. Allocation for the <b>Engineering</b> division increased by 12% compared to the previous quarter.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Period</span><span className="detail__info-value">Q3 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Affected Divisions</span><span className="detail__info-value">Engineering, Product</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Δ Headcount</span><span className="detail__info-value" style={{ color: 'var(--color-success-700)' }}>+12%</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--info">Under Review</span></span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Open MPP Dashboard</button>
        </div>
      </div>
    )

    case 'transfer-notice': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> has been transferred from <b>{d.from}</b> to <b>{d.to}</b>, effective <b>{d.effective}</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Employee</span><span className="detail__info-value">{d.name}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Effective Date</span><span className="detail__info-value">{d.effective}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">From</span><span className="detail__info-value">{d.from}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">To</span><span className="detail__info-value" style={{ color: 'var(--color-secondary-700)' }}>{d.to}</span></div>
        </div>
      </div>
    )

    default: return (
      <div className="detail__body"><p className="detail__intro">{m.preview}</p></div>
    )
  }
}

// ─────────────────────────────────────────────
// Category sidebar groups
// ─────────────────────────────────────────────
const CAT_GROUPS = [
  { head: 'Inbox',       cats: [
    { id: 'all',          icon: 'inbox',           label: 'All Messages' },
    { id: 'approvals',    icon: 'clipboard-check',  label: 'Approvals' },
    { id: 'announcement', icon: 'megaphone',        label: 'Announcements' },
  ]},
  { head: 'Time',        cats: [
    { id: 'timeoff',      icon: 'calendar-x-2',    label: 'Time Off' },
    { id: 'overtime',     icon: 'hourglass',        label: 'Overtime' },
    { id: 'attendance',   icon: 'clock-alert',      label: 'Attendance' },
    { id: 'shift',        icon: 'repeat',           label: 'Change Shift' },
  ]},
  { head: 'People',      cats: [
    { id: 'addemp',       icon: 'user-plus',        label: 'Add Employee' },
    { id: 'transfer',     icon: 'users',            label: 'Employee Transfer' },
    { id: 'changedata',   icon: 'user-cog',         label: 'Change Data' },
    { id: 'delegation',   icon: 'user-check',       label: 'Delegation' },
  ]},
  { head: 'Performance', cats: [
    { id: 'mpp',          icon: 'users-round',      label: 'MPP' },
    { id: 'goal',         icon: 'target',           label: 'Goal' },
    { id: 'reviews',      icon: 'star',             label: 'Reviews' },
  ]},
  { head: 'Finance',     cats: [
    { id: 'payroll',      icon: 'wallet',           label: 'Payroll' },
    { id: 'reimbursement',icon: 'receipt',          label: 'Reimbursement' },
  ]},
  { head: 'Reports',     cats: [
    { id: 'report',       icon: 'file-bar-chart',   label: 'Report Builder' },
  ]},
]

// ─────────────────────────────────────────────
// Main Inbox component
// ─────────────────────────────────────────────
interface InboxProps {
  onDashboardNavigate?: () => void
}

export default function Inbox({ onDashboardNavigate }: InboxProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [activeCat, setActiveCat] = useState('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': '1.75' } })
  })

  function filtered() {
    return messages.filter(m => {
      if (activeCat === 'approvals') return isApproval(m)
      if (activeCat !== 'all' && m.cat !== activeCat) return false
      if (search) {
        const hay = `${m.source} ${m.subject} ${m.preview}`.toLowerCase()
        return hay.includes(search.toLowerCase())
      }
      return true
    })
  }

  function unreadCount(cat: string) {
    if (cat === 'all') return messages.filter(m => m.unread).length
    if (cat === 'approvals') return messages.filter(m => m.unread && isApproval(m)).length
    return messages.filter(m => m.cat === cat && m.unread).length
  }

  function selectMessage(id: number) {
    setSelectedId(id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, unread: false } : m))
  }

  function markAllRead() {
    setMessages(prev => prev.map(m => ({ ...m, unread: false })))
  }

  function handleSelectAll(v: boolean) {
    setSelectAll(v)
    if (v) setChecked(new Set(filtered().map(m => m.id)))
    else setChecked(new Set())
  }

  function toggleCheck(id: number) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function markCheckedRead() {
    setMessages(prev => prev.map(m => checked.has(m.id) ? { ...m, unread: false } : m))
    setChecked(new Set())
    setSelectAll(false)
  }

  function deleteChecked() {
    setMessages(prev => prev.filter(m => !checked.has(m.id)))
    if (selectedId !== null && checked.has(selectedId)) setSelectedId(null)
    setChecked(new Set())
    setSelectAll(false)
  }

  const items = filtered()
  const selectedMsg = messages.find(m => m.id === selectedId) ?? null
  const listUnread = items.filter(m => m.unread).length

  return (
    <div className="app__scroll inbox-scroll" ref={containerRef}>
      <section className="inbox-box">

      {/* Page header */}
      <header className="inbox-page-head">
        <div className="inbox-page-head__copy">
          <nav className="inbox-page-head__crumb">
            <a href="#" onClick={e => { e.preventDefault(); onDashboardNavigate?.() }}>Dashboard</a>
            <span className="inbox-page-head__crumb-sep">/</span>
            <span className="inbox-page-head__crumb-current">Notifications</span>
          </nav>
          <h1 className="inbox-page-head__title">Inbox</h1>
        </div>
        <div className="inbox-page-head__actions">
          <button className="btn-ghost" onClick={markAllRead}><i data-lucide="check-check" />Mark all as read</button>
          <button className="btn-ghost"><i data-lucide="clipboard-list" />Approval list</button>
          <button className="btn-primary"><i data-lucide="settings-2" />Preferences</button>
        </div>
      </header>

      {/* 3-pane shell */}
      <section className="inbox-shell">

        {/* LEFT RAIL — categories */}
        <aside className="inbox-cats">
          <div className="inbox-cats__search">
            <i data-lucide="search" />
            <input type="text" placeholder="Filter category" value={catSearch} onChange={e => setCatSearch(e.target.value)} />
          </div>
          {CAT_GROUPS.map(g => (
            <div className="inbox-cats__group" key={g.head}>
              <span className="inbox-cats__head">{g.head}</span>
              {g.cats.filter(c => !catSearch || c.label.toLowerCase().includes(catSearch.toLowerCase())).map(c => {
                const count = unreadCount(c.id)
                return (
                  <button
                    key={c.id}
                    className={`cat${activeCat === c.id ? ' is-on' : ''}`}
                    data-cat={c.id}
                    onClick={() => setActiveCat(c.id)}
                  >
                    <span className="cat__icon"><i data-lucide={c.icon} /></span>
                    <span className="cat__label">{c.label}</span>
                    <span className={`cat__pill${count === 0 ? ' is-muted' : ''}`}>{count}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </aside>

        {/* MIDDLE — message list */}
        <section className="inbox-list-col">
          <div className="inbox-list__toolbar">
            <label className="checkbox" style={{ margin: 0 }}>
              <input type="checkbox" checked={selectAll} onChange={e => handleSelectAll(e.target.checked)} />
              <span className="checkbox__box" />
            </label>
            <button className="list-tool" disabled={checked.size === 0} onClick={markCheckedRead}>
              <i data-lucide="mail-open" />Mark read
            </button>
            <button className="list-tool list-tool--danger" disabled={checked.size === 0} onClick={deleteChecked}>
              <i data-lucide="trash-2" />Delete
            </button>
            <button className="list-tool list-tool--icon" aria-label="more"><i data-lucide="more-horizontal" /></button>
            <div className="inbox-list__search">
              <i data-lucide="search" />
              <input type="text" placeholder="Search messages" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="inbox-list__header">
            <div>
              <h2 className="inbox-list__heading">{catLabel(activeCat)}</h2>
              <span className="inbox-list__sub">{items.length} {items.length === 1 ? 'message' : 'messages'}{listUnread > 0 ? ` • ${listUnread} unread` : ''}</span>
            </div>
            <button className="list-sort">
              <i data-lucide="arrow-down-narrow-wide" />Newest
            </button>
          </div>

          <ul className="inbox-list" role="listbox" aria-label="Inbox messages">
            {items.length === 0 ? (
              <li className="inbox-list__empty">
                <div className="inbox-list__empty-icon"><i data-lucide="inbox" /></div>
                <div className="inbox-list__empty-title">No messages here</div>
                <p className="inbox-list__empty-sub">No messages in this category yet. New notifications will appear here automatically.</p>
              </li>
            ) : items.map(m => {
              const meta = CAT_META[m.cat] ?? {}
              return (
                <li
                  key={m.id}
                  className={`msg${m.unread ? ' is-unread' : ''}${m.id === selectedId ? ' is-selected' : ''}`}
                  onClick={() => selectMessage(m.id)}
                >
                  <label className="checkbox msg__check" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={checked.has(m.id)} onChange={() => toggleCheck(m.id)} />
                    <span className="checkbox__box" />
                  </label>
                  <span className={`msg__icon ${meta.tile ?? ''}`}><i data-lucide={m.icon} /></span>
                  <div className="msg__body">
                    <div className="msg__row">
                      <span className="msg__source">{m.source}</span>
                      <span className="msg__date">{m.date}</span>
                    </div>
                    <div className="msg__subject">{m.subject}</div>
                    <p className="msg__preview">{m.preview}</p>
                    <div className="msg__meta">
                      <span className={`msg__tag ${meta.tag ?? ''}`}>{m.tag}</span>
                      <span className="msg__unread-dot" aria-hidden="true" />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="inbox-list__footnote">
            <i data-lucide="info" />
            <span>You can only access data from the last 2 years. To access older data, kindly contact us via email at <a href="#" onClick={e => e.preventDefault()}>support-hr@sevaka.id</a>.</span>
          </div>
        </section>

        {/* RIGHT — detail panel */}
        <section className="inbox-detail">
          {selectedMsg ? (
            <div className="detail">
              <DetailHead m={selectedMsg} />
              <DetailBody m={selectedMsg} />
            </div>
          ) : (
            <DetailEmpty />
          )}
        </section>
      </section>

      </section>
    </div>
  )
}
