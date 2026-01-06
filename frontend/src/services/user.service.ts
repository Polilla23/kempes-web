import api from './api'
import type { User, UsersResponse } from '@/types'

class UserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<UsersResponse> {
    try {
      const response = await api.get<{ data: User[] }>('/api/v1/users')
      // Backend devuelve { data: User[], message, timestamp }
      return { users: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching users')
    }
  }

  // TODO: Agregar el resto de métodos (update, delete, etc.)
  static async updateUser(userId: string, updatedData: Partial<User>): Promise<User | undefined> {
    try {
      const response = await api.patch<{ data: User }>(`/api/v1/users/${userId}`, updatedData)
      // Backend devuelve { data: User, message, timestamp }
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating user')
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // DELETE devuelve 204 No Content (sin body)
      await api.delete<void>(`/api/v1/users/${userId}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting user')
    }
  }
}

export default UserService
