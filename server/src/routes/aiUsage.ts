import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/ai-usage
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const service = req.query.service as string
    const skip = (page - 1) * limit

    const where = service ? { service: service as any } : {}

    const [logs, total] = await Promise.all([
      prisma.aiUsageLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aiUsageLog.count({ where }),
    ])

    res.json({ logs, total, page, limit })
  } catch (error) {
    console.error('Get AI usage logs error:', error)
    res.status(500).json({ message: 'AI 사용 로그 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/ai-usage/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.aiUsageLog.findMany({
      select: {
        service: true,
        cost: true,
      },
    })

    const totalCalls = logs.length
    let totalCost = 0
    const byService: Record<string, { calls: number; cost: number }> = {}

    logs.forEach((log) => {
      const cost = log.cost ? parseFloat(log.cost.toString()) : 0
      totalCost += cost

      if (!byService[log.service]) {
        byService[log.service] = { calls: 0, cost: 0 }
      }
      byService[log.service].calls++
      byService[log.service].cost += cost
    })

    res.json({ totalCalls, totalCost, byService })
  } catch (error) {
    console.error('Get AI usage stats error:', error)
    res.status(500).json({ message: 'AI 사용 통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/ai-usage/cost-by-service
router.get('/cost-by-service', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.aiUsageLog.findMany({
      select: {
        service: true,
        cost: true,
      },
    })

    const byService: Record<string, number> = {
      OPENAI_CHAT: 0,
      RECRAFT: 0,
      GOOGLE_TTS: 0,
      OPENAI_TTS: 0,
    }

    logs.forEach((log) => {
      const cost = log.cost ? parseFloat(log.cost.toString()) : 0
      byService[log.service] += cost
    })

    const total = Object.values(byService).reduce((sum, cost) => sum + cost, 0)
    const data = Object.entries(byService).map(([service, cost]) => ({
      service,
      cost: parseFloat(cost.toFixed(4)),
      percentage: total > 0 ? Math.round((cost / total) * 100) : 0,
    }))

    res.json({ data, total: parseFloat(total.toFixed(4)) })
  } catch (error) {
    console.error('Cost by service error:', error)
    res.status(500).json({ message: '서비스별 비용 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/ai-usage/daily-cost
router.get('/daily-cost', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const logs = await prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        service: true,
        cost: true,
      },
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
      const cost = log.cost ? parseFloat(log.cost.toString()) : 0
      if (groupedByDate[dateStr] !== undefined) {
        groupedByDate[dateStr].total += cost
        groupedByDate[dateStr][log.service as keyof Omit<typeof groupedByDate[string], 'total'>] += cost
      }
    })

    const chartData = Object.entries(groupedByDate).map(([date, data]) => ({
      date: date.slice(5),
      total: parseFloat(data.total.toFixed(4)),
      OPENAI_CHAT: parseFloat(data.OPENAI_CHAT.toFixed(4)),
      RECRAFT: parseFloat(data.RECRAFT.toFixed(4)),
      GOOGLE_TTS: parseFloat(data.GOOGLE_TTS.toFixed(4)),
      OPENAI_TTS: parseFloat(data.OPENAI_TTS.toFixed(4)),
    }))

    res.json(chartData)
  } catch (error) {
    console.error('Daily cost error:', error)
    res.status(500).json({ message: '일별 비용 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/ai-usage/monthly-summary
router.get('/monthly-summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [thisMonthLogs, lastMonthLogs] = await Promise.all([
      prisma.aiUsageLog.findMany({
        where: { createdAt: { gte: thisMonthStart } },
        select: { cost: true, createdAt: true },
      }),
      prisma.aiUsageLog.findMany({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        select: { cost: true },
      }),
    ])

    const thisMonthCost = thisMonthLogs.reduce((sum, log) => sum + (log.cost ? parseFloat(log.cost.toString()) : 0), 0)
    const lastMonthCost = lastMonthLogs.reduce((sum, log) => sum + (log.cost ? parseFloat(log.cost.toString()) : 0), 0)

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysPassed = now.getDate()
    const dailyAverage = daysPassed > 0 ? thisMonthCost / daysPassed : 0
    const projectedCost = dailyAverage * daysInMonth

    const changePercent = lastMonthCost > 0
      ? Math.round(((thisMonthCost - lastMonthCost) / lastMonthCost) * 100)
      : 0

    res.json({
      thisMonth: parseFloat(thisMonthCost.toFixed(2)),
      lastMonth: parseFloat(lastMonthCost.toFixed(2)),
      dailyAverage: parseFloat(dailyAverage.toFixed(4)),
      projectedCost: parseFloat(projectedCost.toFixed(2)),
      changePercent,
      totalCalls: thisMonthLogs.length,
    })
  } catch (error) {
    console.error('Monthly summary error:', error)
    res.status(500).json({ message: '월간 요약 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/ai-usage/daily-calls
router.get('/daily-calls', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const logs = await prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        service: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const groupedByDate: Record<string, { OPENAI_CHAT: number; RECRAFT: number; GOOGLE_TTS: number; OPENAI_TTS: number }> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      groupedByDate[dateStr] = { OPENAI_CHAT: 0, RECRAFT: 0, GOOGLE_TTS: 0, OPENAI_TTS: 0 }
    }

    logs.forEach((log) => {
      const dateStr = log.createdAt.toISOString().split('T')[0]
      if (groupedByDate[dateStr] !== undefined) {
        groupedByDate[dateStr][log.service as keyof typeof groupedByDate[string]]++
      }
    })

    const chartData = Object.entries(groupedByDate).map(([date, data]) => ({
      date: date.slice(5),
      ...data,
    }))

    res.json(chartData)
  } catch (error) {
    console.error('Daily calls error:', error)
    res.status(500).json({ message: '일별 호출 수 조회 중 오류가 발생했습니다.' })
  }
})

export default router
