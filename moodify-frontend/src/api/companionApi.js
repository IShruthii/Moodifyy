import axiosInstance from './axiosInstance'

export const sendChatMessage = (data) =>
  axiosInstance.post('/companion/chat', data, { timeout: 10000 })

export const getChatHistory = (sessionId) =>
  axiosInstance.get(`/companion/history/${sessionId}`)
