import api from './api'
import type { User, UsersResponse } from '@/types'

class UserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<UsersResponse> {
    try {
      const response = await api.get<{ users: User[] }>('/user/findAll')
      console.log('DATA DE USUARIOS', response.data)
      return response.data || { users: [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching users')
    }
  }

  // TODO: Agregar el resto de métodos (update, delete, etc.)
  static async updateUser(userId: string, updatedData: Partial<User>): Promise<User | undefined> {
    try {
      const response = await api.patch<User>(`/user/update/${userId}`, updatedData)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating user')
    }
  }
  static async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete<void>(`/user/delete/${userId}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting user')
    }
  }
}

export default UserService
