import axiosInstance from './axiosInstance'

export const getAnalytics = () => axiosInstance.get('/analytics')
export const getMonthlyReport = (year, month) =>
  axiosInstance.get(`/analytics/report?year=${year}&month=${month}`)
