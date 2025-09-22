// src/routes/management/clubs/hooks/useClubForm.ts
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ClubService } from '@/services/club.service'
import FormSchemas from '../../../utils/form-schemas'
import type { Club } from '@/types'
import type { z } from 'zod'

type ClubFormData = z.infer<typeof FormSchemas.ClubSchema>

interface UseClubFormProps {
  mode: 'create' | 'edit'
  club?: Club
  onSuccess?: () => void
  onClose?: () => void
}

function getDefaultValues(mode: 'create' | 'edit', club?: Club): ClubFormData {
  if (mode === 'create') {
    return {
      name: '',
      logo: '',
      userId: '',
      isActive: true,
    }
  } else {
    return {
      name: club?.name || '',
      logo: club?.logo || '',
      userId: club?.userId || '',
      isActive: club?.isActive ?? true,
    }
  }
}

export function useClubForm({ mode, club, onSuccess, onClose }: UseClubFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ClubFormData>({
    resolver: zodResolver(FormSchemas.ClubSchema),
    defaultValues: getDefaultValues(mode, club),
  })

  // Reset form when club changes (important for edit mode)
  useEffect(() => {
    if (club && mode === 'edit') {
      form.reset(getDefaultValues(mode, club))
    }
  }, [club, mode, form])

  // Handle form submission
  const onSubmit = useCallback(
    async (values: ClubFormData) => {
      try {
        setIsLoading(true)

        // Prepare data for API
        const clubData = {
          name: values.name,
          logo: values.logo || undefined, // Convert empty string to undefined
          userId: values.userId === 'none' || values.userId === '' ? undefined : values.userId,
          isActive: values.isActive,
        }

        if (mode === 'create') {
          await ClubService.createClub(clubData)
          toast.success('Club created successfully!')
          form.reset() // Reset form after successful creation
        } else if (mode === 'edit' && club) {
          await ClubService.updateClub(club.id, clubData)
          toast.success('Club updated successfully!')
        }

        // Call success callback (usually to refresh data and close modal)
        onSuccess?.()
        onClose?.()
      } catch (error) {
        console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} club:`, error)

        // Handle different types of errors
        let errorMessage = `Failed to ${mode} club. Please try again.`

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String(error.message)
        }

        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [mode, club, onSuccess, onClose, form]
  )

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    form.reset()
    onClose?.()
  }, [form, onClose])

  // Handle form reset
  const handleReset = useCallback(() => {
    form.reset(getDefaultValues(mode, club))
  }, [form, mode, club])

  return {
    form,
    onSubmit,
    isLoading,
    handleCancel,
    handleReset,
    // Expose form state for conditional rendering
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  }
}
