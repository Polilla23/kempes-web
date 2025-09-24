import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import type { Club, User } from '@/types'
import { useClubForm } from '../hooks/useClubForms'
import ClubFormFields from './ClubFormFields'

interface ClubFormProps {
  mode: 'create' | 'edit'
  club?: Club
  availableUsers: User[]
}

export function ClubForm({ mode, club, availableUsers }: ClubFormProps) {
  const { form, onSubmit, isLoading, handleFormCancel } = useClubForm({
    mode,
    club,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ClubFormFields form={form} availableUsers={availableUsers} isLoadingUsers={isLoading} />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleFormCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Club' : 'Update Club'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
