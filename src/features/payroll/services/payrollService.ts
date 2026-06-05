import type { Employee, FilterDef, PayrollRun } from '../types'

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_HISTORY: Record<number, PayrollRun[]> = {
  2026: [
    { id: 'mar-2026', period: 'March 2026',    cutOff: '1 Mar – 31 Mar 2026', paymentSchedule: '25 Mar 2026', employees: 128, netPay: 1_842_500_000, published: false, locked: false },
    { id: 'feb-2026', period: 'February 2026', cutOff: '1 Feb – 28 Feb 2026', paymentSchedule: '25 Feb 2026', employees: 126, netPay: 1_798_200_000, published: true,  locked: true  },
    { id: 'jan-2026', period: 'January 2026',  cutOff: '1 Jan – 31 Jan 2026', paymentSchedule: '25 Jan 2026', employees: 124, netPay: 1_771_040_000, published: false, locked: true  },
  ],
  2025: [
    { id: 'dec-2025', period: 'December 2025', cutOff: '1 Dec – 31 Dec 2025', paymentSchedule: '23 Dec 2025', employees: 122, netPay: 2_410_880_000, published: true, locked: true, note: 'incl. THR' },
    { id: 'nov-2025', period: 'November 2025', cutOff: '1 Nov – 30 Nov 2025', paymentSchedule: '25 Nov 2025', employees: 121, netPay: 1_702_660_000, published: true, locked: true },
    { id: 'oct-2025', period: 'October 2025',  cutOff: '1 Oct – 31 Oct 2025', paymentSchedule: '24 Oct 2025', employees: 120, netPay: 1_688_400_000, published: true, locked: true },
    { id: 'sep-2025', period: 'September 2025',cutOff: '1 Sep – 30 Sep 2025', paymentSchedule: '25 Sep 2025', employees: 118, netPay: 1_654_120_000, published: true, locked: true },
    { id: 'aug-2025', period: 'August 2025',   cutOff: '1 Aug – 31 Aug 2025', paymentSchedule: '25 Aug 2025', employees: 117, netPay: 1_640_980_000, published: true, locked: true },
  ],
  2024: [
    { id: 'dec-2024', period: 'December 2024', cutOff: '1 Dec – 31 Dec 2024', paymentSchedule: '23 Dec 2024', employees: 110, netPay: 2_188_400_000, published: true, locked: true, note: 'incl. THR' },
    { id: 'nov-2024', period: 'November 2024', cutOff: '1 Nov – 30 Nov 2024', paymentSchedule: '25 Nov 2024', employees: 109, netPay: 1_502_200_000, published: true, locked: true },
  ],
}

const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 13 }, (_, i) => {
  const names = ['Nol','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas','Duabelas']
  return { id: `CP${57 + i}`, name: `Mitsui ${names[i]}`, location: 'Jakarta | IT Staff - SQA', assigned: false }
})

// ── Service interface ──────────────────────────────────────────────────────
// Swap mock implementations for real fetch() calls when backend is ready.

export interface IPayrollService {
  getHistory(year: number): Promise<PayrollRun[]>
  getAllPeriods(): Promise<string[]>
  getEmployees(): Promise<Employee[]>
  updateRunState(id: string, state: { published: boolean; locked: boolean }): Promise<void>
}

// ── Implementation ─────────────────────────────────────────────────────────

export const payrollService: IPayrollService = {
  async getHistory(year) {
    // replace: return fetch(`/api/payroll/history?year=${year}`).then(r => r.json())
    await delay(50)
    return (MOCK_HISTORY[year] ?? []).map(r => ({ ...r })) // return copies so mutations are local
  },

  async getAllPeriods() {
    await delay(50)
    const all: string[] = []
    for (const year of Object.keys(MOCK_HISTORY).sort().reverse()) {
      for (const r of MOCK_HISTORY[+year]) all.push(r.period)
    }
    return all
  },

  async getEmployees() {
    await delay(50)
    return MOCK_EMPLOYEES.map(e => ({ ...e, assigned: false }))
  },

  async updateRunState(_id, _state) {
    await delay(100)
    // In production: return fetch(`/api/payroll/${_id}/state`, { method: 'PATCH', body: JSON.stringify(_state) })
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export const FILTER_DEFS: FilterDef[] = [
  { key: 'branch',       title: 'Branch',            items: ['Head Office — Jakarta', 'Branch — Surabaya', 'Branch — Bandung', 'Branch — Medan', 'Branch — Bali', 'Branch — Makassar'] },
  { key: 'organization', title: 'Organization',      items: ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal', 'Product'] },
  { key: 'position',     title: 'Job Position',      items: ['Software Engineer', 'HR Specialist', 'Accountant', 'Product Manager', 'Sales Executive', 'UI/UX Designer', 'QA Engineer'] },
  { key: 'level',        title: 'Job Level',         items: ['Staff', 'Supervisor', 'Manager', 'Senior Manager', 'Director', 'Vice President', 'C-Level'] },
  { key: 'employment',   title: 'Employment Status', items: ['Permanent', 'Contract (PKWT)', 'Probation', 'Internship', 'Outsource', 'Freelance'] },
  { key: 'payroll',      title: 'Payroll Status',    items: ['Active', 'On Hold', 'Excluded', 'Already Processed'] },
  { key: 'schedule',     title: 'Payment Schedule',  items: ['Default (25th)', 'End of month', 'Custom date'] },
]

export const BANKS = [
  'Bank Central Asia (BCA)', 'Bank Mandiri', 'Bank Negara Indonesia (BNI)',
  'Bank Rakyat Indonesia (BRI)', 'CIMB Niaga', 'Bank Permata',
  'Bank Danamon', 'Bank Tabungan Negara (BTN)', 'OCBC NISP', 'Bank Syariah Indonesia (BSI)',
]
