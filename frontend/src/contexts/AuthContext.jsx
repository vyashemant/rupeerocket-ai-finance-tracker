import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/storage'
import { getProfileRequest, loginRequest, registerRequest } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrate = async () => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const profile = await getProfileRequest()
      setUser(profile?.user || profile)
    } catch (error) {
      clearAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    hydrate()
  }, [])

  const login = async (email, password) => {
    const { token, user: nextUser } = await loginRequest({ email, password })
    setAuthToken(token)
    setUser(nextUser)
    return nextUser
  }

  const register = async (payload) => {
    const { token, user: nextUser } = await registerRequest(payload)
    setAuthToken(token)
    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    clearAuthToken()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser: hydrate,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}