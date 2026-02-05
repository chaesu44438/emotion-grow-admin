import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const getMe = () => api.get('/auth/me')

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getUserGrowthChart = (days?: number) =>
  api.get('/dashboard/user-growth', { params: { days } })
export const getAiUsageChart = (days?: number) =>
  api.get('/dashboard/ai-usage-chart', { params: { days } })
export const getSubscriptionStats = () => api.get('/dashboard/subscription-stats')
export const getEmotionStats = () => api.get('/dashboard/emotion-stats')
export const getRecentActivities = (limit?: number) =>
  api.get('/dashboard/recent-activities', { params: { limit } })

// Users
export const getUserStats = () => api.get('/users/stats')
export const getUsers = (params?: {
  page?: number
  limit?: number
  search?: string
  tier?: string
  active?: string
}) => api.get('/users', { params })
export const getUser = (id: string) => api.get(`/users/${id}`)
export const getUserDetail = (id: string) => api.get(`/users/${id}/detail`)
export const updateUser = (id: string, data: Partial<{ isActive: boolean; subscriptionTier: string }>) =>
  api.patch(`/users/${id}`, data)

// AI Usage
export const getAiUsageLogs = (params?: { page?: number; limit?: number; service?: string }) =>
  api.get('/ai-usage', { params })
export const getAiUsageStats = () => api.get('/ai-usage/stats')
export const getCostByService = () => api.get('/ai-usage/cost-by-service')
export const getDailyCost = (days?: number) =>
  api.get('/ai-usage/daily-cost', { params: { days } })
export const getMonthlySummary = () => api.get('/ai-usage/monthly-summary')
export const getDailyCalls = (days?: number) =>
  api.get('/ai-usage/daily-calls', { params: { days } })

// Stories
export const getStoryStats = () => api.get('/stories/stats')
export const getStories = (params?: {
  page?: number
  limit?: number
  status?: string
  emotion?: string
  narrativeType?: string
}) => api.get('/stories', { params })
export const getStory = (id: string) => api.get(`/stories/${id}`)
