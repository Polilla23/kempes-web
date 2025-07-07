import api from "./api";
import type { UsersResponse } from "@/types";

export class UserService {
    // Obtener todos los usuarios
    static async getUsers(): Promise<UsersResponse> {
        try {
            const response = await api.get<UsersResponse>('/user/findAll')
            return response.data || { users: [] }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching users')
        }
    }

    // TODO: Agregar el resto de métodos (update, delete, etc.)
}