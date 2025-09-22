import { useState, useCallback } from 'react'
import type { Club } from '@/types'
import { useFormDialog } from '@/routes/management/hooks/useFormDialog'

export function useClubActions(onDelete: (id: string) => Promise<void>) {
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null)
  const { setSelectedItem, setIsOpen } = useFormDialog<Club>()

  const handleEdit = useCallback((club: Club) => {
    setSelectedItem(club)
    setIsOpen(true)
  }, [])

  const handleEditClose = useCallback(() => {
    setSelectedItem(null)
    setIsOpen(false)
  }, [])

  const handleDelete = useCallback(
    async (clubId: string) => {
      try {
        setIsDeleteLoading(clubId)
        await onDelete(clubId)
      } finally {
        setIsDeleteLoading(null)
      }
    },
    [onDelete]
  )

  return {
    isDeleteLoading,
    handleEdit,
    handleEditClose,
    handleDelete,
  }
}
