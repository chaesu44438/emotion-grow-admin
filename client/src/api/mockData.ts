// Mock Data for Portfolio Demo
import type { User, AiUsageLog } from '../types'

// Full User type for stories
const createFullUser = (id: string, displayName: string, email: string): User => ({
  id,
  firebaseUid: `fb-${id}`,
  displayName,
  email,
  provider: 'google',
  subscriptionTier: 'FREE',
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Users
export const mockUsers: User[] = [
  {
    id: '1',
    firebaseUid: 'fb-1',
    displayName: '오서현',
    email: 'user10@kakao.com',
    subscriptionTier: 'FREE',
    isActive: true,
    provider: 'kakao',
    createdAt: '2026-02-04T10:00:00Z',
    lastLoginAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-04T10:00:00Z',
    _count: { children: 1, stories: 3, emotionRecords: 8 },
  },
  {
    id: '2',
    firebaseUid: 'fb-2',
    displayName: '조민서',
    email: 'user14@apple.com',
    subscriptionTier: 'FREE',
    isActive: true,
    provider: 'apple',
    createdAt: '2026-02-02T10:00:00Z',
    lastLoginAt: '2026-02-04T10:00:00Z',
    updatedAt: '2026-02-02T10:00:00Z',
    _count: { children: 2, stories: 5, emotionRecords: 12 },
  },
  {
    id: '3',
    firebaseUid: 'fb-3',
    displayName: '송수아',
    email: 'user51@google.com',
    subscriptionTier: 'BASIC',
    isActive: true,
    provider: 'google',
    createdAt: '2026-02-01T10:00:00Z',
    lastLoginAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    _count: { children: 1, stories: 8, emotionRecords: 15 },
  },
  {
    id: '4',
    firebaseUid: 'fb-4',
    displayName: '신지원',
    email: 'user16@naver.com',
    subscriptionTier: 'FREE',
    isActive: true,
    provider: 'naver',
    createdAt: '2026-02-01T10:00:00Z',
    lastLoginAt: '2026-02-04T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    _count: { children: 1, stories: 2, emotionRecords: 5 },
  },
  {
    id: '5',
    firebaseUid: 'fb-5',
    displayName: '오지호',
    email: 'user52@google.com',
    subscriptionTier: 'BASIC',
    isActive: true,
    provider: 'google',
    createdAt: '2026-02-01T10:00:00Z',
    lastLoginAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    _count: { children: 2, stories: 10, emotionRecords: 20 },
  },
  {
    id: '6',
    firebaseUid: 'fb-6',
    displayName: '박지아',
    email: 'user55@google.com',
    subscriptionTier: 'BASIC',
    isActive: false,
    provider: 'google',
    createdAt: '2026-01-31T10:00:00Z',
    lastLoginAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z',
    _count: { children: 1, stories: 4, emotionRecords: 7 },
  },
  {
    id: '7',
    firebaseUid: 'fb-7',
    displayName: '송서윤',
    email: 'user27@naver.com',
    subscriptionTier: 'FREE',
    isActive: true,
    provider: 'naver',
    createdAt: '2026-01-31T10:00:00Z',
    lastLoginAt: '2026-01-29T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z',
    _count: { children: 1, stories: 6, emotionRecords: 11 },
  },
  {
    id: '8',
    firebaseUid: 'fb-8',
    displayName: '조유진',
    email: 'user47@google.com',
    subscriptionTier: 'FREE',
    isActive: true,
    provider: 'google',
    createdAt: '2026-01-30T10:00:00Z',
    lastLoginAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-01-30T10:00:00Z',
    _count: { children: 2, stories: 7, emotionRecords: 14 },
  },
  {
    id: '9',
    firebaseUid: 'fb-9',
    displayName: '김하은',
    email: 'user33@kakao.com',
    subscriptionTier: 'PREMIUM',
    isActive: true,
    provider: 'kakao',
    createdAt: '2026-01-28T10:00:00Z',
    lastLoginAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
    _count: { children: 3, stories: 15, emotionRecords: 30 },
  },
  {
    id: '10',
    firebaseUid: 'fb-10',
    displayName: '이도윤',
    email: 'user22@apple.com',
    subscriptionTier: 'PREMIUM',
    isActive: true,
    provider: 'apple',
    createdAt: '2026-01-25T10:00:00Z',
    lastLoginAt: '2026-02-04T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
    _count: { children: 2, stories: 12, emotionRecords: 25 },
  },
]

// Stories with full User type
export const mockStories = [
  {
    id: '1',
    userId: '9',
    childId: 'child-1',
    title: '마음이 자라는 시간',
    content: '어느 날 작은 마을에 사는 민지는 학교에서 친구와 다퉜습니다. 집에 돌아온 민지는 속상한 마음을 어떻게 해야 할지 몰랐습니다...',
    emotion: 'frustrated',
    narrativeType: 'adventure',
    illustrationCount: 0,
    ttsGenerated: false,
    status: 'FAILED' as const,
    createdAt: '2026-02-05T14:30:00Z',
    user: createFullUser('9', '김하은', 'user33@kakao.com'),
  },
  {
    id: '2',
    userId: '10',
    childId: 'child-2',
    title: '구름 위의 성',
    content: '하늘 높이 떠 있는 구름 위에는 아무도 모르는 작은 성이 있었어요. 그 성에는 구름 요정들이 살고 있었답니다...',
    emotion: 'angry',
    narrativeType: 'healing',
    illustrationCount: 4,
    ttsGenerated: true,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-05T11:20:00Z',
    user: createFullUser('10', '이도윤', 'user22@apple.com'),
  },
  {
    id: '3',
    userId: '3',
    childId: 'child-3',
    title: '기쁨을 전해요',
    content: '숲 속 작은 토끼 뽀미는 오늘도 친구들에게 기쁨을 전하러 나섰어요. 첫 번째로 만난 건 슬퍼 보이는 다람쥐 친구였어요...',
    emotion: 'tired',
    narrativeType: 'healing',
    illustrationCount: 6,
    ttsGenerated: false,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-04T16:45:00Z',
    user: createFullUser('3', '송수아', 'user51@google.com'),
  },
  {
    id: '4',
    userId: '1',
    childId: 'child-4',
    title: '별빛 친구들',
    content: '밤하늘에 반짝이는 별들은 사실 우리의 친구들이에요. 오늘 밤, 별똥별 하나가 지구로 내려왔어요...',
    emotion: 'happy',
    narrativeType: 'friendship',
    illustrationCount: 5,
    ttsGenerated: true,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-04T09:15:00Z',
    user: createFullUser('1', '오서현', 'user10@kakao.com'),
  },
  {
    id: '5',
    userId: '5',
    childId: 'child-5',
    title: '용기를 찾아서',
    content: '어린 사자 레오는 다른 동물들 앞에서 말하는 게 너무 무서웠어요. 하지만 숲의 현자 올빼미가 특별한 여행을 제안했답니다...',
    emotion: 'anxious',
    narrativeType: 'courage',
    illustrationCount: 4,
    ttsGenerated: true,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-03T13:30:00Z',
    user: createFullUser('5', '오지호', 'user52@google.com'),
  },
  {
    id: '6',
    userId: '2',
    childId: 'child-6',
    title: '무지개 숲의 비밀',
    content: '비가 온 뒤 나타나는 무지개 끝에는 신비로운 숲이 있대요. 호기심 많은 지우는 그 숲을 찾아 모험을 떠났어요...',
    emotion: 'sad',
    narrativeType: 'growth',
    illustrationCount: 5,
    ttsGenerated: false,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-03T10:00:00Z',
    user: createFullUser('2', '조민서', 'user14@apple.com'),
  },
  {
    id: '7',
    userId: '4',
    childId: 'child-7',
    title: '작은 영웅의 하루',
    content: '평범한 아이 준이가 어느 날 특별한 힘을 갖게 되었어요. 하지만 영웅이 된다는 건 생각보다 어려운 일이었답니다...',
    emotion: 'anxious',
    narrativeType: 'adventure',
    illustrationCount: 2,
    ttsGenerated: false,
    status: 'GENERATING' as const,
    createdAt: '2026-02-02T15:20:00Z',
    user: createFullUser('4', '신지원', 'user16@naver.com'),
  },
  {
    id: '8',
    userId: '7',
    childId: 'child-8',
    title: '가족의 온기',
    content: '추운 겨울날, 작은 펭귄 뽀로는 가족들과 떨어지게 되었어요. 하지만 가족의 사랑은 어떤 추위도 녹일 수 있답니다...',
    emotion: 'grateful',
    narrativeType: 'family',
    illustrationCount: 4,
    ttsGenerated: true,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-02T11:45:00Z',
    user: createFullUser('7', '송서윤', 'user27@naver.com'),
  },
  {
    id: '9',
    userId: '8',
    childId: 'child-9',
    title: '꿈꾸는 아이',
    content: '매일 밤 신기한 꿈을 꾸는 소녀 하늘이. 오늘 밤은 어떤 모험이 기다리고 있을까요? 꿈속 세계로 함께 떠나볼까요?',
    emotion: 'happy',
    narrativeType: 'dream',
    illustrationCount: 5,
    ttsGenerated: true,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-01T14:00:00Z',
    user: createFullUser('8', '조유진', 'user47@google.com'),
  },
  {
    id: '10',
    userId: '6',
    childId: 'child-10',
    title: '친구와 함께',
    content: '새로 전학 온 아이와 친해지고 싶었던 민수. 하지만 먼저 다가가는 게 너무 어려웠어요. 용기를 내볼까요?',
    emotion: 'proud',
    narrativeType: 'empathy',
    illustrationCount: 4,
    ttsGenerated: false,
    status: 'COMPLETED' as const,
    createdAt: '2026-02-01T09:30:00Z',
    user: createFullUser('6', '박지아', 'user55@google.com'),
  },
]

// Dashboard Stats
export const mockDashboardStats = {
  totalUsers: 80,
  activeUsers: 75,
  totalStories: 150,
  totalEmotionRecords: 340,
  aiUsageToday: 47,
  newUsersToday: 3,
  comparison: {
    users: { today: 3, yesterday: 2 },
    stories: { today: 8, yesterday: 5 },
    emotions: { today: 15, yesterday: 12 },
    aiUsage: { today: 47, yesterday: 38 },
  },
}

// User Growth Chart (30 days)
export const mockUserGrowthChart = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const baseValue = 50 + i * 1
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    value: Math.floor(Math.random() * 3) + 1,
    cumulative: baseValue + Math.floor(Math.random() * 5),
  }
})

