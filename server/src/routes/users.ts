import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/users/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalUsers, newThisWeek, paidUsers, inactiveUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { subscriptionTier: { in: ['BASIC', 'PREMIUM'] } } }),
      prisma.user.count({ where: { isActive: false } }),
    ])

    const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0

    res.json({
      totalUsers,
      newThisWeek,
      paidUsers,
      inactiveUsers,
      conversionRate,
    })
  } catch (error) {
    console.error('User stats error:', error)
    res.status(500).json({ message: '사용자 통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/users
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = (req.query.search as string) || ''
    const tier = req.query.tier as string
    const active = req.query.active as string
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tier && tier !== 'ALL') {
      where.subscriptionTier = tier
    }

    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
          provider: true,
          subscriptionTier: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              children: true,
              stories: true,
              emotionRecords: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    res.json({ users, total, page, limit })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/users/:id/detail
router.get('/:id/detail', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const [user, recentEmotions, recentStories, aiUsageStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        include: {
          children: {
            select: {
              id: true,
              name: true,
              birthDate: true,
              gender: true,
              ageGroup: true,
            },
          },
        },
      }),
      prisma.emotionRecord.findMany({
        where: { userId: id },
        select: {
          id: true,
          emotion: true,
          intensity: true,
          note: true,
          context: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.story.findMany({
        where: { userId: id },
        select: {
          id: true,
          title: true,
          emotion: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.aiUsageLog.aggregate({
        where: { userId: id },
        _count: true,
        _sum: { cost: true },
      }),
    ])

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    res.json({
      ...user,
      recentEmotions,
      recentStories,
      aiUsage: {
        totalCalls: aiUsageStats._count,
        totalCost: aiUsageStats._sum.cost ? parseFloat(aiUsageStats._sum.cost.toString()) : 0,
      },
    })
  } catch (error) {
    console.error('Get user detail error:', error)
    res.status(500).json({ message: '사용자 상세 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/users/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        children: true,
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: {
          select: {
            stories: true,
            emotionRecords: true,
            aiUsageLogs: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: '사용자 조회 중 오류가 발생했습니다.' })
  }
})

// PATCH /api/users/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { isActive, subscriptionTier } = req.body

    const updateData: { isActive?: boolean; subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' } = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (subscriptionTier) updateData.subscriptionTier = subscriptionTier

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionTier: true,
        isActive: true,
        updatedAt: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: '사용자 수정 중 오류가 발생했습니다.' })
  }
})

export default router
