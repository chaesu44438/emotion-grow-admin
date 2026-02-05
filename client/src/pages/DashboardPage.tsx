import { useState, useEffect } from 'react'
import { Users, BookOpen, Heart, Brain, TrendingUp, TrendingDown, UserPlus, Sparkles, CreditCard } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui'
import {
  getDashboardStats,
  getUserGrowthChart,
  getAiUsageChart,
  getSubscriptionStats,
  getEmotionStats,
  getRecentActivities,
} from '../api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Types
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalStories: number
  totalEmotionRecords: number
  aiUsageToday: number
  newUsersToday: number
  comparison: {
    users: { today: number; yesterday: number }
    stories: { today: number; yesterday: number }
    emotions: { today: number; yesterday: number }
    aiUsage: { today: number; yesterday: number }
  }
}

interface SubscriptionData {
  tier: string
  count: number
  percentage: number
}

interface EmotionData {
  emotion: string
  count: number
}

interface Activity {
  type: 'user_join' | 'story_create' | 'subscription'
  message: string
  detail: string
  createdAt: string
}

// Colors
const SUBSCRIPTION_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  BASIC: '#3b82f6',
  PREMIUM: '#a855f7',
}

const EMOTION_COLORS: Record<string, string> = {
  happy: '#22c55e',
  sad: '#3b82f6',
  angry: '#ef4444',
  anxious: '#f59e0b',
  tired: '#94a3b8',
  grateful: '#ec4899',
  proud: '#a855f7',
  frustrated: '#f97316',
}

const EMOTION_LABELS: Record<string, string> = {
  happy: '행복',
  sad: '슬픔',
  angry: '분노',
  anxious: '불안',
  tired: '피곤',
  grateful: '감사',
  proud: '자랑스러움',
  frustrated: '좌절',
}

// Components
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  color: string
  change?: { today: number; yesterday: number }
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  const changePercent = change && change.yesterday > 0
    ? Math.round(((change.today - change.yesterday) / change.yesterday) * 100)
    : change?.today ? 100 : 0

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{changePercent >= 0 ? '+' : ''}{changePercent}%</span>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  return `${diffDays}일 전`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userGrowth, setUserGrowth] = useState<Array<{ date: string; value: number; cumulative: number }>>([])
  const [aiUsage, setAiUsage] = useState<Array<{ date: string; total: number }>>([])
  const [subscriptionStats, setSubscriptionStats] = useState<{ data: SubscriptionData[]; total: number } | null>(null)
  const [emotionStats, setEmotionStats] = useState<EmotionData[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, growthRes, usageRes, subRes, emotionRes, activityRes] = await Promise.all([
          getDashboardStats(),
          getUserGrowthChart(30),
          getAiUsageChart(30),
          getSubscriptionStats(),
          getEmotionStats(),
          getRecentActivities(5),
        ])
        setStats(statsRes.data)
        setUserGrowth(growthRes.data)
        setAiUsage(usageRes.data)
        setSubscriptionStats(subRes.data)
        setEmotionStats(emotionRes.data)
        setActivities(activityRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500">서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 사용자"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
          change={stats?.comparison.users}
        />
        <StatCard
          title="활성 사용자"
          value={stats?.activeUsers || 0}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="생성된 동화"
          value={stats?.totalStories || 0}
          icon={BookOpen}
          color="bg-purple-500"
          change={stats?.comparison.stories}
        />
        <StatCard
          title="감정 기록"
          value={stats?.totalEmotionRecords || 0}
          icon={Heart}
          color="bg-pink-500"
          change={stats?.comparison.emotions}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">사용자 증가 추이</h3>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'cumulative' ? '누적' : '신규'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    name="누적"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="신규"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Subscription Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">구독 현황</h3>
          </CardHeader>
          <CardBody>
            <div className="h-72 flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionStats?.data || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="tier"
                    >
                      {subscriptionStats?.data.map((entry) => (
                        <Cell key={entry.tier} fill={SUBSCRIPTION_COLORS[entry.tier]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [`${value}명`, '사용자']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-gray-900">{subscriptionStats?.total || 0}</p>
                  <p className="text-sm text-gray-500">총 사용자</p>
                </div>
                {subscriptionStats?.data.map((item) => (
                  <div key={item.tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SUBSCRIPTION_COLORS[item.tier] }}
                      />
                      <span className="text-sm text-gray-600">{item.tier}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{item.count}명</span>
                      <span className="text-gray-400 ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">감정 분포</h3>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emotionStats.sort((a, b) => b.count - a.count)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis
                    type="category"
                    dataKey="emotion"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => EMOTION_LABELS[value] || value}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value}건`, '기록 수']}
                    labelFormatter={(label) => EMOTION_LABELS[label] || label}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {emotionStats.map((entry) => (
                      <Cell key={entry.emotion} fill={EMOTION_COLORS[entry.emotion] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* AI Usage Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">AI 사용량</h3>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value}건`, 'API 호출']}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">최근 활동</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {activities.map((activity, index) => (
              <div key={index} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'user_join' ? 'bg-blue-100' :
                  activity.type === 'story_create' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  {activity.type === 'user_join' && <UserPlus size={18} className="text-blue-600" />}
                  {activity.type === 'story_create' && <Sparkles size={18} className="text-purple-600" />}
                  {activity.type === 'subscription' && <CreditCard size={18} className="text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                최근 활동이 없습니다
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
