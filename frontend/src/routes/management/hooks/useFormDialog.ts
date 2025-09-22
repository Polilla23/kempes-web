// A custom hook to manage form dialog state for create/edit operations

import { useState, useCallback } from 'react'

interface UseFormDialogOptions {
  onSuccess?: () => void
}

export function useFormDialog<T = any>(options?: UseFormDialogOptions) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  const handleCreate = useCallback(() => {
    setSelectedItem(null)
    setMode('create')
    setIsOpen(true)
  }, [])

  const handleEdit = useCallback((item: T) => {
    setSelectedItem(item)
    setMode('edit')
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setSelectedItem(null)
    // Don't reset mode immediately to avoid flicker
    setTimeout(() => setMode('create'), 150) // Small delay for smooth transition
  }, [])

  const handleSuccess = useCallback(() => {
    options?.onSuccess?.()
    handleClose()
  }, [options?.onSuccess, handleClose])

  return {
    isOpen,
    selectedItem,
    mode,
    handleCreate,
    handleEdit,
    handleClose,
    handleSuccess,
    setIsOpen,
    setSelectedItem,
    setMode,
  }
}
