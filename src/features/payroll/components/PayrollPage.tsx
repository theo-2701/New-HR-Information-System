/**
 * PayrollPage — main entry point for the Payroll feature.
 *
 * Usage (add as a route in your router):
 *   import { PayrollPage } from '@/features/payroll/components/PayrollPage'
 *   <Route path="/payroll" element={<PayrollPage />} />
 *
 * This component renders the page-level tab bar (Payroll History / Run Payroll /
 * Run THR / Import Payroll / Settings) and switches between sub-views.
 * It does NOT render the sidebar or topnav — those are handled by your layout.
 */

import { useEffect, useState } from 'react'
import { Gift, FileInput, Settings } from 'lucide-react'
import { PayrollHistory } from './history/PayrollHistory'
import { RunPayroll } from './run/RunPayroll'
import type { PayrollTab } from '../types'
import { payrollService } from '../services/payrollService'

const TABS: { key: PayrollTab; label: string }[] = [
  { key: 'history',  label: 'Payroll History' },
  { key: 'run',      label: 'Run Payroll' },
  { key: 'thr',      label: 'Run THR' },
  { key: 'import',   label: 'Import Payroll' },
  { key: 'settings', label: 'Settings' },
]

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState<PayrollTab>('history')
  const [periods, setPeriods] = useState<string[]>([])

  useEffect(() => {
    payrollService.getAllPeriods().then(setPeriods)
  }, [])

  return (
    <div
      className="flex flex-col flex-1 min-h-0 px-6 pt-5 pb-6"
      style={{ background: 'var(--bg-app)' }}
    >
      {/* Page header */}
      <header className="mb-4">
        <h1 className="font-bold text-[30px] m-0 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
          Payroll Processing
        </h1>
        {/* Tab pills */}
        <div className="flex flex-wrap gap-[10px]">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="h-[34px] px-[18px] rounded-full font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer border transition-all duration-[180ms]"
              style={{
                background: activeTab === tab.key
                  ? 'linear-gradient(180deg, #d3ecf8 0%, #bfe2f4 100%)'
                  : '#fff',
                borderColor: activeTab === tab.key
                  ? 'var(--color-primary-300, #a9d8ee)'
                  : 'var(--border-1)',
                color: activeTab === tab.key
                  ? 'var(--color-secondary-700)'
                  : 'var(--fg-3)',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = 'var(--color-mist)'
                  e.currentTarget.style.color = 'var(--color-secondary-700)'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = 'var(--fg-3)'
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* White panel */}
      <div
        className="flex flex-col flex-1 min-h-0 rounded-[16px] overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-1)',
          boxShadow: 'var(--shadow-card-sm)',
        }}
      >
        {/* Tab: History */}
        {activeTab === 'history' && (
          <PayrollHistory onRunPayroll={() => setActiveTab('run')} periods={periods} />
        )}

        {/* Tab: Run Payroll */}
        {activeTab === 'run' && (
          <>
            <div className="px-10 pt-7 pb-0 flex-shrink-0">
              <div className="flex items-center justify-between mb-[18px]">
                <h2 className="font-bold text-[26px] m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
                  Run Payroll
                </h2>
              </div>
              <div className="h-px" style={{ background: 'var(--border-1)' }} />
            </div>
            <RunPayroll
              onGoHistory={() => setActiveTab('history')}
              onCancel={() => setActiveTab('history')}
            />
          </>
        )}

        {/* Stubs */}
        {activeTab === 'thr' && <StubView icon={<Gift size={32} />} title="Run THR" sub="Process religious holiday allowance (Tunjangan Hari Raya) for eligible employees." />}
        {activeTab === 'import' && <StubView icon={<FileInput size={32} />} title="Import Payroll" sub="Upload payroll data using the SEVAKA template." />}
        {activeTab === 'settings' && <StubView icon={<Settings size={32} />} title="Payroll Settings" sub="Configure payment schedules, tax method, BPJS rates and payroll components." />}
      </div>
    </div>
  )
}

function StubView({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-3">
      <span
        className="w-16 h-16 flex items-center justify-center rounded-[16px]"
        style={{ background: 'var(--color-primary-100)', color: 'var(--color-secondary-600)' }}
      >
        {icon}
      </span>
      <p className="font-bold text-[20px] m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>{title}</p>
      <p className="text-[15px] font-medium m-0 max-w-[420px]" style={{ color: 'var(--fg-3)' }}>{sub}</p>
    </div>
  )
}
