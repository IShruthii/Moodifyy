import axios from 'axios'

// In production (Vercel), set VITE_API_URL to your backend URL
// e.g. https://your-backend.railway.app
// In dev, Vite proxy handles /api -> localhost:8080
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moodify_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    // Auto-logout on 401, or 400 on protected endpoints (not login/register)
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('moodify_token')
      localStorage.removeItem('moodify_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
