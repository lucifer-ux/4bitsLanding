import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InteractiveEarthWebsite from '../earth-website.tsx'
import NewDesignLanding from './NewDesignLanding.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InteractiveEarthWebsite />} />
        <Route path="/newdesign" element={<NewDesignLanding />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)