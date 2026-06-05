import { useState } from 'react'
import Topnav from './components/Topnav'
import Sidebar from './components/Sidebar'
import Dashboard from './components/screens/Dashboard'
import Employee from './components/screens/Employee'
import AddEmployee from './components/screens/AddEmployee'
import Profile from './components/screens/Profile'
import TimeManagement from './components/screens/TimeManagement'
import Inbox from './components/screens/Inbox'
import Payroll from './components/screens/Payroll'
import SignIn from './components/screens/SignIn'

type Screen = 'dashboard' | 'employee' | 'add-employee' | 'profile' | 'time' | 'inbox' | 'payroll' | 'signin'

const SCREENS: Screen[] = ['dashboard', 'employee', 'add-employee', 'profile', 'time', 'inbox', 'payroll']

export default function App() {
  const [screen, setScreen] = useState<Screen>('signin')

  const goTo = (name: string) => {
    const target = SCREENS.includes(name as Screen) ? (name as Screen) : 'dashboard'
    setScreen(target)
    window.scrollTo(0, 0)
  }

  if (screen === 'signin') {
    return <SignIn onLogin={() => setScreen('dashboard')} />
  }

  /* Add Employee gets the full main area (own layout, no shell wrapper) */
  if (screen === 'add-employee') {
    return (
      <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topnav bellActive={false} onInboxNavigate={() => goTo('inbox')} />
        <div className="app__body">
          <Sidebar
            dashboardActive={false}
            onDashboardClick={() => goTo('dashboard')}
            onNavItemClick={(group, item) => {
              if (group === 'employees' && item === 'Employee Directory') goTo('employee')
              if (group === 'payroll') goTo('payroll')
            }}
          />
          <AddEmployee goTo={goTo} />
        </div>
      </div>
    )
  }

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topnav
        bellActive={screen === 'inbox'}
        onInboxNavigate={() => goTo('inbox')}
      />
      <div className="app__body">
        <Sidebar
          dashboardActive={screen === 'dashboard'}
          onDashboardClick={() => goTo('dashboard')}
          onNavItemClick={(group, item) => {
            if (group === 'employees' && item === 'Employee Directory') goTo('employee')
            if (group === 'payroll') goTo('payroll')
          }}
        />
        <main className="app__main">
          {screen === 'inbox' ? (
            <Inbox onDashboardNavigate={() => goTo('dashboard')} />
          ) : (
            <div className="app__scroll">
              {screen === 'dashboard' && <Dashboard goTo={goTo} />}
              {screen === 'employee'  && <Employee goTo={goTo} />}
              {screen === 'payroll'   && <Payroll goTo={goTo} />}
              {screen === 'profile'   && <Profile />}
              {screen === 'time'      && <TimeManagement />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
