import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { ADMIN_PORTAL_PATH } from '../config/brand'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<{ accessToken: string }> | null = null
const isAdminPortalRoute = () => window.location.pathname.startsWith(ADMIN_PORTAL_PATH)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (original?.url?.includes('/auth/login')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true
      const { setTokens, logout } = useAuthStore.getState()

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            {},
            { withCredentials: true }
          )
            .then((res) => res.data.data)
            .finally(() => {
              refreshPromise = null
            })
        }

        const { accessToken } = await refreshPromise
        setTokens(accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        refreshPromise = null
        logout()
        if (isAdminPortalRoute()) {
          window.location.href = ADMIN_PORTAL_PATH
        }
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 403) {
      if (isAdminPortalRoute()) {
        window.location.href = '/403'
      }
      return Promise.reject(error)
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Die Serveranfrage hat eine Zeitueberschreitung erlitten. Bitte ueberpruefen Sie Ihre Verbindung.'))
    }

    return Promise.reject(error)
  }
)

export default api

