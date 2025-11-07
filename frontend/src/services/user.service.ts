import api from './api'
import type { User } from '@/types'

class UserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<{ data: User[] }>('/users')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching users')
    }
  }

  // TODO: Agregar el resto de métodos (update, delete, etc.)
  static async updateUser(userId: string, updatedData: Partial<User>): Promise<User | undefined> {
    try {
      const response = await api.patch<User>(`/users/${userId}`, updatedData)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating user')
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete<void>(`/users/${userId}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting user')
    }
  }
}

export default UserService