// AI Usage Chart (30 days)
export const mockAiUsageChart = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    total: 30 + Math.floor(Math.random() * 30),
  }
})

// Subscription Stats
export const mockSubscriptionStats = {
  data: [
    { tier: 'FREE', count: 45, percentage: 56 },
    { tier: 'BASIC', count: 23, percentage: 29 },
    { tier: 'PREMIUM', count: 12, percentage: 15 },
  ],
  total: 80,
}

// Emotion Stats
export const mockEmotionStats = [
  { emotion: 'happy', count: 85 },
  { emotion: 'sad', count: 42 },
  { emotion: 'angry', count: 28 },
  { emotion: 'anxious', count: 35 },
  { emotion: 'tired', count: 48 },
  { emotion: 'grateful', count: 52 },
  { emotion: 'proud', count: 30 },
  { emotion: 'frustrated', count: 20 },
]

// Recent Activities
export const mockRecentActivities = [
  { type: 'user_join' as const, message: '새로운 사용자가 가입했습니다', detail: '오서현 (Kakao)', createdAt: '2026-02-05T14:30:00Z' },
  { type: 'story_create' as const, message: '새 동화가 생성되었습니다', detail: '구름 위의 성', createdAt: '2026-02-05T11:20:00Z' },
  { type: 'subscription' as const, message: '구독이 업그레이드되었습니다', detail: '김하은: BASIC → PREMIUM', createdAt: '2026-02-05T09:00:00Z' },
  { type: 'story_create' as const, message: '새 동화가 생성되었습니다', detail: '별빛 친구들', createdAt: '2026-02-04T16:45:00Z' },
  { type: 'user_join' as const, message: '새로운 사용자가 가입했습니다', detail: '조민서 (Apple)', createdAt: '2026-02-04T10:15:00Z' },
]

