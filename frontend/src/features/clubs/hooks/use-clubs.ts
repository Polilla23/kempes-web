import { useQuery } from '@tanstack/react-query'
import { ClubService } from '@/services/club.service'
import { queryKeys } from '@/lib/react-query'
import type { Club } from '@/types'

export function useClubs() {
  return useQuery<Club[], Error>({
    queryKey: queryKeys.clubs,
    queryFn: async () => {
      const clubs = await ClubService.getClubs()
      return clubs
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useClub(id: string) {
  return useQuery<Club | null, Error>({
    queryKey: queryKeys.club(id),
    queryFn: async () => {
      const club = await ClubService.getClubById(id)
      return club || null
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}
