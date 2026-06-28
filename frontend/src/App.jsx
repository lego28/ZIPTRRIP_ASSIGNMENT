import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TodosListPage from './pages/TodosListPage.jsx'
import TodoDetailPage from './pages/TodoDetailPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodosListPage />} />
        <Route path="/todo" element={<TodoDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
