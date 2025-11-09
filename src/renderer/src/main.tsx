import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const detectPlatform = () => {
  const html = document.documentElement
  const navigatorWithUA = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platformSource =
    navigatorWithUA.userAgentData?.platform || navigator.platform || navigator.userAgent || ''
  const platform = platformSource.toLowerCase()

  if (platform.includes('mac')) {
    html.classList.add('platform-mac')
  } else if (platform.includes('win')) {
    html.classList.add('platform-windows')
  } else {
    html.classList.add('platform-generic')
  }
}

detectPlatform()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
