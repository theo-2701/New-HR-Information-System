import { useState, useEffect, useRef } from 'react'

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
// Data
// ─────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: 1,  cat: 'payroll',       icon: 'wallet',       source: 'SEVAKA Payroll',     subject: 'Run Payroll',                   tag: 'Payroll',       unread: true,  date: '28 Mei 2026', time: '13:47', preview: 'Proses kalkulasi payroll periode 05/2026 telah selesai dan siap diproses lebih lanjut.', template: 'payroll-run' },
  { id: 2,  cat: 'timeoff',       icon: 'calendar-x-2', source: 'Lia Permata',        subject: 'Permohonan Cuti Tahunan',       tag: 'Time Off',      unread: true,  date: '28 Mei 2026', time: '11:20', preview: 'Mengajukan cuti tahunan selama 3 hari (10–12 Juni 2026). Menunggu persetujuan Anda.', template: 'timeoff-request',   data: { name: 'Lia Permata',   position: 'Product Designer',   dates: '10–12 Juni 2026', days: 3,  type: 'Cuti Tahunan', balance: 7,  reason: 'Acara keluarga di luar kota.' } },
  { id: 3,  cat: 'attendance',    icon: 'clock-alert',  source: 'SEVAKA Attendance',  subject: 'Reminder: Clock-out',           tag: 'Attendance',    unread: true,  date: '28 Mei 2026', time: '09:15', preview: 'Anda belum melakukan clock-out kemarin (27 Mei 2026). Mohon konfirmasi.', template: 'attendance-clockout', data: { clockIn: '08:14', clockOut: '—', date: '27 Mei 2026' } },
  { id: 4,  cat: 'payroll',       icon: 'wallet',       source: 'SEVAKA Payroll',     subject: 'Payslip Periode 04/2026 Tersedia', tag: 'Payroll',    unread: true,  date: '27 Mei 2026', time: '16:02', preview: 'Payslip Anda untuk periode April 2026 sudah dapat diunduh dari modul Payroll.', template: 'payroll-payslip' },
  { id: 5,  cat: 'changedata',    icon: 'user-cog',     source: 'Andreas Wijaya',     subject: 'Permohonan Ubah Data',          tag: 'Change Data',   unread: true,  date: '27 Mei 2026', time: '14:30', preview: 'Mengajukan perubahan nomor rekening bank — menunggu persetujuan.', template: 'changedata-request',  data: { name: 'Andreas Wijaya', field: 'Nomor Rekening Bank', before: '1234567890 (BCA)', after: '9876543210 (Mandiri)' } },
  { id: 6,  cat: 'timeoff',       icon: 'calendar-x-2', source: 'Bagas Pratama',      subject: 'Cuti Sakit',                    tag: 'Time Off',      unread: false, date: '27 Mei 2026', time: '10:05', preview: 'Mengajukan cuti sakit 1 hari dengan lampiran surat dokter.', template: 'timeoff-request',     data: { name: 'Bagas Pratama', position: 'Backend Engineer', dates: '27 Mei 2026', days: 1, type: 'Cuti Sakit', balance: 11, reason: 'Demam, dengan lampiran surat dokter.' } },
  { id: 7,  cat: 'reimbursement', icon: 'receipt',      source: 'SEVAKA Finance',     subject: 'Reimbursement Disetujui',       tag: 'Reimbursement', unread: false, date: '26 Mei 2026', time: '17:44', preview: 'Reimbursement transportasi sebesar Rp 1.250.000 telah disetujui.', template: 'reimburse-approved',  data: { amount: 'Rp 1.250.000', category: 'Transportasi', payoutDate: '31 Mei 2026' } },
  { id: 8,  cat: 'overtime',      icon: 'hourglass',    source: 'Putu Sentana',       subject: 'Pengajuan Lembur',              tag: 'Overtime',      unread: false, date: '26 Mei 2026', time: '15:10', preview: 'Pengajuan lembur 3 jam (Jumat, 30 Mei 2026) untuk proyek Q2 closing.', template: 'overtime-request',    data: { name: 'Putu Sentana', date: '30 Mei 2026', hours: 3, project: 'Q2 Financial Close' } },
  { id: 9,  cat: 'announcement',  icon: 'megaphone',    source: 'HRD SEVAKA',         subject: 'Penyesuaian Hari Libur',        tag: 'Announcement',  unread: false, date: '26 Mei 2026', time: '09:30', preview: 'Pengumuman penyesuaian hari libur nasional periode Juni 2026.', template: 'announcement-generic',data: { headline: 'Penyesuaian Hari Libur Nasional — Juni 2026', body: 'Sehubungan dengan kalender pemerintah terbaru, hari libur 1 Juni (Hari Lahir Pancasila) jatuh pada hari Senin. Cuti bersama tidak diberlakukan.' } },
  { id: 10, cat: 'mpp',           icon: 'users-round',  source: 'Theodorus F.K.',     subject: 'Update MPP Q3 2026',            tag: 'MPP',           unread: false, date: '25 Mei 2026', time: '11:00', preview: 'Manpower plan Q3 2026 telah diperbarui — harap tinjau alokasi divisi Engineering.', template: 'mpp-update' },
  { id: 11, cat: 'transfer',      icon: 'users',        source: 'SEVAKA Employees',   subject: 'Mutasi Karyawan — Surabaya',    tag: 'Transfer',      unread: false, date: '24 Mei 2026', time: '13:48', preview: 'Sdr. Yota Rogers dimutasi dari Jakarta ke kantor cabang Surabaya per 1 Juli 2026.', template: 'transfer-notice',     data: { name: 'Yota Rogers', from: 'Jakarta HQ', to: 'Cabang Surabaya', effective: '1 Juli 2026' } },
  { id: 12, cat: 'timeoff',       icon: 'calendar-x-2', source: 'Made Adit',          subject: 'Cuti Tahunan — Disetujui',      tag: 'Time Off',      unread: false, date: '23 Mei 2026', time: '09:11', preview: 'Cuti tahunan 2 hari (5–6 Juni) telah disetujui oleh atasan Anda.', template: 'timeoff-approved',    data: { dates: '5–6 Juni 2026', days: 2 } },
  { id: 13, cat: 'attendance',    icon: 'clock-alert',  source: 'SEVAKA Attendance',  subject: 'Live Attendance Aktif',         tag: 'Attendance',    unread: false, date: '22 Mei 2026', time: '07:55', preview: 'Fitur Live Attendance kini aktif. Pastikan lokasi Anda dalam radius kantor saat clock-in.', template: 'announcement-generic', data: { headline: 'Live Attendance — Aktif', body: 'Fitur Live Attendance dengan validasi GPS telah aktif untuk seluruh karyawan. Pastikan lokasi Anda dalam radius kantor saat melakukan clock-in dan clock-out.' } },
  { id: 14, cat: 'changedata',    icon: 'user-cog',     source: 'SEVAKA Profile',     subject: 'Konfirmasi Email',              tag: 'Change Data',   unread: false, date: '21 Mei 2026', time: '16:25', preview: 'Perubahan email pada profil Anda telah dikonfirmasi.', template: 'changedata-confirm' },
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
  return ['timeoff','overtime','changedata','reimbursement'].includes(m.cat) && /Pengajuan|Permohonan/i.test(m.subject + ' ' + m.preview)
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
      <h2 className="detail-empty__title">Pilih sebuah pesan</h2>
      <p className="detail-empty__sub">Pilih satu pesan dari daftar di sebelah kiri untuk melihat detailnya — laporan, lampiran, dan langkah lanjutan akan muncul di sini.</p>
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
          Hai <b>Tony Stark</b>, proses kalkulasi <b>payroll periode 05/2026</b> telah selesai.{' '}
          Anda dapat <a href="#" onClick={e => e.preventDefault()}>meminta persetujuan</a>, mengunci/membuka payroll,
          mempublikasikan slip gaji, mengunduh e-banking, serta melakukan disbursement melalui halaman <b>Payroll History</b>.
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
              <p className="detail__followup-desc">Satu klik untuk mendistribusikan gaji karyawan Anda secara instan ke lebih dari 150 bank di Indonesia, tanpa biaya.</p>
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
              <p className="detail__followup-desc">Gunakan fitur e-banking untuk upload ke sistem bank yang dapat digunakan untuk pembayaran payroll.</p>
            </div>
          </div>
        </div>
      </div>
    )

    case 'payroll-payslip': return (
      <div className="detail__body">
        <p className="detail__intro">Payslip Anda untuk <b>periode April 2026</b> sudah tersedia. Anda dapat mengunduhnya dari modul Payroll atau menyalin ringkasannya ke email.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Periode</span><span className="detail__info-value">April 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Net Pay</span><span className="detail__info-value">Rp 12.450.000</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Tanggal Cair</span><span className="detail__info-value">28 April 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Rekening</span><span className="detail__info-value">BCA •••• 7890</span></div>
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
        <p className="detail__intro"><b>{d.name}</b> ({d.position}) mengajukan <b>{d.type}</b> selama <b>{d.days} hari</b> pada <b>{d.dates}</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Tipe</span><span className="detail__info-value">{d.type}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Tanggal</span><span className="detail__info-value">{d.dates}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Durasi</span><span className="detail__info-value">{d.days} hari</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Sisa Saldo Cuti</span><span className="detail__info-value">{d.balance} hari</span></div>
          <div className="detail__info-row" style={{ gridColumn: '1 / -1' }}><span className="detail__info-label">Alasan</span><span className="detail__info-value" style={{ fontWeight: 500 }}>{d.reason}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Open in Time Off module</button>
          <button className="btn-secondary">Lihat riwayat cuti karyawan →</button>
        </div>
      </div>
    )

    case 'timeoff-approved': return (
      <div className="detail__body">
        <p className="detail__intro">Cuti tahunan Anda selama <b>{d.days} hari</b> pada <b>{d.dates}</b> telah <b>disetujui</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Disetujui</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Persetujuan</span><span className="detail__info-value">Tony Stark — 23 Mei 2026</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="calendar" />Tambahkan ke kalender</button>
        </div>
      </div>
    )

    case 'attendance-clockout': return (
      <div className="detail__body">
        <p className="detail__intro">Anda <b>belum melakukan clock-out</b> pada hari {d.date}. Mohon konfirmasi waktu keluar Anda agar catatan kehadiran tetap akurat.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Tanggal</span><span className="detail__info-value">{d.date}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Clock-in</span><span className="detail__info-value">{d.clockIn}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Clock-out</span><span className="detail__info-value" style={{ color: 'var(--color-warning-700)' }}>{d.clockOut}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--warning">Belum lengkap</span></span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="log-out" />Konfirmasi clock-out</button>
          <button className="btn-secondary">Buka halaman Attendance →</button>
        </div>
      </div>
    )

    case 'changedata-request': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> mengajukan perubahan pada <b>{d.field}</b>. Tinjau detail di bawah sebelum menyetujui.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Field</span><span className="detail__info-value">{d.field}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--info">Menunggu</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Sebelum</span><span className="detail__info-value" style={{ color: 'var(--fg-3)', textDecoration: 'line-through' }}>{d.before}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Sesudah</span><span className="detail__info-value" style={{ color: 'var(--color-secondary-700)' }}>{d.after}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Tinjau di Employee Directory</button>
        </div>
      </div>
    )

    case 'changedata-confirm': return (
      <div className="detail__body">
        <p className="detail__intro">Email pada profil Anda telah berhasil diperbarui. Email baru kini menjadi identitas Anda di SEVAKA.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Diperbarui</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Field</span><span className="detail__info-value">Email</span></div>
        </div>
      </div>
    )

    case 'reimburse-approved': return (
      <div className="detail__body">
        <p className="detail__intro">Reimbursement Anda untuk kategori <b>{d.category}</b> sebesar <b>{d.amount}</b> telah <b>disetujui</b> dan akan dibayarkan pada {d.payoutDate}.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Kategori</span><span className="detail__info-value">{d.category}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Jumlah</span><span className="detail__info-value">{d.amount}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--success">Disetujui</span></span></div>
          <div className="detail__info-row"><span className="detail__info-label">Tanggal Cair</span><span className="detail__info-value">{d.payoutDate}</span></div>
        </div>
      </div>
    )

    case 'overtime-request': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> mengajukan lembur <b>{d.hours} jam</b> pada <b>{d.date}</b> untuk proyek <b>{d.project}</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Tanggal</span><span className="detail__info-value">{d.date}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Durasi</span><span className="detail__info-value">{d.hours} jam</span></div>
          <div className="detail__info-row" style={{ gridColumn: '1 / -1' }}><span className="detail__info-label">Proyek</span><span className="detail__info-value">{d.project}</span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Tinjau di modul Overtime</button>
        </div>
      </div>
    )

    case 'announcement-generic': return (
      <div className="detail__body">
        <h3 style={{ font: '700 18px/1.3 var(--font-display)', margin: 0, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{d.headline}</h3>
        <p style={{ font: '400 14px/1.7 var(--font-body)', color: 'var(--fg-2)', margin: 0 }}>{d.body}</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Penerbit</span><span className="detail__info-value">{m.source}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Tanggal</span><span className="detail__info-value">{m.date}</span></div>
        </div>
      </div>
    )

    case 'mpp-update': return (
      <div className="detail__body">
        <p className="detail__intro"><b>Manpower Plan Q3 2026</b> telah diperbarui. Alokasi untuk divisi <b>Engineering</b> meningkat sebesar 12% dibandingkan kuartal sebelumnya.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Periode</span><span className="detail__info-value">Q3 2026</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Divisi Terdampak</span><span className="detail__info-value">Engineering, Product</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Δ Headcount</span><span className="detail__info-value" style={{ color: 'var(--color-success-700)' }}>+12%</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Status</span><span className="detail__info-value"><span className="detail__status status--info">Tinjauan</span></span></div>
        </div>
        <div className="detail__primary-cta">
          <button className="btn-primary"><i data-lucide="external-link" />Buka MPP Dashboard</button>
        </div>
      </div>
    )

    case 'transfer-notice': return (
      <div className="detail__body">
        <p className="detail__intro"><b>{d.name}</b> akan dimutasi dari <b>{d.from}</b> ke <b>{d.to}</b> efektif <b>{d.effective}</b>.</p>
        <div className="detail__info-grid">
          <div className="detail__info-row"><span className="detail__info-label">Karyawan</span><span className="detail__info-value">{d.name}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Tanggal Efektif</span><span className="detail__info-value">{d.effective}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Dari</span><span className="detail__info-value">{d.from}</span></div>
          <div className="detail__info-row"><span className="detail__info-label">Ke</span><span className="detail__info-value" style={{ color: 'var(--color-secondary-700)' }}>{d.to}</span></div>
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

  // Filtering
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

  // Counts per category
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
      {/* Page header */}
      <header className="inbox-page-head">
        <div className="inbox-crumbs">
          <a href="#" onClick={e => { e.preventDefault(); onDashboardNavigate?.() }}>
            <i data-lucide="home" /> Dashboard
          </a>
          <i data-lucide="chevron-right" className="inbox-crumbs__sep" />
          <span>Inbox</span>
        </div>
        <div className="inbox-page-head__row">
          <div className="inbox-page-head__copy">
            <h1 className="inbox-page-head__title">Inbox</h1>
            <p className="inbox-page-head__sub">Semua notifikasi sistem dan pesan persetujuan Anda — dikategorikan agar mudah ditelusuri.</p>
          </div>
          <div className="inbox-page-head__actions">
            <button className="btn-ghost" onClick={markAllRead}><i data-lucide="check-check" />Mark all as read</button>
            <button className="btn-ghost"><i data-lucide="clipboard-list" />Approval list</button>
            <button className="btn-primary"><i data-lucide="settings-2" />Preferences</button>
          </div>
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
                    onClick={() => { setActiveCat(c.id); if (selectedId !== null && !filtered().find(m => m.id === selectedId)) setSelectedId(null) }}
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
                <p className="inbox-list__empty-sub">Belum ada pesan pada kategori ini. Notifikasi baru akan muncul di sini secara otomatis.</p>
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
    </div>
  )
}
