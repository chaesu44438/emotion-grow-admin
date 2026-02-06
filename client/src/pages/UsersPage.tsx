import { useState, useEffect, useRef } from 'react'
import { Search, Users, UserPlus, TrendingUp, UserX, Baby, BookOpen, Brain, DollarSign, MoreVertical, Eye, Edit, Ban, MessageSquare, Save } from 'lucide-react'
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
  ConfirmDialog,
  useToast,
} from '../components/ui'
import { getUsers, getUserStats, getUserDetail } from '../api'
import type { User } from '../types'

interface UserStats {
  totalUsers: number
  newThisWeek: number
  paidUsers: number
  inactiveUsers: number
  conversionRate: number
}

interface AdminNote {
  id: string
  content: string
  createdAt: string
}

interface ChangeLog {
  id: string
  action: string
  createdAt: string
}

interface UserDetail extends User {
  children: Array<{
    id: string
    name: string
    birthDate: string | null
    gender: string | null
    ageGroup: string | null
  }>
  recentEmotions: Array<{
    id: string
    emotion: string
    intensity: number
    note: string | null
    context: string | null
    createdAt: string
  }>
  recentStories: Array<{
    id: string
    title: string
    emotion: string | null
    status: string
    createdAt: string
  }>
  aiUsage: {
    totalCalls: number
    totalCost: number
  }
  // Mock fields for management
  isSuspended?: boolean
  suspendedUntil?: string | null
  suspendReason?: string | null
  adminNotes?: AdminNote[]
  changeLogs?: ChangeLog[]
}

const TIER_FILTERS = ['ALL', 'FREE', 'BASIC', 'PREMIUM'] as const
const STATUS_FILTERS = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성 계정' },
  { value: 'inactive', label: '휴면 계정' },
  { value: 'suspended', label: '정지된 계정' },
] as const

const TIER_STYLES: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  BASIC: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-purple-100 text-purple-700',
}

const EMOTION_COLORS: Record<string, string> = {
  happy: 'bg-green-100 text-green-700',
  sad: 'bg-blue-100 text-blue-700',
  angry: 'bg-red-100 text-red-700',
  anxious: 'bg-yellow-100 text-yellow-700',
  tired: 'bg-gray-100 text-gray-700',
  grateful: 'bg-pink-100 text-pink-700',
  proud: 'bg-purple-100 text-purple-700',
  frustrated: 'bg-orange-100 text-orange-700',
}

const EMOTION_LABELS: Record<string, string> = {
  happy: '행복', sad: '슬픔', angry: '분노', anxious: '불안',
  tired: '피곤', grateful: '감사', proud: '자랑', frustrated: '좌절',
}

// Mock data for admin notes
const getInitialNotes = (): AdminNote[] => [
  { id: '1', content: 'VIP 사용자, 피드백 적극적으로 제공 중', createdAt: '2026-02-03' },
  { id: '2', content: '결제 관련 문의 처리 완료', createdAt: '2026-01-28' },
]

// Mock data for change logs
const getInitialChangeLogs = (): ChangeLog[] => [
  { id: '1', action: 'FREE → BASIC (관리자)', createdAt: '2026-02-05' },
  { id: '2', action: '휴면 해제 → 활성화 (관리자)', createdAt: '2026-01-20' },
]

// 목록용 사용자 타입 (정지 상태 포함)
interface UserWithSuspension extends User {
  isSuspended?: boolean
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserWithSuspension[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const limit = 10

  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  // Confirm dialog states
  const [tierChangeDialog, setTierChangeDialog] = useState<{ open: boolean; newTier: string }>({ open: false, newTier: '' })
  const [activeToggleDialog, setActiveToggleDialog] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' })
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; duration: string; reason: string }>({ open: false, duration: '7', reason: '' })

  // Admin note state
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getUserStats()
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        // API는 active 필터만 지원하므로 변환
        const activeParam = statusFilter === 'active' ? 'true'
          : statusFilter === 'inactive' ? 'false'
          : ''

