import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClubService } from '@/services/club.service'
import { queryKeys } from '@/lib/react-query'
import type { RegisterClubFormData, Club } from '@/types'
import { toast } from 'sonner'

export function useUpdateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RegisterClubFormData }) => {
      const response = await ClubService.updateClub(id, data)
      return { id, club: response.club }
    },

    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clubs })
      await queryClient.cancelQueries({ queryKey: queryKeys.club(id) })

      const previousClubs = queryClient.getQueryData<Club[]>(queryKeys.clubs)
      const previousClub = queryClient.getQueryData<Club>(queryKeys.club(id))

      // Update en la lista de clubs
      if (previousClubs) {
        queryClient.setQueryData<Club[]>(
          queryKeys.clubs,
          previousClubs.map((club) =>
            club.id === id ? { ...club, ...data, userId: data.userId || undefined } : club
          )
        )
      }

      // Update en el club individual
      if (previousClub) {
        queryClient.setQueryData<Club>(queryKeys.club(id), {
          ...previousClub,
          ...data,
          userId: data.userId || undefined,
        })
      }

      return { previousClubs, previousClub }
    },

    onError: (error, _variables, context) => {
      // Rollback
      if (context?.previousClubs) {
        queryClient.setQueryData(queryKeys.clubs, context.previousClubs)
      }
      if (context?.previousClub) {
        queryClient.setQueryData(queryKeys.club(_variables.id), context.previousClub)
      }

      toast.error(error instanceof Error ? error.message : 'Failed to update club')
    },

    onSuccess: ({ club }) => {
      toast.success(`Club "${club?.name || 'Club'}" updated successfully!`)
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs })
      queryClient.invalidateQueries({ queryKey: queryKeys.club(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}
