import api from './api'
import type { User, DataEnvelope } from '@/types'

class UserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<DataEnvelope<User[]>>('/users')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching users')
    }
  }

  // TODO: Agregar el resto de métodos (update, delete, etc.)
  static async updateUser(userId: string, updatedData: Partial<User>): Promise<User | undefined> {
    try {
      const response = await api.patch<DataEnvelope<User>>(`/users/${userId}`, updatedData)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating user')
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting user')
    }
  }
}

export default UserService
