import axiosInstance from './axiosInstance'

export const logMood = (data) => axiosInstance.post('/mood/log', data)
export const getMoodHistory = () => axiosInstance.get('/mood/history')
export const getTodaysMood = () => axiosInstance.get('/mood/today')
export const getMoodsByRange = (startDate, endDate) =>
  axiosInstance.get(`/mood/range?startDate=${startDate}&endDate=${endDate}`)
