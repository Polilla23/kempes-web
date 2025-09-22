import { FormDialog } from '../../../components/FormDialog'
import { ClubForm } from './ClubForm'
import type { Club, User } from '@/types'

interface EditClubDialogProps {
  club: Club
  availableUsers: User[]
  isOpen: boolean
  onSuccess?: () => void
  onClose?: () => void
}

export function EditClubDialog({ club, availableUsers, isOpen, onSuccess, onClose }: EditClubDialogProps) {
  return (
    <FormDialog
      title="Edit Club"
      description="Make changes to the club here"
      open={isOpen}
      onOpenChange={onClose || (() => {})}
    >
      <ClubForm
        mode="edit"
        club={club}
        availableUsers={availableUsers}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </FormDialog>
  )
}
