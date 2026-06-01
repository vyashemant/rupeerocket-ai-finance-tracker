import axios from 'axios'
import { clearStoredAuth, getAuthToken, getRefreshToken, setAuthTokens } from '../lib/storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
})

async function refreshSession() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('Missing refresh token')
  }

  const response = await axios.post(
    `${api.defaults.baseURL}/api/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      timeout: 30000,
    },
  )

  const session = response.data?.data || {}
  if (session.token || session.refresh_token) {
    setAuthTokens(session.token, session.refresh_token)
  }
  return session.token
}

export { refreshSession }

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config
    const isUnauthorized = error?.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/api/auth/refresh')

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true
      try {
        const newAccessToken = await refreshSession()
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch (_refreshError) {
        clearStoredAuth()
      }
    }

    if (isUnauthorized && isRefreshRequest) {
      clearStoredAuth()
    }
    return Promise.reject(error)
  },
)

export default api