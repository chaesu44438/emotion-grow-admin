import { useState, useEffect } from 'react'
import { getMe } from '../api'
import type { Admin } from '../types'

export function useAuth() {
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

  const login = (token: string, adminData: Admin) => {
    localStorage.setItem('token', token)
    setAdmin(adminData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAdmin(null)
  }

  return { admin, loading, login, logout, isAuthenticated: !!admin }
}
