const AUTH_TOKEN_KEY = 'rupeerocket_token'
const REFRESH_TOKEN_KEY = 'rupeerocket_refresh_token'
const THEME_KEY = 'rupeerocket_theme'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearStoredAuth() {
  clearAuthToken()
  clearRefreshToken()
}

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY)
}

export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function clearStoredTheme() {
  localStorage.removeItem(THEME_KEY)
}