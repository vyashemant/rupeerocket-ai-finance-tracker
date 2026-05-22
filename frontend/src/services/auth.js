import api from './api'

export async function loginRequest(payload) {
  const response = await api.post('/api/auth/login', payload)
  return response.data.data
}

export async function registerRequest(payload) {
  const response = await api.post('/api/auth/register', payload)
  return response.data.data
}

export async function getProfileRequest() {
  try {
    const response = await api.get('/api/auth/profile')
    return response.data.data?.user || response.data.data
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallback = await api.get('/api/auth/me')
      return fallback.data.data?.user || fallback.data.data
    }
    throw error
  }
}