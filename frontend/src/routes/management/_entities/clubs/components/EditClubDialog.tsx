import { FormDialog } from '../../../components/FormDialog'
import { ClubForm } from './ClubForm'
import type { Club, User } from '@/types'
interface EditClubDialogProps {
  club: Club
  availableUsers: User[]
  isOpen: boolean
  onClose: () => void
}

export function EditClubDialog({ club, availableUsers, isOpen, onClose }: EditClubDialogProps) {
  if (!club) return null

  return (
    <FormDialog
      title="Edit Club"
      description="Make changes to the club here"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ClubForm mode="edit" club={club} availableUsers={availableUsers} />
    </FormDialog>
  )
}
