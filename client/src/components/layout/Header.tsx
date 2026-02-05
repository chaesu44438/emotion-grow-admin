import { useState, useRef, useEffect } from 'react'
import { Bell, User, Menu, LogOut, Settings, AlertCircle, AlertTriangle, Info, UserPlus, Check } from 'lucide-react'
import type { Admin } from '../../types'

interface Notification {
  id: string
  type: 'error' | 'warning' | 'info' | 'system'
  message: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  { id: '1', type: 'error', message: '동화 생성 실패 - 마음이 자라는 시간', time: '10분 전', read: false },
  { id: '2', type: 'warning', message: '사용자 박지아 7일간 미접속', time: '1시간 전', read: false },
  { id: '3', type: 'info', message: '신규 가입 - 오서현', time: '2시간 전', read: false },
  { id: '4', type: 'system', message: '이번 주 AI 사용량 80% 도달', time: '3시간 전', read: false },
  { id: '5', type: 'error', message: '결제 처리 실패 - 김민수', time: '5시간 전', read: true },
  { id: '6', type: 'info', message: '신규 가입 - 이준호', time: '6시간 전', read: true },
  { id: '7', type: 'warning', message: '사용자 최영희 구독 만료 예정', time: '8시간 전', read: true },
  { id: '8', type: 'system', message: '서버 백업 완료', time: '12시간 전', read: true },
  { id: '9', type: 'info', message: '신규 가입 - 정수민', time: '1일 전', read: true },
  { id: '10', type: 'warning', message: 'API 응답 시간 증가 감지', time: '1일 전', read: true },
]

interface HeaderProps {
  admin: Admin | null
  errorCount?: number
  onMenuClick?: () => void
  onLogout?: () => void
}

export default function Header({ admin, onMenuClick, onLogout }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />
      case 'info':
        return <UserPlus size={16} className="text-green-500" />
      case 'system':
        return <Info size={16} className="text-blue-500" />
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            안녕하세요, {admin?.name || '관리자'}님
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">알림</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Check size={14} />
                    전체 읽음
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full text-sm text-center text-primary-600 hover:text-primary-700 font-medium">
                  모든 알림 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-600" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-medium text-gray-800 text-sm">{admin?.name}</p>
              <p className="text-gray-500 text-xs">
                {admin?.role === 'SUPER_ADMIN' ? '슈퍼 관리자' : '관리자'}
              </p>
            </div>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="font-medium text-gray-800 text-sm">{admin?.name}</p>
                <p className="text-gray-500 text-xs">
                  {admin?.role === 'SUPER_ADMIN' ? '슈퍼 관리자' : '관리자'}
                </p>
              </div>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                프로필 설정
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => {
                  setShowDropdown(false)
                  onLogout?.()
                }}
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
