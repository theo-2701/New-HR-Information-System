import { useState } from 'react'
import Topnav from './components/Topnav'
import Sidebar from './components/Sidebar'
import Dashboard from './components/screens/Dashboard'
import Employee from './components/screens/Employee'
import Profile from './components/screens/Profile'
import TimeManagement from './components/screens/TimeManagement'
import Inbox from './components/screens/Inbox'

type Screen = 'dashboard' | 'employee' | 'profile' | 'time' | 'inbox' | 'signin'

const SCREENS: Screen[] = ['dashboard', 'employee', 'profile', 'time', 'inbox']

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  const goTo = (name: string) => {
    const target = SCREENS.includes(name as Screen) ? (name as Screen) : 'dashboard'
    setScreen(target)
    window.scrollTo(0, 0)
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
        />
        <main className="app__main">
          {screen === 'inbox' ? (
            <Inbox onDashboardNavigate={() => goTo('dashboard')} />
          ) : (
            <div className="app__scroll">
              {screen === 'dashboard' && <Dashboard goTo={goTo} />}
              {screen === 'employee'  && <Employee goTo={goTo} />}
              {screen === 'profile'   && <Profile />}
              {screen === 'time'      && <TimeManagement />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
