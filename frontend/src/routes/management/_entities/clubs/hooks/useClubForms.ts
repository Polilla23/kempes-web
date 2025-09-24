// src/routes/management/clubs/hooks/useClubForm.ts
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ClubService } from '@/services/club.service'
import FormSchemas from '../../../utils/form-schemas'
import type { Club } from '@/types'
import type { z } from 'zod'
import { useFormDialog } from '@/routes/management/hooks/useFormDialog'
import { useManagementEvents } from '@/routes/management/hooks/useManagementEvents'

type ClubFormData = z.infer<typeof FormSchemas.ClubSchema>

interface UseClubFormProps {
  mode?: 'create' | 'edit'
  club?: Club
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

export function useClubForm({ mode, club }: UseClubFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen } = useFormDialog()
  const { handleClose } = useFormDialog()
  const { emitClubEvent } = useManagementEvents()

  const form = useForm<ClubFormData>({
    resolver: zodResolver(FormSchemas.ClubSchema),
    defaultValues: getDefaultValues(mode!, club),
  })

  // Reset form when club changes (important for edit mode)
  useEffect(() => {
    if (club && mode === 'edit') {
      form.reset(getDefaultValues(mode, club))
    }
  }, [club, mode, form, isOpen])

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
          emitClubEvent('created', { club: clubData })
          form.reset(getDefaultValues('create'))
          toast.success('Club created successfully!')
        } else if (mode === 'edit' && club) {
          await ClubService.updateClub(club.id, clubData)
          emitClubEvent('updated', { club: clubData })
          form.reset(getDefaultValues('create'))
          toast.success('Club updated successfully!')
        }
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
    [mode, club, emitClubEvent, form]
  )

  // Handle form cancellation
  const handleFormCancel = useCallback(() => {
    form.reset()
    handleClose()
    emitClubEvent('dialog-close')
  }, [form])

  return {
    form,
    onSubmit,
    isLoading,
    handleFormCancel,
    // Expose form state for conditional rendering
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  }
}
