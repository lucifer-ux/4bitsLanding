import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewDesignLanding from './NewDesignLanding.tsx'
import Dashboard from './Dashboard.tsx'
import { MantineProvider } from '@mantine/core';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MantineProvider>
          <NewDesignLanding />
        </MantineProvider>
          } />
        <Route path="/dashboard" element={
          <MantineProvider>
            <Dashboard />
          </MantineProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
