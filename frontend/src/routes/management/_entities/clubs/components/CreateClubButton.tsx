// Create a button that opens a dialog with the ClubForm in create mode

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { FormDialog } from '../../../components/FormDialog'
import { ClubForm } from './ClubForm'
import { useFormDialog } from '@/routes/management/hooks/useFormDialog'
import type { Club, User } from '@/types'
interface CreateClubButtonProps {
  availableUsers: User[]
}

export function CreateClubButton({ availableUsers }: CreateClubButtonProps) {
  const { isOpen } = useFormDialog<Club>()

  return (
    <FormDialog
      title="Create New Club"
      description="Add a new club to the system"
      open={isOpen}
      trigger={
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          New Club
        </Button>
      }
    >
      <ClubForm mode="create" availableUsers={availableUsers} />
    </FormDialog>
  )
}
