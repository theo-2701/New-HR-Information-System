import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './css/tokens.css'
import './css/app.css'
import './css/dashboard.css'
import './css/employee.css'
import './css/employee-modals.css'
import './css/add-employee.css'
import './css/inbox.css'
import './css/notifications.css'
import './css/auth.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
