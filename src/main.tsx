import React from 'react'
import ReactDOM from 'react-dom/client'
// Temporarily disable Sentry to resolve loading issues
// import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'

// Initialize Sentry for error monitoring
// Temporarily disabled to troubleshoot loading issues
// Sentry.init({
//   dsn: import.meta.env.VITE_SENTRY_DSN || '',
//   environment: import.meta.env.MODE, 
//   integrations: [
//     new Sentry.BrowserTracing(),
//   ],
//   tracesSampleRate: 1.0,
//   enabled: import.meta.env.PROD,
// })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)