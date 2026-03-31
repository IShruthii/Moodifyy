import axiosInstance from './axiosInstance'

export const getMovieRecommendations = (emotion) =>
  axiosInstance.get(`/recommend/movies/${emotion}`)
