import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClubService } from '@/services/club.service'
import { queryKeys } from '@/lib/react-query'
import type { Club } from '@/types'
import { toast } from 'sonner'

export function useDeleteClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await ClubService.deleteClub(id)
      return { id }
    },

    // Optimistic update - Remueve inmediatamente de UI
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clubs })

      const previousClubs = queryClient.getQueryData<Club[]>(queryKeys.clubs)

      // Remueve el club de la lista optimistically
      if (previousClubs) {
        queryClient.setQueryData<Club[]>(
          queryKeys.clubs,
          previousClubs.filter((club) => club.id !== id)
        )
      }

      return { previousClubs }
    },

    onError: (error, _id, context) => {
      // Rollback - Restaura el club eliminado
      if (context?.previousClubs) {
        queryClient.setQueryData(queryKeys.clubs, context.previousClubs)
      }

      toast.error(error instanceof Error ? error.message : 'Failed to delete club')
    },

    onSuccess: () => {
      toast.success('Club deleted successfully!')
    },

    onSettled: () => {
      // Invalida queries para refetch desde servidor
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs })
      queryClient.invalidateQueries({ queryKey: queryKeys.users }) // Users pueden estar afectados
    },
  })
}
