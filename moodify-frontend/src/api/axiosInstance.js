import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
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
    if (error.response?.status === 401) {
      localStorage.removeItem('moodify_token')
      localStorage.removeItem('moodify_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
