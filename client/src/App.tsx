import { useState } from 'react'
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
import type { Admin } from './types'

// 포트폴리오용 더미 관리자 (로그인 우회)
const DEMO_ADMIN: Admin = {
  id: 'demo-admin',
  email: 'admin@emotiongrow.com',
  name: '관리자',
  role: 'SUPER_ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

function App() {
  // 포트폴리오용: 항상 로그인된 상태로 시작
  const [admin, setAdmin] = useState<Admin | null>(DEMO_ADMIN)

  const handleLogin = (_token: string, adminData: Admin) => {
    setAdmin(adminData)
  }

  const handleLogout = () => {
    // 포트폴리오용: 로그아웃해도 데모 관리자로 유지
    setAdmin(DEMO_ADMIN)
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
