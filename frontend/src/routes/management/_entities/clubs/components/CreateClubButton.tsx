// Create a button that opens a dialog with the ClubForm in create mode

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { FormDialog } from '../../../components/FormDialog'
import { ClubForm } from './ClubForm'
import { useClubs } from '../hooks/useClubs'

interface CreateClubButtonProps {
  onSuccess?: () => void
}

export function CreateClubButton({ onSuccess }: CreateClubButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { availableUsers } = useClubs()

  const handleSuccess = () => {
    onSuccess?.()
    setIsOpen(false)
  }

  return (
    <FormDialog
      title="Create New Club"
      description="Add a new club to the system"
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          New Club
        </Button>
      }
    >
      <ClubForm
        mode="create"
        availableUsers={availableUsers}
        onSuccess={handleSuccess}
        onCancel={() => setIsOpen(false)}
      />
    </FormDialog>
  )
}
