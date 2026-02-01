import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewDesignLanding from './NewDesignLanding.tsx'
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
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)