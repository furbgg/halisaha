import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { NotificationPopup } from './NotificationPopup'

export function AdminTopBar() {
  const { user } = useAuthStore()
  const { unreadCount, isOpen, setOpen } = useNotificationStore()

  return (
    <div className="flex items-center justify-end gap-4 px-6 py-3 border-b border-white/5">
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="relative flex items-center justify-center size-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Benachrichtigungen"
          aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ''}`}
          aria-expanded={isOpen}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <NotificationPopup />
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary to-orange-600 flex items-center justify-center text-black font-bold text-[10px]">
            {user.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <span className="text-sm text-slate-300 font-medium hidden lg:block">{user.name}</span>
        </div>
      )}
    </div>
  )
}