// User Stats
export const mockUserStats = {
  totalUsers: 80,
  newThisWeek: 9,
  paidUsers: 35,
  inactiveUsers: 5,
  conversionRate: 38,
}

// Story Stats
export const mockStoryStats = {
  totalStories: 150,
  thisWeekStories: 13,
  avgIllustrations: '4.6',
  ttsRate: 63,
  narrativeDistribution: [
    { type: 'friendship', count: 19 },
    { type: 'growth', count: 18 },
    { type: 'dream', count: 27 },
    { type: 'adventure', count: 15 },
    { type: 'empathy', count: 16 },
    { type: 'healing', count: 25 },
    { type: 'family', count: 12 },
    { type: 'courage', count: 18 },
  ],
}

// AI Usage Stats (with byService)
export const mockAiUsageStats = {
  totalCalls: 4280,
  totalCost: 127.45,
  byService: {
    OPENAI_CHAT: { calls: 3200, cost: 85.20 },
    RECRAFT: { calls: 280, cost: 11.00 },
    GOOGLE_TTS: { calls: 350, cost: 8.75 },
    OPENAI_TTS: { calls: 450, cost: 22.50 },
  },
}

// Cost by Service (with total)
export const mockCostByService = {
  data: [
    { service: 'OPENAI_CHAT', cost: 85.20, percentage: 67 },
    { service: 'OPENAI_TTS', cost: 22.50, percentage: 18 },
    { service: 'RECRAFT', cost: 11.00, percentage: 8 },
    { service: 'GOOGLE_TTS', cost: 8.75, percentage: 7 },
  ],
  total: 127.45,
}

