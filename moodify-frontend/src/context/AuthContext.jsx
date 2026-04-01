import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('moodify_token')
    const storedUser = localStorage.getItem('moodify_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    const data = res.data.data
    setToken(data.token)
    setUser({ id: data.userId, name: data.name, email: data.email, profileSetup: data.profileSetup, gender: data.gender })
    localStorage.setItem('moodify_token', data.token)
    localStorage.setItem('moodify_user', JSON.stringify({
      id: data.userId, name: data.name, email: data.email, profileSetup: data.profileSetup, gender: data.gender
    }))
    return data
  }

  const register = async (name, email, password, gender) => {
    const res = await registerUser({ name, email, password, gender })
    const data = res.data.data
    setToken(data.token)
    setUser({ id: data.userId, name: data.name, email: data.email, profileSetup: false, gender: data.gender || gender })
    localStorage.setItem('moodify_token', data.token)
    localStorage.setItem('moodify_user', JSON.stringify({
      id: data.userId, name: data.name, email: data.email, profileSetup: false, gender: data.gender || gender
    }))
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('moodify_token')
    localStorage.removeItem('moodify_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('moodify_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
