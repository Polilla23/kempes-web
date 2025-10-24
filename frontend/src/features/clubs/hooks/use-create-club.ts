import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClubService } from '@/services/club.service'
import { queryKeys } from '@/lib/react-query'
import type { RegisterClubFormData, Club } from '@/types'
import { toast } from 'sonner'

/**
 * Hook para crear un nuevo club
 * 
 * Características:
 * - Optimistic update (actualiza UI antes de que responda el servidor)
 * - Rollback automático en caso de error
 * - Invalidación automática de queries relacionadas
 * - Manejo de errores integrado
 * 
 * @example
 * ```tsx
 * function CreateClubForm() {
 *   const createClub = useCreateClub()
 *   
 *   const onSubmit = (data) => {
 *     createClub.mutate(data, {
 *       onSuccess: () => {
 *         toast.success('Club created!')
 *         form.reset()
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <Form onSubmit={onSubmit}>
 *       <Button disabled={createClub.isPending}>
 *         {createClub.isPending ? 'Creating...' : 'Create Club'}
 *       </Button>
 *     </Form>
 *   )
 * }
 * ```
 */
export function useCreateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    // Mutation function - función que hace la creación
    mutationFn: async (data: RegisterClubFormData) => {
      const response = await ClubService.createClub(data)
      return response.club // Asumiendo que el servicio devuelve { club: Club, message: string }
    },

    // onMutate - Se ejecuta ANTES de hacer el request (para optimistic update)
    onMutate: async (newClubData) => {
      // Cancela cualquier refetch pendiente para evitar sobrescribir el optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.clubs })

      // Snapshot del valor anterior (para rollback)
      const previousClubs = queryClient.getQueryData<Club[]>(queryKeys.clubs)

      // Optimistic update: agrega el club temporalmente a la UI
      if (previousClubs) {
        // Genera un ID temporal
        const tempClub: Club = {
          id: `temp-${Date.now()}`,
          name: newClubData.name,
          logo: newClubData.logo,
          userId: newClubData.userId || undefined,
          isActive: newClubData.isActive ?? true,
          user: undefined, // Se llenará con el response real
        }

        queryClient.setQueryData<Club[]>(queryKeys.clubs, [...previousClubs, tempClub])
      }

      // Return context con datos para rollback
      return { previousClubs }
    },

    // onError - Si falla, hace rollback
    onError: (error, _newClub, context) => {
      // Restaura el estado anterior
      if (context?.previousClubs) {
        queryClient.setQueryData(queryKeys.clubs, context.previousClubs)
      }

      // Muestra error al usuario
      toast.error(error instanceof Error ? error.message : 'Failed to create club')
    },

    // onSuccess - Se ejecuta después de un request exitoso
    onSuccess: (club) => {
      toast.success(`Club "${club?.name || 'New club'}" created successfully!`)
    },

    // onSettled - Se ejecuta SIEMPRE (success o error) al final
    onSettled: () => {
      // Invalida queries relacionadas para refetch desde el servidor
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs })
      queryClient.invalidateQueries({ queryKey: queryKeys.users }) // Users pueden estar afectados
    },
  })
}