// Daily Cost (30 days) with service breakdown
export const mockDailyCost = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const openaiChat = 1.5 + Math.random() * 2
  const recraft = 0.2 + Math.random() * 0.5
  const googleTts = 0.15 + Math.random() * 0.3
  const openaiTts = 0.4 + Math.random() * 0.8
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    total: openaiChat + recraft + googleTts + openaiTts,
    OPENAI_CHAT: openaiChat,
    RECRAFT: recraft,
    GOOGLE_TTS: googleTts,
    OPENAI_TTS: openaiTts,
  }
})

// Monthly Summary
export const mockMonthlySummary = {
  thisMonth: 127.45,
  lastMonth: 112.80,
  dailyAverage: 4.25,
  projectedCost: 148.50,
  changePercent: 13,
  totalCalls: 4280,
}

// Daily Calls (30 days) with service breakdown
export const mockDailyCalls = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    OPENAI_CHAT: 80 + Math.floor(Math.random() * 40),
    RECRAFT: 5 + Math.floor(Math.random() * 10),
    GOOGLE_TTS: 8 + Math.floor(Math.random() * 12),
    OPENAI_TTS: 10 + Math.floor(Math.random() * 15),
  }
})

// AI Usage Logs with proper types
export const mockAiUsageLogs: AiUsageLog[] = [
  { id: '1', userId: '9', service: 'OPENAI_CHAT', action: 'story_generation', model: 'gpt-4', inputTokens: 850, outputTokens: 1200, cost: '0.045', status: 'success', errorMessage: null, responseTime: 2100, createdAt: '2026-02-05T14:32:00Z' },
  { id: '2', userId: '10', service: 'RECRAFT', action: 'illustration_generation', model: 'recraft-v3', inputTokens: null, outputTokens: null, cost: '0.04', status: 'success', errorMessage: null, responseTime: 8500, createdAt: '2026-02-05T14:30:00Z' },
  { id: '3', userId: '3', service: 'OPENAI_TTS', action: 'tts_generation', model: 'tts-1', inputTokens: null, outputTokens: null, cost: '0.03', status: 'success', errorMessage: null, responseTime: 3200, createdAt: '2026-02-05T14:28:00Z' },
  { id: '4', userId: '1', service: 'OPENAI_CHAT', action: 'emotion_analysis', model: 'gpt-4', inputTokens: 320, outputTokens: 180, cost: '0.012', status: 'success', errorMessage: null, responseTime: 1500, createdAt: '2026-02-05T14:25:00Z' },
  { id: '5', userId: '5', service: 'OPENAI_CHAT', action: 'story_generation', model: 'gpt-4', inputTokens: 920, outputTokens: 1350, cost: '0.052', status: 'success', errorMessage: null, responseTime: 2800, createdAt: '2026-02-05T14:20:00Z' },
  { id: '6', userId: '2', service: 'GOOGLE_TTS', action: 'tts_generation', model: 'wavenet', inputTokens: null, outputTokens: null, cost: '0.025', status: 'success', errorMessage: null, responseTime: 2100, createdAt: '2026-02-05T14:15:00Z' },
  { id: '7', userId: '4', service: 'RECRAFT', action: 'illustration_generation', model: 'recraft-v3', inputTokens: null, outputTokens: null, cost: '0.04', status: 'failed', errorMessage: 'Rate limit exceeded', responseTime: 500, createdAt: '2026-02-05T14:10:00Z' },
  { id: '8', userId: '7', service: 'OPENAI_CHAT', action: 'story_generation', model: 'gpt-4', inputTokens: 780, outputTokens: 1100, cost: '0.042', status: 'success', errorMessage: null, responseTime: 2400, createdAt: '2026-02-05T14:05:00Z' },
  { id: '9', userId: '8', service: 'OPENAI_TTS', action: 'tts_generation', model: 'tts-1-hd', inputTokens: null, outputTokens: null, cost: '0.06', status: 'success', errorMessage: null, responseTime: 4500, createdAt: '2026-02-05T14:00:00Z' },
  { id: '10', userId: '6', service: 'OPENAI_CHAT', action: 'emotion_analysis', model: 'gpt-4', inputTokens: 280, outputTokens: 150, cost: '0.01', status: 'success', errorMessage: null, responseTime: 1200, createdAt: '2026-02-05T13:55:00Z' },
]

