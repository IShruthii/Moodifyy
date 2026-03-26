import axiosInstance from './axiosInstance'

export const getRecommendations = (mood) => axiosInstance.get(`/recommendations/${mood}`)
export const logRecommendationClick = (mood, type, title) =>
  axiosInstance.post(`/recommendations/click?mood=${mood}&type=${type}&title=${encodeURIComponent(title)}`)
