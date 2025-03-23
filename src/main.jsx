import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './main.css'
import logger from './utils/logger' // Import logger

// Initialize logger on application startup
logger.info('Application starting', {
  version: import.meta.env.VITE_APP_VERSION || 'dev',
  environment: import.meta.env.MODE
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)