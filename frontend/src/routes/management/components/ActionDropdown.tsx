// Dropdown menu with edit and delete actions for managed entities.

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Club, Player, User } from '@/types'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'

interface ActionsDropdownProps {
  data: Club | User | Player
  onEdit: (data: Club | User | Player) => void
  onDelete: (id: string) => void
}

function ActionsDropdown({ onEdit, onDelete, data }: ActionsDropdownProps) {
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Ellipsis className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(data)}>
            <Pencil className="size-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => onDelete(data.id)}>
            <Trash2 className="size-4 text-destructive" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ActionsDropdown
