import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WebGLProvider } from './context/WebGLContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebGLProvider>
      <App />
    </WebGLProvider>
  </StrictMode>,
)
