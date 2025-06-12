import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import AppNew from './AppNew.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
      {/*<AppNew/>*/}
  </StrictMode>,
)
