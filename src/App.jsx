import { useState } from 'react'
import Topnav from './components/Topnav'
import Sidebar from './components/Sidebar'
import SignIn from './components/screens/SignIn'
import Dashboard from './components/screens/Dashboard'
import Employee from './components/screens/Employee'
import Profile from './components/screens/Profile'
import TimeManagement from './components/screens/TimeManagement'

const APP_SCREENS = ['dashboard', 'employee', 'profile', 'time']

export default function App() {
  const [screen, setScreen] = useState('dashboard')

  const goTo = (name) => {
    setScreen(APP_SCREENS.includes(name) || name === 'signin' ? name : 'dashboard')
    window.scrollTo(0, 0)
  }

  if (screen === 'signin') {
    return <SignIn onLogin={() => goTo('dashboard')} />
  }

  return (
    <section className="screen is-active" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="app">
        <Topnav />
        <div className="app__body">
          <Sidebar current={screen} goTo={goTo} />
          <main className="app__main">
            {screen === 'dashboard'  && <Dashboard goTo={goTo} />}
            {screen === 'employee'   && <Employee goTo={goTo} />}
            {screen === 'profile'    && <Profile />}
            {screen === 'time'       && <TimeManagement />}
          </main>
        </div>
      </div>
    </section>
  )
}
