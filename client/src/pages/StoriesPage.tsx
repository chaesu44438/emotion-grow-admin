import { useState, useEffect } from 'react'
import { BookOpen, Calendar, Image, Volume2, User } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Modal,
} from '../components/ui'
import { getStories, getStoryStats, getStory } from '../api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Story } from '../types'

interface StoryStats {
  totalStories: number
  thisWeekStories: number
  avgIllustrations: string
  ttsRate: number
  narrativeDistribution: Array<{ type: string; count: number }>
}

interface StoryDetail extends Omit<Story, 'child'> {
  child: {
    id: string
    name: string
    ageGroup: string | null
    gender: string | null
  } | undefined
}

const STATUS_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'GENERATING', label: '생성 중' },
  { value: 'FAILED', label: '실패' },
] as const

const EMOTIONS = [
  { value: 'ALL', label: '전체 감정' },
  { value: 'happy', label: '행복' },
  { value: 'sad', label: '슬픔' },
  { value: 'angry', label: '분노' },
  { value: 'anxious', label: '불안' },
  { value: 'tired', label: '피곤' },
  { value: 'grateful', label: '감사' },
  { value: 'proud', label: '자랑' },
  { value: 'frustrated', label: '좌절' },
]

const NARRATIVE_TYPES = [
  { value: 'ALL', label: '전체 구조' },
  { value: 'growth', label: '성장' },
  { value: 'adventure', label: '모험' },
  { value: 'friendship', label: '우정' },
  { value: 'healing', label: '힐링' },
  { value: 'courage', label: '용기' },
  { value: 'family', label: '가족' },
  { value: 'empathy', label: '공감' },
  { value: 'dream', label: '꿈' },
]

const NARRATIVE_LABELS: Record<string, string> = {
  growth: '성장', adventure: '모험', friendship: '우정', healing: '힐링',
  courage: '용기', family: '가족', empathy: '공감', dream: '꿈',
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  GENERATING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: '완료',
  GENERATING: '생성 중',
  FAILED: '실패',
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState<StoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [emotionFilter, setEmotionFilter] = useState('ALL')
  const [narrativeFilter, setNarrativeFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedStory, setSelectedStory] = useState<StoryDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const limit = 10

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStoryStats()
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch story stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true)
      try {
        const response = await getStories({
          page,
          limit,
          status: statusFilter,
          emotion: emotionFilter,
          narrativeType: narrativeFilter,
        })
        setStories(response.data.stories)
        setTotal(response.data.total)
      } catch (error) {
        console.error('Failed to fetch stories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [page, statusFilter, emotionFilter, narrativeFilter])

  const handleStoryClick = async (storyId: string) => {
    setModalLoading(true)
    try {
      const res = await getStory(storyId)
      setSelectedStory(res.data)
    } catch (error) {
      console.error('Failed to fetch story detail:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">동화 관리</h1>
        <p className="text-gray-500">생성된 동화를 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 동화</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalStories || 0}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 주 생성</p>
              <p className="text-xl font-bold text-gray-900">{stats?.thisWeekStories || 0}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Image size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">평균 삽화</p>
              <p className="text-xl font-bold text-gray-900">{stats?.avgIllustrations || 0}장</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Volume2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">TTS 생성률</p>
              <p className="text-xl font-bold text-gray-900">{stats?.ttsRate || 0}%</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Narrative Distribution Chart */}
      {stats?.narrativeDistribution && stats.narrativeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">스토리 구조별 분포</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.narrativeDistribution.map(d => ({
                    ...d,
                    name: NARRATIVE_LABELS[d.type || ''] || d.type,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value}편`, '동화 수']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-900">동화 목록</h3>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Emotion Filter */}
              <select
                value={emotionFilter}
                onChange={(e) => {
                  setEmotionFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {EMOTIONS.map((emotion) => (
                  <option key={emotion.value} value={emotion.value}>
                    {emotion.label}
                  </option>
                ))}
              </select>

              {/* Narrative Filter */}
              <select
                value={narrativeFilter}
                onChange={(e) => {
                  setNarrativeFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {NARRATIVE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">제목</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">작성자</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">감정</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">구조</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">상태</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">삽화</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">TTS</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">생성일</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stories.map((story, idx) => (
                      <tr
                        key={story.id}
                        className={`cursor-pointer hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                        onClick={() => handleStoryClick(story.id)}
                      >
                        <TableCell>
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {story.title}
                          </p>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {story.user?.displayName || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {story.emotion || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {NARRATIVE_LABELS[story.narrativeType || ''] || story.narrativeType || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[story.status]}`}>
                            {STATUS_LABELS[story.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {story.illustrationCount}장
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              story.ttsGenerated
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {story.ttsGenerated ? '생성됨' : '없음'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(story.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="text-sm text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Story Detail Modal */}
      <Modal
        isOpen={!!selectedStory || modalLoading}
        onClose={() => setSelectedStory(null)}
        title="동화 상세 정보"
        size="lg"
      >
        {modalLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : selectedStory && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedStory.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedStory.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">감정</p>
                <p className="font-medium text-gray-900">{selectedStory.emotion || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">스토리 구조</p>
                <p className="font-medium text-gray-900">
                  {NARRATIVE_LABELS[selectedStory.narrativeType || ''] || selectedStory.narrativeType || '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">삽화 수</p>
                <p className="font-medium text-gray-900">{selectedStory.illustrationCount}장</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">TTS</p>
                <p className="font-medium text-gray-900">
                  {selectedStory.ttsGenerated ? '생성됨' : '없음'}
                </p>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedStory.user?.displayName || '익명'}</p>
                <p className="text-sm text-gray-500">{selectedStory.user?.email || '-'}</p>
              </div>
              {selectedStory.child && (
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-500">대상 아이</p>
                  <p className="font-medium text-gray-900">{selectedStory.child.name}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">상태:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[selectedStory.status]}`}>
                {STATUS_LABELS[selectedStory.status]}
              </span>
            </div>

            {/* Content Preview */}
            {selectedStory.content && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">내용 미리보기</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedStory.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
