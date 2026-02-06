// Portfolio Demo Mode - Using Mock Data
import {
  mockUsers,
  mockStories,
  mockDashboardStats,
  mockUserGrowthChart,
  mockAiUsageChart,
  mockSubscriptionStats,
  mockEmotionStats,
  mockRecentActivities,
  mockUserStats,
  mockStoryStats,
  mockAiUsageStats,
  mockCostByService,
  mockDailyCost,
  mockMonthlySummary,
  mockDailyCalls,
  mockAiUsageLogs,
  getUserDetailMock,
  getStoryDetailMock,
  mockAdmin,
} from './mockData'

// Helper to simulate API response
const mockResponse = <T>(data: T) => Promise.resolve({ data })

// Auth (not needed in demo mode, but kept for reference)
export const login = (_email: string, _password: string) =>
  mockResponse({ token: 'demo-token', admin: mockAdmin })

export const getMe = () => mockResponse(mockAdmin)

// Dashboard
export const getDashboardStats = () => mockResponse(mockDashboardStats)
export const getUserGrowthChart = (_days?: number) => mockResponse(mockUserGrowthChart)
export const getAiUsageChart = (_days?: number) => mockResponse(mockAiUsageChart)
export const getSubscriptionStats = () => mockResponse(mockSubscriptionStats)
export const getEmotionStats = () => mockResponse(mockEmotionStats)
export const getRecentActivities = (_limit?: number) => mockResponse(mockRecentActivities)

// Users
export const getUserStats = () => mockResponse(mockUserStats)
export const getUsers = (params?: {
  page?: number
  limit?: number
  search?: string
  tier?: string
  active?: string
}) => {
  let filtered = [...mockUsers]

  // Filter by tier
  if (params?.tier && params.tier !== 'ALL') {
    filtered = filtered.filter(u => u.subscriptionTier === params.tier)
  }

  // Filter by active status
  if (params?.active === 'true') {
    filtered = filtered.filter(u => u.isActive)
  } else if (params?.active === 'false') {
    filtered = filtered.filter(u => !u.isActive)
  }

  // Search
  if (params?.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(u =>
      u.displayName?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    )
  }

  // Pagination
  const page = params?.page || 1
  const limit = params?.limit || 10
  const start = (page - 1) * limit
  const paged = filtered.slice(start, start + limit)

  return mockResponse({ users: paged, total: filtered.length })
}

export const getUser = (id: string) => {
  const user = mockUsers.find(u => u.id === id)
  return mockResponse(user)
}

export const getUserDetail = (id: string) => {
  const detail = getUserDetailMock(id)
  return mockResponse(detail)
}

export const updateUser = (id: string, _data: Partial<{ isActive: boolean; subscriptionTier: string }>) => {
  const user = mockUsers.find(u => u.id === id)
  return mockResponse(user)
}

// AI Usage
export const getAiUsageLogs = (params?: { page?: number; limit?: number; service?: string }) => {
  let filtered = [...mockAiUsageLogs]

  // Filter by service
  if (params?.service && params.service !== 'ALL') {
    filtered = filtered.filter(log => log.service === params.service)
  }

  // Pagination
  const page = params?.page || 1
  const limit = params?.limit || 10
  const start = (page - 1) * limit
  const paged = filtered.slice(start, start + limit)

  return mockResponse({ logs: paged, total: filtered.length })
}

export const getAiUsageStats = () => mockResponse(mockAiUsageStats)
export const getCostByService = () => mockResponse(mockCostByService)
export const getDailyCost = (_days?: number) => mockResponse(mockDailyCost)
export const getMonthlySummary = () => mockResponse(mockMonthlySummary)
export const getDailyCalls = (_days?: number) => mockResponse(mockDailyCalls)

// Stories
export const getStoryStats = () => mockResponse(mockStoryStats)
export const getStories = (params?: {
  page?: number
  limit?: number
  status?: string
  emotion?: string
  narrativeType?: string
}) => {
  let filtered = [...mockStories]

  // Filter by status
  if (params?.status && params.status !== 'ALL') {
    filtered = filtered.filter(s => s.status === params.status)
  }

  // Filter by emotion
  if (params?.emotion && params.emotion !== 'ALL') {
    filtered = filtered.filter(s => s.emotion === params.emotion)
  }

  // Filter by narrative type
  if (params?.narrativeType && params.narrativeType !== 'ALL') {
    filtered = filtered.filter(s => s.narrativeType === params.narrativeType)
  }

  // Pagination
  const page = params?.page || 1
  const limit = params?.limit || 10
  const start = (page - 1) * limit
  const paged = filtered.slice(start, start + limit)

  return mockResponse({ stories: paged, total: filtered.length })
}

export const getStory = (id: string) => {
  const detail = getStoryDetailMock(id)
  return mockResponse(detail)
}
