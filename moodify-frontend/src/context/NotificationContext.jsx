import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUnreadCount, getNotifications, markAllRead } from '../api/notificationApi'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.data.count)
    } catch {
      // silent
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await getNotifications()
      setNotifications(res.data.data || [])
    } catch {
      // silent
    }
  }, [user])

  const markRead = async () => {
    try {
      await markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [user, fetchUnreadCount])

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, fetchNotifications, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
