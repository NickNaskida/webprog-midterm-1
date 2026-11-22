import { createContext, useContext, useState } from 'react'
import { api, clearSession, getStoredUser, saveSession } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())

  async function login(email, password) {
    const data = await api.login(email, password)
    saveSession(data)
    setUser(data.user)
    return data.user
  }

  async function register(fields) {
    const data = await api.register(fields)
    saveSession(data)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      // token may already be invalid; we still log out locally
    }
    clearSession()
    setUser(null)
  }

  const canWrite = user?.role === 'author' || user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, canWrite, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
