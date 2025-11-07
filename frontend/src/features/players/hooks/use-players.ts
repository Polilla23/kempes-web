import { useQuery } from '@tanstack/react-query'
import { PlayerService } from '@/services/player.service'
import { queryKeys } from '@/lib/react-query'
import type { Player } from '@/types'

export function usePlayers() {
  return useQuery<Player[], Error>({
    queryKey: queryKeys.players,
    queryFn: async () => {
      const players = await PlayerService.getPlayers()
      return players
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function usePlayer(id: string) {
  return useQuery<Player | null, Error>({
    queryKey: queryKeys.player(id),
    queryFn: async () => {
      const player = await PlayerService.getPlayerById(id)
      return player || null
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}
