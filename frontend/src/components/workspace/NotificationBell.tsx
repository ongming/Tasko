import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Clock,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import type { NotificationItem } from '@/types/notification'

function formatRelativeTime(isoDate: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000))
  if (diffSec < 60) return 'Vừa xong'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Hôm qua'
  return `${diffDays} ngày trước`
}

function getNotificationVisual(type: string) {
  switch (type) {
    case 'DUE_SOON':
      return {
        icon: Clock,
        bg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      }
    case 'ASSIGNED':
      return {
        icon: UserCheck,
        bg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
      }
    case 'COMMENTED':
      return {
        icon: MessageSquare,
        bg: 'bg-sky-50 text-sky-600 border-sky-200/80',
      }
    case 'STATUS_CHANGED':
      return {
        icon: CheckCircle2,
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      }
    default:
      return {
        icon: Bell,
        bg: 'bg-slate-100 text-slate-600 border-slate-200/80',
      }
  }
}

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug?: string }>()

  const [isOpen, setIsOpen] = useState(false)
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all')
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true)
      const res = await notificationService.getNotifications()
      setItems(Array.isArray(res?.items) ? res.items : [])
      setUnreadCount(typeof res?.unreadCount === 'number' ? res.unreadCount : 0)
    } catch {
      // Bỏ qua lỗi polling ngầm để không làm phiền UX
    } finally {
      if (showSpinner) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(false)
    const timer = setInterval(() => {
      fetchNotifications(false)
    }, 45000)
    return () => clearInterval(timer)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) {
      fetchNotifications(true)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setItems((prev) => prev.map((it) => ({ ...it, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isRead: true } : it)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      notificationService.markAsRead(item.id).catch(() => undefined)
    }

    setIsOpen(false)

    const targetSlug = item.data?.workspaceSlug || workspaceSlug
    const targetProject = item.data?.projectKey || item.data?.projectId
    if (targetSlug && targetProject) {
      navigate(`/${targetSlug}/${targetProject}/board`)
    }
  }

  const visibleItems =
    filterTab === 'unread' ? items.filter((it) => !it.isRead) : items

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        title="Thông báo"
        aria-label="Xem thông báo"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 bg-white">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                filterTab === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {isLoading && items.length === 0 ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Đang tải thông báo...</span>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-slate-400">
                {filterTab === 'unread'
                  ? 'Bạn đã đọc hết tất cả thông báo.'
                  : 'Chưa có thông báo nào.'}
              </div>
            ) : (
              visibleItems.map((item) => {
                const visual = getNotificationVisual(item.type)
                const IconComponent = visual.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleClickItem(item)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                      item.isRead ? 'bg-white' : 'bg-indigo-50/30'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${visual.bg}`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
