import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/stories/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalStories,
      thisWeekStories,
      avgIllustrations,
      ttsCount,
      narrativeStats,
    ] = await Promise.all([
      prisma.story.count(),
      prisma.story.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.story.aggregate({
        _avg: { illustrationCount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.story.count({ where: { ttsGenerated: true } }),
      prisma.story.groupBy({
        by: ['narrativeType'],
        _count: true,
        where: { narrativeType: { not: null } },
      }),
    ])

    const ttsRate = totalStories > 0 ? Math.round((ttsCount / totalStories) * 100) : 0

    const narrativeDistribution = narrativeStats.map(s => ({
      type: s.narrativeType,
      count: s._count,
    }))

    res.json({
      totalStories,
      thisWeekStories,
      avgIllustrations: avgIllustrations._avg.illustrationCount?.toFixed(1) || '0',
      ttsRate,
      narrativeDistribution,
    })
  } catch (error) {
    console.error('Story stats error:', error)
    res.status(500).json({ message: '동화 통계 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/stories
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const emotion = req.query.emotion as string
    const narrativeType = req.query.narrativeType as string
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (emotion && emotion !== 'ALL') {
      where.emotion = emotion
    }

    if (narrativeType && narrativeType !== 'ALL') {
      where.narrativeType = narrativeType
    }

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
          child: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.story.count({ where }),
    ])

    res.json({ stories, total, page, limit })
  } catch (error) {
    console.error('Get stories error:', error)
    res.status(500).json({ message: '동화 목록 조회 중 오류가 발생했습니다.' })
  }
})

// GET /api/stories/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        child: true,
      },
    })

    if (!story) {
      return res.status(404).json({ message: '동화를 찾을 수 없습니다.' })
    }

    res.json(story)
  } catch (error) {
    console.error('Get story error:', error)
    res.status(500).json({ message: '동화 조회 중 오류가 발생했습니다.' })
  }
})

export default router
