import axiosInstance from './axiosInstance'

export const getNotifications = () => axiosInstance.get('/notifications')
export const getUnreadCount = () => axiosInstance.get('/notifications/unread-count')
export const markAllRead = () => axiosInstance.post('/notifications/mark-read')
