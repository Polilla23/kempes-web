import { useQuery } from '@tanstack/react-query'
import UserService from '@/services/user.service'
import { queryKeys } from '@/lib/react-query'
import type { User } from '@/types'

export function useUsers() {
  return useQuery<User[], Error>({
    // Query key - identifica esta query de forma única
    queryKey: queryKeys.users,

    // Query function - función que hace el fetch
    queryFn: async () => {
      const users = await UserService.getUsers()
      return users
    },

    // Opciones específicas para esta query (opcional)
    staleTime: 2 * 60 * 1000, // 2 minutos - users no cambian tan seguido
  })
}

export function useUser(id: string) {
  return useQuery<User | null, Error>({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      // Como no hay endpoint individual, obtenemos la lista y filtramos
      const users = await UserService.getUsers()
      const user = users.find((u) => u.id === id)
      return user || null
    },
    enabled: !!id, // Solo ejecuta si id existe
    staleTime: 2 * 60 * 1000,
  })
}
