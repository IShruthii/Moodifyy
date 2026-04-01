import axiosInstance from './axiosInstance'

export const sendChatMessage = (data) =>
  axiosInstance.post('/companion/chat', data, { timeout: 70000 }) // 70s for Render free tier wake-up

export const getChatHistory = (sessionId) =>
  axiosInstance.get(`/companion/history/${sessionId}`)
