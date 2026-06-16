import { useEffect, useRef } from 'react'
import { useNotificationStore } from '../../store/notificationStore'
import { useTranslation } from 'react-i18next'

const PURPOSE_ICONS: Record<string, string> = {
  CONFIRMATION: 'check_circle',
  CANCELLATION: 'cancel',
  MODIFICATION: 'edit_calendar',
  REMINDER: 'alarm',
  NEW_BOOKING_ALERT: 'notification_important',
  DAILY_REPORT: 'summarize',
  PASSWORD_RESET: 'lock_reset',
  ADMIN_INVITE: 'person_add',
  COUPON: 'local_offer',
}

const PURPOSE_COLORS: Record<string, string> = {
  CONFIRMATION: 'text-green-400',
  CANCELLATION: 'text-red-400',
  MODIFICATION: 'text-yellow-400',
  REMINDER: 'text-blue-400',
  NEW_BOOKING_ALERT: 'text-primary',
  DAILY_REPORT: 'text-primary',
  PASSWORD_RESET: 'text-slate-400',
  ADMIN_INVITE: 'text-primary',
  COUPON: 'text-purple-400',
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' })
}

export function NotificationPopup() {
  const { notifications, isLoading, isOpen, setOpen, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setOpen])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Benachrichtigungen"
      aria-live="polite"
      className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-surface-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-bold text-white">Benachrichtigungen</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-primary hover:text-orange-400 transition-colors font-medium"
          >
            Alle gelesen
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[380px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Keine Benachrichtigungen
          </div>
        ) : (
          notifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.read) markAsRead(notification.id)
              }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/3 ${
                !notification.read ? 'border-l-2 border-l-primary bg-primary/5' : 'border-l-2 border-l-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${PURPOSE_COLORS[notification.purpose] || 'text-slate-400'}`}>
                {PURPOSE_ICONS[notification.purpose] || 'notifications'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${!notification.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {notification.content}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/5 text-center">
          <span className="text-xs text-slate-500">
            {notifications.length} Benachrichtigungen angezeigt
          </span>
        </div>
      )}
    </div>
  )
}
