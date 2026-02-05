export interface Admin {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  firebaseUid: string
  email: string | null
  displayName: string | null
  provider: string | null
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM'
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    children: number
    stories: number
    emotionRecords: number
  }
}

export interface Child {
  id: string
  userId: string
  name: string
  birthDate: string | null
  gender: string | null
  ageGroup: string | null
  createdAt: string
}

export interface Story {
  id: string
  userId: string
  childId: string | null
  title: string
  content: string | null
  emotion: string | null
  narrativeType: string | null
  illustrationCount: number
  ttsGenerated: boolean
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  user?: User
  child?: Child
}

export interface AiUsageLog {
  id: string
  userId: string
  service: 'OPENAI_CHAT' | 'OPENAI_TTS' | 'GOOGLE_TTS' | 'RECRAFT'
  action: string
  model: string | null
  inputTokens: number | null
  outputTokens: number | null
  cost: string | null
  status: string
  errorMessage: string | null
  responseTime: number | null
  createdAt: string
  user?: User
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalStories: number
  totalEmotionRecords: number
  aiUsageToday: number
  newUsersToday: number
}

export interface ChartData {
  date: string
  value: number
}

export interface LoginResponse {
  token: string
  admin: Admin
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
