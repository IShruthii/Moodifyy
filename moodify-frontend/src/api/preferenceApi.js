import axiosInstance from './axiosInstance'

export const getPreference = () => axiosInstance.get('/preferences')
export const savePreference = (data) => axiosInstance.put('/preferences', data)
