import api from './api'

class MeService {
  static async updateProfile(data: { username?: string; avatar?: File }) {
    const formData = new FormData()

    if (data.username !== undefined) {
      formData.append('username', data.username)
    }
    if (data.avatar) {
      formData.append('file', data.avatar)
    }

    const response = await api.patch<{ data: any }>('/api/v1/me', formData)
    return response.data?.data
  }
}

export default MeService
