import { create } from 'zustand'
import api from '../services/api'

interface AdminNotification {
  id: number
  reservationId: number | null
  type: string
  purpose: string
  recipient: string
  content: string
  status: string
  read: boolean
  sentAt: string | null
  createdAt: string
}

interface NotificationState {
  unreadCount: number
  notifications: AdminNotification[]
  isOpen: boolean
  isLoading: boolean
  pollingInterval: ReturnType<typeof setInterval> | null
  fetchUnreadCount: () => Promise<void>
  fetchNotifications: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  setOpen: (open: boolean) => void
  startPolling: () => void
  stopPolling: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  isOpen: false,
  isLoading: false,
  pollingInterval: null,

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/admin/notifications/unread-count')
      set({ unreadCount: res.data.data.count })
    } catch {
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/admin/notifications?page=0&size=20')
      set({ notifications: res.data.data.content || [], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id: number) => {
    try {
      await api.put(`/admin/notifications/${id}/read`)
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/admin/notifications/read-all')
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch {
    }
  },

  setOpen: (open: boolean) => {
    set({ isOpen: open })
    if (open) {
      get().fetchNotifications()
    }
  },

  startPolling: () => {
    const existing = get().pollingInterval
    if (existing) return

    get().fetchUnreadCount()
    const interval = setInterval(() => {
      get().fetchUnreadCount()
    }, 30000)
    set({ pollingInterval: interval })
  },

  stopPolling: () => {
    const interval = get().pollingInterval
    if (interval) {
      clearInterval(interval)
      set({ pollingInterval: null })
    }
  },
}))
