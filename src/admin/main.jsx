import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ensureStylesheets } from '../lib/ensureStyles.js'
import App from './App.jsx'
import { ToastProvider } from './ui/Toast'
import './admin.css'

ensureStylesheets()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
