import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Aplicar tema guardado antes del primer render para evitar flash
const savedTheme = localStorage.getItem('gym-theme');
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