        const response = await getUsers({
          page,
          limit,
          search,
          tier: tierFilter,
          active: activeParam,
        })
        setUsers(response.data.users)
        setTotal(response.data.total)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [page, search, tierFilter, statusFilter])

  const handleUserClick = async (userId: string, action?: 'view' | 'tier' | 'suspend') => {
    setModalLoading(true)
    try {
      const res = await getUserDetail(userId)
      if (!res.data) {
        console.error('User not found')
        return
      }
      // 목록에서 현재 정지 상태 가져오기
      const existingUser = users.find(u => u.id === userId)
      // Add mock management fields
      const userDetail: UserDetail = {
        ...res.data,
        children: res.data.children || [],
        recentEmotions: res.data.recentEmotions || [],
        recentStories: res.data.recentStories || [],
        aiUsage: res.data.aiUsage || { totalCalls: 0, totalCost: 0 },
        isSuspended: existingUser?.isSuspended || false,
        suspendedUntil: null,
        suspendReason: existingUser?.isSuspended ? '이용약관 위반' : null, // 더미 사유
        adminNotes: getInitialNotes(),
        changeLogs: getInitialChangeLogs(),
      }
      setSelectedUser(userDetail)

      // 액션에 따라 바로 다이얼로그 열기
      if (action === 'tier') {
        // 등급 변경 다이얼로그 바로 열기 (현재 등급을 기본값으로)
        setTimeout(() => setTierChangeDialog({ open: true, newTier: userDetail.subscriptionTier }), 100)
      } else if (action === 'suspend') {
        // 정지 다이얼로그 바로 열기
        setTimeout(() => setSuspendDialog({ open: true, duration: '7', reason: '' }), 100)
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleTierChange = () => {
    if (!selectedUser) return
    const oldTier = selectedUser.subscriptionTier
    const newTier = tierChangeDialog.newTier

    if (oldTier === newTier) {
      showToast('warning', '동일한 등급입니다. 다른 등급을 선택해주세요.')
      return
    }

    // Update local state
    setSelectedUser(prev => prev ? {
      ...prev,
      subscriptionTier: newTier as 'FREE' | 'BASIC' | 'PREMIUM',
      changeLogs: [
        { id: Date.now().toString(), action: `${oldTier} → ${newTier} (관리자)`, createdAt: new Date().toISOString().split('T')[0] },
        ...(prev.changeLogs || [])
      ]
    } : null)

    // Update users list
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, subscriptionTier: newTier as 'FREE' | 'BASIC' | 'PREMIUM' } : u))

    showToast('success', '구독 등급이 변경되었습니다')
    setTierChangeDialog({ open: false, newTier: '' })
  }

  const handleActiveToggle = () => {
    if (!selectedUser) return
    const newStatus = !selectedUser.isActive

    setSelectedUser(prev => prev ? {
      ...prev,
      isActive: newStatus,
      changeLogs: [
        { id: Date.now().toString(), action: `${newStatus ? '활성화' : '휴면 처리'} (관리자)${activeToggleDialog.reason ? ` - ${activeToggleDialog.reason}` : ''}`, createdAt: new Date().toISOString().split('T')[0] },
        ...(prev.changeLogs || [])
      ]
    } : null)

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isActive: newStatus } : u))

    showToast('success', `계정이 ${newStatus ? '활성화' : '휴면 처리'}되었습니다`)
    setActiveToggleDialog({ open: false, reason: '' })
  }

  const handleSuspend = () => {
    if (!selectedUser || !suspendDialog.reason) {
      showToast('error', '정지 사유를 입력해주세요')
      return
    }

    const duration = suspendDialog.duration === 'permanent' ? '영구' : `${suspendDialog.duration}일`
    const untilDate = suspendDialog.duration === 'permanent'
      ? null
      : new Date(Date.now() + parseInt(suspendDialog.duration) * 24 * 60 * 60 * 1000).toISOString()

    setSelectedUser(prev => prev ? {
      ...prev,
      isSuspended: true,
      suspendedUntil: untilDate,
      suspendReason: suspendDialog.reason,
      changeLogs: [
        { id: Date.now().toString(), action: `정지 (${duration}) - ${suspendDialog.reason}`, createdAt: new Date().toISOString().split('T')[0] },
        ...(prev.changeLogs || [])
      ]
    } : null)

    // 목록에도 정지 상태 반영
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isSuspended: true } : u))

    showToast('warning', `사용자가 ${duration} 정지되었습니다`)
    setSuspendDialog({ open: false, duration: '7', reason: '' })
  }

  const handleUnsuspend = () => {
    if (!selectedUser) return

    setSelectedUser(prev => prev ? {
      ...prev,
      isSuspended: false,
      suspendedUntil: null,
      suspendReason: null,
      changeLogs: [
        { id: Date.now().toString(), action: '정지 해제 (관리자)', createdAt: new Date().toISOString().split('T')[0] },
        ...(prev.changeLogs || [])
      ]
    } : null)

    // 목록에도 정지 해제 반영
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isSuspended: false } : u))

    showToast('success', '사용자 정지가 해제되었습니다')
  }

  const handleAddNote = () => {
    if (!selectedUser || !newNote.trim()) return

    setSelectedUser(prev => prev ? {
      ...prev,
      adminNotes: [
        { id: Date.now().toString(), content: newNote, createdAt: new Date().toISOString().split('T')[0] },
        ...(prev.adminNotes || [])
      ]
    } : null)

    showToast('success', '메모가 저장되었습니다')
    setNewNote('')
  }

  // 정지 필터는 클라이언트 측에서 처리 (로컬 상태 기반)
  const filteredUsers = statusFilter === 'suspended'
    ? users.filter(u => u.isSuspended)
    : users

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-500">서비스 사용자를 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 사용자</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 주 신규</p>
              <p className="text-xl font-bold text-gray-900">{stats?.newThisWeek || 0}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">유료 전환율</p>
              <p className="text-xl font-bold text-gray-900">{stats?.conversionRate || 0}%</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">비활성 사용자</p>
              <p className="text-xl font-bold text-gray-900">{stats?.inactiveUsers || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-900">사용자 목록</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tier Filter */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {TIER_FILTERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => {
                      setTierFilter(tier)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      tierFilter === tier
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tier === 'ALL' ? '전체' : tier}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="이메일 또는 이름 검색..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg font-medium">
                {statusFilter === 'suspended' ? '정지된 계정이 없습니다'
                  : statusFilter === 'inactive' ? '휴면 계정이 없습니다'
                  : '사용자가 없습니다'}
              </p>
              <p className="text-sm mt-1">
                {statusFilter === 'suspended' && '사용자 상세에서 정지 처리를 할 수 있습니다'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">사용자</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">구독</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">상태</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">Provider</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">가입일</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">마지막 접속</TableHeaderCell>
                      <TableHeaderCell className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider w-16">액션</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, idx) => (
                      <TableRow
                        key={user.id}
                        className={`hover:bg-gray-50 ${user.isSuspended ? 'bg-orange-50/50' : idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                      >
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => handleUserClick(user.id, 'view')}
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.displayName || '이름 없음'}
                            </p>
                            <p className="text-gray-500 text-xs">{user.email || 'N/A'}</p>
                          </div>
                        </td>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIER_STYLES[user.subscriptionTier]}`}>
                            {user.subscriptionTier}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.isSuspended ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              정지
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {user.isActive ? '활성' : '휴면'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm capitalize">
                          {user.provider || '-'}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="relative" ref={actionMenuOpen === user.id ? actionMenuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {actionMenuOpen === user.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActionMenuOpen(null)
                                    handleUserClick(user.id, 'view')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={14} />
                                  상세 보기
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActionMenuOpen(null)
                                    handleUserClick(user.id, 'tier')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit size={14} />
                                  등급 변경
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActionMenuOpen(null)
                                    handleUserClick(user.id, 'suspend')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Ban size={14} />
                                  정지/차단
                                </button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
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

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser || modalLoading}
        onClose={() => setSelectedUser(null)}
        title="사용자 상세 정보"
        size="xl"
      >
        {modalLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : selectedUser && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Suspension Banner */}
            {selectedUser.isSuspended && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-800">정지된 사용자</p>
                    <p className="text-sm text-orange-600">
                      사유: {selectedUser.suspendReason}
                      {selectedUser.suspendedUntil && ` (${new Date(selectedUser.suspendedUntil).toLocaleDateString('ko-KR')}까지)`}
                      {!selectedUser.suspendedUntil && ' (영구 정지)'}
                    </p>
                  </div>
                  <button
                    onClick={handleUnsuspend}
                    className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    정지 해제
                  </button>
                </div>
              </div>
            )}

            {/* Basic Info with Management Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="font-medium text-gray-900">{selectedUser.displayName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="font-medium text-gray-900">{selectedUser.email || '-'}</p>
              </div>

              {/* Subscription Tier with Change */}
              <div>
                <p className="text-sm text-gray-500 mb-1">구독 등급</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${TIER_STYLES[selectedUser.subscriptionTier]}`}>
                    {selectedUser.subscriptionTier}
                  </span>
                  <select
                    value={selectedUser.subscriptionTier}
                    onChange={(e) => setTierChangeDialog({ open: true, newTier: e.target.value })}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">로그인 제공자</p>
                <p className="font-medium text-gray-900 capitalize">{selectedUser.provider || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">가입일</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* Active Toggle */}
              <div>
                <p className="text-sm text-gray-500 mb-1">계정 상태</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedUser.isActive ? '활성' : '휴면'}
                  </span>
                  <button
                    onClick={() => setActiveToggleDialog({ open: true, reason: '' })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Children */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Baby size={18} className="text-pink-500" />
                등록된 아이 ({selectedUser.children.length}명)
              </h4>
              {selectedUser.children.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedUser.children.map((child) => (
                    <div key={child.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{child.name}</p>
                      <p className="text-xs text-gray-500">
                        {child.ageGroup}세 · {child.gender === 'male' ? '남아' : '여아'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">등록된 아이가 없습니다</p>
              )}
            </div>

            {/* Recent Emotions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">💭</span>
                최근 감정 기록
              </h4>
              {selectedUser.recentEmotions.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.recentEmotions.map((emotion) => (
                    <div key={emotion.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${EMOTION_COLORS[emotion.emotion] || 'bg-gray-100 text-gray-600'}`}>
                          {EMOTION_LABELS[emotion.emotion] || emotion.emotion}
                        </span>
                        <span className="text-sm text-gray-600">강도: {emotion.intensity}/5</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(emotion.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">감정 기록이 없습니다</p>
              )}
            </div>

            {/* Recent Stories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-purple-500" />
                최근 생성 동화
              </h4>
              {selectedUser.recentStories.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.recentStories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900 truncate">{story.title}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(story.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">생성된 동화가 없습니다</p>
              )}
            </div>

            {/* AI Usage */}
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={18} className="text-blue-600" />
                  <span className="text-sm text-blue-600">AI 호출 수</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{selectedUser.aiUsage.totalCalls}</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={18} className="text-green-600" />
                  <span className="text-sm text-green-600">총 비용</span>
                </div>
                <p className="text-2xl font-bold text-green-900">${selectedUser.aiUsage.totalCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-500" />
                관리자 메모
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Save size={14} />
                    저장
                  </button>
                </div>
                {selectedUser.adminNotes && selectedUser.adminNotes.length > 0 && (
                  <div className="space-y-2">
                    {selectedUser.adminNotes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.createdAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Change Logs */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">변경 이력</h4>
              {selectedUser.changeLogs && selectedUser.changeLogs.length > 0 ? (
                <div className="space-y-1">
                  {selectedUser.changeLogs.map((log) => (
                    <div key={log.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-gray-400">{log.createdAt}</span>
                      <span>-</span>
                      <span>{log.action}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">변경 이력이 없습니다</p>
              )}
            </div>

            {/* Suspend Button */}
            {!selectedUser.isSuspended && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSuspendDialog({ open: true, duration: '7', reason: '' })}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Ban size={16} />
                  사용자 정지
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Tier Change Confirmation */}
      <ConfirmDialog
        isOpen={tierChangeDialog.open}
        onClose={() => setTierChangeDialog({ open: false, newTier: '' })}
        onConfirm={handleTierChange}
        title="구독 등급 변경"
        message={`${selectedUser?.displayName}의 구독 등급을 변경합니다.`}
        confirmText="변경"
        type="info"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIER_STYLES[selectedUser?.subscriptionTier || 'FREE']}`}>
            {selectedUser?.subscriptionTier}
          </span>
          <span className="text-gray-400">→</span>
          <select
            value={tierChangeDialog.newTier}
            onChange={(e) => setTierChangeDialog(prev => ({ ...prev, newTier: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="FREE">FREE</option>
            <option value="BASIC">BASIC</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>
        </div>
      </ConfirmDialog>

      {/* Active Toggle Confirmation */}
      <ConfirmDialog
        isOpen={activeToggleDialog.open}
        onClose={() => setActiveToggleDialog({ open: false, reason: '' })}
        onConfirm={handleActiveToggle}
        title={selectedUser?.isActive ? '휴면 처리' : '휴면 해제'}
        message={`${selectedUser?.displayName}을(를) ${selectedUser?.isActive ? '휴면 처리' : '활성화'}하시겠습니까?`}
        confirmText={selectedUser?.isActive ? '휴면 처리' : '활성화'}
        type={selectedUser?.isActive ? 'warning' : 'info'}
      >
        {selectedUser?.isActive && (
          <input
            type="text"
            placeholder="휴면 처리 사유 (선택사항)"
            value={activeToggleDialog.reason}
            onChange={(e) => setActiveToggleDialog(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
        )}
      </ConfirmDialog>

      {/* Suspend Dialog */}
      <ConfirmDialog
        isOpen={suspendDialog.open}
        onClose={() => setSuspendDialog({ open: false, duration: '7', reason: '' })}
        onConfirm={handleSuspend}
        title="사용자 정지"
        message={`${selectedUser?.displayName}을(를) 정지하시겠습니까?`}
        confirmText="정지하기"
        type="danger"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정지 기간</label>
            <select
              value={suspendDialog.duration}
              onChange={(e) => setSuspendDialog(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="permanent">영구</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정지 사유 (필수)</label>
            <input
              type="text"
              placeholder="정지 사유를 입력하세요"
              value={suspendDialog.reason}
              onChange={(e) => setSuspendDialog(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
