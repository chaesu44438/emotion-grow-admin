import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import {
  LoginPage,
  DashboardPage,
  UsersPage,
  StoriesPage,
  AiUsagePage,
} from './pages'
import { ToastProvider } from './components/ui'
import { getMe } from './api'
import type { Admin } from './types'

function App() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then((res) => setAdmin(res.data))
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (token: string, adminData: Admin) => {
    localStorage.setItem('token', token)
    setAdmin(adminData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setAdmin(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/login"
          element={
            admin ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          element={
            admin ? <Layout admin={admin} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/ai-usage" element={<AiUsagePage />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App
