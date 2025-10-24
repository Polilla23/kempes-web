import { useQuery } from '@tanstack/react-query'
import { ClubService } from '@/services/club.service'
import { queryKeys } from '@/lib/react-query'
import type { Club } from '@/types'

export function useClubs() {
  return useQuery<Club[], Error>({
    // Query key - identifica esta query de forma única
    queryKey: queryKeys.clubs,

    // Query function - función que hace el fetch
    queryFn: async () => {
      const clubs = await ClubService.getClubs()
      return clubs
    },

    // Opciones específicas para esta query (opcional)
    staleTime: 2 * 60 * 1000, // 2 minutos - clubs no cambian tan seguido

    // Select - transformar datos antes de devolverlos (opcional)
    // select: (clubs) => clubs.filter(club => club.isActive),
  })
}

export function useClub(id: string) {
  return useQuery<Club | null, Error>({
    queryKey: queryKeys.club(id),
    queryFn: async () => {
      const club = await ClubService.getClubById(id)
      return club
    },
    enabled: !!id, // Solo ejecuta si id existe
  })
}
