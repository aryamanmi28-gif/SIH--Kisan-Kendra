import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/services.js'
import { readStorage, writeStorage, removeStorage, STORAGE_KEYS } from '../utils/storage.js'

const AuthContext = createContext(null)

// TOKEN is shared storage for both farmer and officer sessions (CentrePortal
// writes the same key). AuthContext must ignore an officer session entirely
// rather than treating its token as a logged-in farmer. Unset ROLE (sessions
// created before this existed) is treated as 'farmer' so existing logged-in
// farmers aren't silently signed out.
const isOfficerSession = () => readStorage(STORAGE_KEYS.ROLE) === 'officer'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (isOfficerSession() ? null : readStorage(STORAGE_KEYS.USER)))
  const [token, setToken] = useState(() => (isOfficerSession() ? null : readStorage(STORAGE_KEYS.TOKEN)))
  // "restoring" covers the first paint, so protected routes do not bounce a
  // logged-in farmer to the login screen on refresh.
  const [restoring, setRestoring] = useState(() => !isOfficerSession() && Boolean(readStorage(STORAGE_KEYS.TOKEN)))

  useEffect(() => {
    if (!token || isOfficerSession()) {
      setRestoring(false)
      return
    }
    let cancelled = false
    authApi
      .me()
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        writeStorage(STORAGE_KEYS.USER, profile)
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 401) {
          setToken(null)
          setUser(null)
          removeStorage(STORAGE_KEYS.TOKEN)
          removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
          removeStorage(STORAGE_KEYS.USER)
          removeStorage(STORAGE_KEYS.ROLE)
        }
      })
      .finally(() => {
        if (!cancelled) setRestoring(false)
      })
    return () => {
      cancelled = true
    }
    // Runs once per session token.
  }, [token])

  const login = useCallback(async (phoneNumber, password) => {
    const { access, refresh } = await authApi.login({ phone_number: phoneNumber, password })
    // Written before authApi.me() so the httpClient request interceptor
    // picks up the new token for that call.
    writeStorage(STORAGE_KEYS.TOKEN, access)
    writeStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh)
    writeStorage(STORAGE_KEYS.ROLE, 'farmer')
    setToken(access)

    const profile = await authApi.me()
    writeStorage(STORAGE_KEYS.USER, profile)
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(
    async (payload) => {
      // Registration does not return a session — log in with the same
      // credentials right after to start one.
      await authApi.register(payload)
      return login(payload.phone_number, payload.password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    // No backend call: JWT auth here is stateless, so signing out is purely
    // a local storage clear.
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
    removeStorage(STORAGE_KEYS.USER)
    removeStorage(STORAGE_KEYS.ROLE)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      restoring,
      login,
      register,
      logout,
    }),
    [user, token, restoring, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