// User Detail (for modal)
export const getUserDetailMock = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return null

  return {
    ...user,
    children: [
      { id: `child-${userId}-1`, name: `${user.displayName?.slice(0, 1)}아이`, birthDate: '2020-05-15' as string | null, gender: 'female' as string | null, ageGroup: '5-6' as string | null },
    ],
    recentEmotions: [
      { id: `emo-${userId}-1`, emotion: 'happy', intensity: 4, note: '오늘 친구와 재미있게 놀았어요' as string | null, context: 'play' as string | null, createdAt: '2026-02-05T10:00:00Z' },
      { id: `emo-${userId}-2`, emotion: 'tired', intensity: 3, note: '유치원 다녀와서 피곤해요' as string | null, context: 'school' as string | null, createdAt: '2026-02-04T18:00:00Z' },
      { id: `emo-${userId}-3`, emotion: 'proud', intensity: 5, note: '그림 잘 그렸다고 칭찬받았어요' as string | null, context: 'achievement' as string | null, createdAt: '2026-02-03T15:00:00Z' },
    ],
    recentStories: mockStories.filter(s => s.userId === userId).slice(0, 3).map(s => ({
      id: s.id,
      title: s.title,
      emotion: s.emotion as string | null,
      status: s.status,
      createdAt: s.createdAt,
    })),
    aiUsage: {
      totalCalls: 45 + Math.floor(Math.random() * 50),
      totalCost: 2.5 + Math.random() * 5,
    },
  }
}

// Story Detail (for modal)
export const getStoryDetailMock = (storyId: string) => {
  const story = mockStories.find(s => s.id === storyId)
  if (!story) return null

  return {
    ...story,
    child: {
      id: `child-${story.userId}`,
      name: '아이',
      ageGroup: '5-6',
      gender: 'female',
    },
  }
}

// Admin for login
export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@emotiongrow.com',
  name: '관리자',
  role: 'SUPER_ADMIN' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
