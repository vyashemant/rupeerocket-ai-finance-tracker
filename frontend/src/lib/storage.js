const AUTH_TOKEN_KEY = 'rupeerocket_token'
const THEME_KEY = 'rupeerocket_theme'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function clearStoredAuth() {
  clearAuthToken()
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