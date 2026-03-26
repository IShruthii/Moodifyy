import axiosInstance from './axiosInstance'

export const submitFeedback = (data) => axiosInstance.post('/feedback', data)
export const getFeedbackHistory = () => axiosInstance.get('/feedback')
export const getFeedbackSummary = () => axiosInstance.get('/feedback/summary')
