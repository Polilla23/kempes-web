// A custom hook that contains:
// - State and handlers for opening/closing a form dialog
// - State for the selected item (for edit mode)
// - Mode state ('create' or 'edit')
// This hook can be used in any component that needs to open a form dialog for creating or editing an item.

import { useCallback, useState } from 'react'

type FormMode = 'create' | 'edit'

export function useFormDialog<T = any>() {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<FormMode>('create')

  const handleEdit = useCallback(
    (item: T) => {
      console.log('📝 useFormDialog: Opening edit dialog', item) // Debug
      setSelectedItem(item)
      setMode('edit')
      setIsOpen(true)
    },
    []
  )

  const handleClose = useCallback(() => {
    console.log('❌ useFormDialog: Closing dialog') // Debug
    setIsOpen(false)
    // Add a small delay before clearing the item to prevent render issues
    setTimeout(() => {
      setSelectedItem(null)
      setMode('create')
    }, 150) // Small delay for dialog animation
  }, [])

  const handleCreate = useCallback(() => {
    console.log('➕ useFormDialog: Opening create dialog') // Debug
    setSelectedItem(null)
    setMode('create')
    setIsOpen(true)
  }, [])

  return {
    selectedItem,
    isOpen,
    mode,
    handleEdit,
    handleClose,
    handleCreate,
  }
}
