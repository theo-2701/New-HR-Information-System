/**
 * Payroll screen — entry point wired into App.tsx's screen switcher.
 *
 * The full payroll experience lives in the feature module under
 * `src/features/payroll/`. This thin wrapper keeps the `goTo` prop contract
 * that App.tsx passes to every screen, and renders the feature's PayrollPage.
 */

import { PayrollPage } from '@/features/payroll/components/PayrollPage'

interface PayrollProps {
  goTo: (screen: string) => void
}

export default function Payroll({ goTo: _goTo }: PayrollProps) {
  return <PayrollPage />
}
