import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewDesignLanding from './NewDesignLanding.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewDesignLanding />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)