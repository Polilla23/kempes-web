import { useCallback } from 'react'
import { toast } from 'sonner'
import { ClubService } from '@/services/club.service'

import type { Club } from '@/types'
import { useFormDialog } from '@/routes/management/hooks/useFormDialog'
import { useManagementEvents } from '@/routes/management/hooks/useManagementEvents'

export function useClubActions() {
  const {
    selectedItem: selectedClub,
    isOpen: isEditOpen,
    handleEdit: openEdit,
    handleClose,
  } = useFormDialog<Club>()
  const { emitClubEvent } = useManagementEvents()

  const handleEdit = useCallback(
    (club: Club) => {
      console.log('🔵 Opening edit for club:', club.name) // Debug
      openEdit(club)
    },
    [openEdit]
  )

  const handleEditClose = useCallback(() => {
    console.log('🔴 Closing edit dialog') // Debug
    handleClose()
    emitClubEvent('dialog-close')
  }, [handleClose, emitClubEvent])

  const handleDelete = useCallback(
    async (clubId: string) => {
      console.log('🗑️ Attempting to delete club:', clubId) // Debug
      try {
        await ClubService.deleteClub(clubId)
        console.log('✅ Club deleted successfully') // Debug
        emitClubEvent('deleted', { clubId })
        toast.success('Club deleted successfully')
      } catch (error) {
        console.error('❌ Error deleting club:', error)
        toast.error('Failed to delete club')
      }
    },
    [emitClubEvent]
  )

  return {
    selectedClub,
    isEditOpen,
    handleEdit,
    handleEditClose,
    handleDelete,
  }
}
