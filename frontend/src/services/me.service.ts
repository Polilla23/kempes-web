import api from './api'

export interface MeClub {
  id: string
  name: string
  logo: string | null
  isActive: boolean
  preferredFormation: string
  playersOwned: number
  playersActive: number
}

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

  static async getClub(): Promise<MeClub | null> {
    const response = await api.get<{ data: MeClub | null }>('/api/v1/me/club')
    return response.data?.data ?? null
  }
}

export default MeService
