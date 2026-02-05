import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Cpu, Calendar, Target } from 'lucide-react'
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
} from '../components/ui'
import {
  getAiUsageLogs,
  getAiUsageStats,
  getCostByService,
  getDailyCost,
  getMonthlySummary,
  getDailyCalls,
} from '../api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import type { AiUsageLog } from '../types'

// Types
interface AiStats {
  totalCalls: number
  totalCost: number
  byService: Record<string, { calls: number; cost: number }>
}

interface CostByService {
  service: string
  cost: number
  percentage: number
}

interface MonthlySummary {
  thisMonth: number
  lastMonth: number
  dailyAverage: number
  projectedCost: number
  changePercent: number
  totalCalls: number
}

// Colors
const SERVICE_COLORS: Record<string, string> = {
  OPENAI_CHAT: '#22c55e',
  RECRAFT: '#3b82f6',
  GOOGLE_TTS: '#f59e0b',
  OPENAI_TTS: '#a855f7',
}

const SERVICE_LABELS: Record<string, string> = {
  OPENAI_CHAT: 'OpenAI Chat',
  RECRAFT: 'Recraft',
  GOOGLE_TTS: 'Google TTS',
  OPENAI_TTS: 'OpenAI TTS',
}

export default function AiUsagePage() {
  const [logs, setLogs] = useState<AiUsageLog[]>([])
  const [stats, setStats] = useState<AiStats | null>(null)
  const [costByService, setCostByService] = useState<{ data: CostByService[]; total: number } | null>(null)
  const [dailyCost, setDailyCost] = useState<Array<{ date: string; total: number; OPENAI_CHAT: number; RECRAFT: number; GOOGLE_TTS: number; OPENAI_TTS: number }>>([])
  const [dailyCalls, setDailyCalls] = useState<Array<{ date: string; OPENAI_CHAT: number; RECRAFT: number; GOOGLE_TTS: number; OPENAI_TTS: number }>>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [logsRes, statsRes, costRes, dailyCostRes, monthlyRes, dailyCallsRes] = await Promise.all([
          getAiUsageLogs({ page, limit }),
          getAiUsageStats(),
          getCostByService(),
          getDailyCost(30),
          getMonthlySummary(),
          getDailyCalls(30),
        ])
        setLogs(logsRes.data.logs)
        setTotal(logsRes.data.total)
        setStats(statsRes.data)
        setCostByService(costRes.data)
        setDailyCost(dailyCostRes.data)
        setMonthlySummary(monthlyRes.data)
        setDailyCalls(dailyCallsRes.data)
      } catch (error) {
        console.error('Failed to fetch AI usage data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const serviceBadge = (service: string) => {
    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: SERVICE_COLORS[service] || '#94a3b8' }}
      >
        {SERVICE_LABELS[service] || service}
      </span>
    )
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI 사용량</h1>
        <p className="text-gray-500">AI 서비스 사용 현황을 확인합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cpu size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">총 API 호출</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.totalCalls.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">총 비용</p>
                <p className="text-xl font-bold text-gray-900">
                  ${stats?.totalCost.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">이번 달</p>
                <p className="text-xl font-bold text-gray-900">
                  ${monthlySummary?.thisMonth.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            {monthlySummary && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${monthlySummary.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {monthlySummary.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>전월 대비 {monthlySummary.changePercent >= 0 ? '+' : ''}{monthlySummary.changePercent}%</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">일 평균</p>
                <p className="text-xl font-bold text-gray-900">
                  ${monthlySummary?.dailyAverage.toFixed(4) || '0.00'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">예상 월비용</p>
                <p className="text-xl font-bold text-gray-900">
                  ${monthlySummary?.projectedCost.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Cost Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">일별 비용 추이</h3>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCost}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(4)}`,
                      SERVICE_LABELS[name] || name
                    ]}
                  />
                  <Legend formatter={(value) => SERVICE_LABELS[value] || value} />
                  <Area type="monotone" dataKey="OPENAI_CHAT" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="RECRAFT" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="GOOGLE_TTS" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="OPENAI_TTS" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Cost by Service Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">서비스별 비용</h3>
          </CardHeader>
          <CardBody>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costByService?.data || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="cost"
                    nameKey="service"
                  >
                    {costByService?.data.map((entry) => (
                      <Cell key={entry.service} fill={SERVICE_COLORS[entry.service] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`$${value.toFixed(4)}`, '비용']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {costByService?.data.map((item) => (
                <div key={item.service} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SERVICE_COLORS[item.service] }}
                    />
                    <span className="text-gray-600">{SERVICE_LABELS[item.service]}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">${item.cost.toFixed(2)}</span>
                    <span className="text-gray-400 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Daily Calls Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">서비스별 일일 호출 수</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCalls}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number, name: string) => [
                    `${value}건`,
                    SERVICE_LABELS[name] || name
                  ]}
                />
                <Legend formatter={(value) => SERVICE_LABELS[value] || value} />
                <Bar dataKey="OPENAI_CHAT" stackId="a" fill="#22c55e" />
                <Bar dataKey="RECRAFT" stackId="a" fill="#3b82f6" />
                <Bar dataKey="GOOGLE_TTS" stackId="a" fill="#f59e0b" />
                <Bar dataKey="OPENAI_TTS" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">사용 로그</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>서비스</TableHeaderCell>
                <TableHeaderCell>액션</TableHeaderCell>
                <TableHeaderCell>모델</TableHeaderCell>
                <TableHeaderCell>토큰</TableHeaderCell>
                <TableHeaderCell>비용</TableHeaderCell>
                <TableHeaderCell>응답시간</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell>일시</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{serviceBadge(log.service)}</TableCell>
                  <TableCell className="text-gray-600">{log.action}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{log.model || '-'}</TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {log.inputTokens ? `${log.inputTokens} / ${log.outputTokens}` : '-'}
                  </TableCell>
                  <TableCell className="text-gray-600 font-mono">
                    ${parseFloat(log.cost || '0').toFixed(4)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {log.responseTime ? `${log.responseTime}ms` : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {log.status === 'success' ? '성공' : '실패'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
        </CardBody>
      </Card>
    </div>
  )
}
