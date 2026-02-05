import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/dashboard/stats (with comparison)
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const [
      totalUsers,
      activeUsers,
      totalStories,
      totalEmotionRecords,
      aiUsageToday,
      newUsersToday,
      // Yesterday's data for comparison
      usersYesterday,
      storiesYesterday,
      emotionsYesterday,
      aiUsageYesterday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.story.count(),
      prisma.emotionRecord.count(),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      // Yesterday counts
      prisma.user.count({ where: { createdAt: { lt: today } } }),
      prisma.story.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.emotionRecord.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    ])

    // Calculate today's counts for comparison
    const storiesToday = await prisma.story.count({ where: { createdAt: { gte: today } } })
    const emotionsToday = await prisma.emotionRecord.count({ where: { createdAt: { gte: today } } })

    res.json({
      totalUsers,
      activeUsers,
      totalStories,
      totalEmotionRecords,
      aiUsageToday,
      newUsersToday,
      // Comparison data
      comparison: {
        users: { today: newUsersToday, yesterday: usersYesterday > 0 ? Math.floor(totalUsers / 30) : 0 },
        stories: { today: storiesToday, yesterday: storiesYesterday },
        emotions: { today: emotionsToday, yesterday: emotionsYesterday },
        aiUsage: { today: aiUsageToday, yesterday: aiUsageYesterday },
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: '통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/dashboard/user-growth
router.get('/user-growth', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const groupedByDate: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      groupedByDate[dateStr] = 0
    }

    users.forEach((user) => {
      const dateStr = user.createdAt.toISOString().split('T')[0]
      if (groupedByDate[dateStr] !== undefined) {
        groupedByDate[dateStr]++
      }
    })

    // Cumulative count
    let cumulative = await prisma.user.count({ where: { createdAt: { lt: startDate } } })
    const chartData = Object.entries(groupedByDate).map(([date, value]) => {
      cumulative += value
      return {
        date: date.slice(5),
        value,
        cumulative,
      }
    })

    res.json(chartData)
  } catch (error) {
    console.error('User growth error:', error)
    res.status(500).json({ message: '사용자 증가 추이 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/dashboard/ai-usage-chart
router.get('/ai-usage-chart', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const logs = await prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, service: true },
      orderBy: { createdAt: 'asc' },
    })

    const groupedByDate: Record<string, { total: number; OPENAI_CHAT: number; RECRAFT: number; GOOGLE_TTS: number; OPENAI_TTS: number }> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      groupedByDate[dateStr] = { total: 0, OPENAI_CHAT: 0, RECRAFT: 0, GOOGLE_TTS: 0, OPENAI_TTS: 0 }
    }

    logs.forEach((log) => {
      const dateStr = log.createdAt.toISOString().split('T')[0]
      if (groupedByDate[dateStr] !== undefined) {
        groupedByDate[dateStr].total++
        groupedByDate[dateStr][log.service as keyof typeof groupedByDate[string]]++
      }
    })

    const chartData = Object.entries(groupedByDate).map(([date, data]) => ({
      date: date.slice(5),
      ...data,
    }))

    res.json(chartData)
  } catch (error) {
    console.error('AI usage chart error:', error)
    res.status(500).json({ message: 'AI 사용량 차트 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/dashboard/subscription-stats
router.get('/subscription-stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true,
    })

    const total = stats.reduce((sum, s) => sum + s._count, 0)
    const data = stats.map(s => ({
      tier: s.subscriptionTier,
      count: s._count,
      percentage: Math.round((s._count / total) * 100),
    }))

    res.json({ data, total })
  } catch (error) {
    console.error('Subscription stats error:', error)
    res.status(500).json({ message: '구독 통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/dashboard/emotion-stats
router.get('/emotion-stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await prisma.emotionRecord.groupBy({
      by: ['emotion'],
      _count: true,
      orderBy: { _count: { emotion: 'desc' } },
    })

    const data = stats.map(s => ({
      emotion: s.emotion,
      count: s._count,
    }))

    res.json(data)
  } catch (error) {
    console.error('Emotion stats error:', error)
    res.status(500).json({ message: '감정 통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/dashboard/recent-activities
router.get('/recent-activities', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: { id: true, displayName: true, createdAt: true, subscriptionTier: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get recent stories
    const recentStories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: { select: { displayName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get recent subscriptions
    const recentSubscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        tier: true,
        status: true,
        createdAt: true,
        user: { select: { displayName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Combine and sort
    const activities = [
      ...recentUsers.map(u => ({
        type: 'user_join' as const,
        message: `${u.displayName || '새 사용자'}님이 가입했습니다`,
        detail: u.subscriptionTier,
        createdAt: u.createdAt,
      })),
      ...recentStories.map(s => ({
        type: 'story_create' as const,
        message: `${s.user.displayName || '사용자'}님이 동화를 생성했습니다`,
        detail: s.title,
        createdAt: s.createdAt,
      })),
      ...recentSubscriptions.map(s => ({
        type: 'subscription' as const,
        message: `${s.user.displayName || '사용자'}님이 ${s.tier}으로 ${s.status === 'ACTIVE' ? '구독' : '변경'}했습니다`,
        detail: s.tier,
        createdAt: s.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)

    res.json(activities)
  } catch (error) {
    console.error('Recent activities error:', error)
    res.status(500).json({ message: '최근 활동 조회 중 오류가 발생했습니다.' })
  }
})

export default router
