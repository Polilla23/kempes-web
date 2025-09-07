import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { UserService } from '@/services/user.service'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { DefaultHeader } from '@/components/table/table-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CreateUserForm from './create-user-form'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'

export const Route = createFileRoute('/management/users/')({
  component: UserManagement,
})

const columnHelper = createColumnHelper<User>()

const columns = [
  // Validate if it's good practice show the ID.
  // columnHelper.accessor('id', {
  //   header: () => <span>ID</span>,
  // }),
  columnHelper.accessor('email', {
    header: (info) => <DefaultHeader info={info} name="Email" type="string" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('role', {
    header: (info) => <DefaultHeader info={info} name="Role" type="string" />,
    cell: (info) => {
      const role = info.getValue().toLowerCase()
      return <span className="capitalize">{role}</span>
    },
  }),
  columnHelper.accessor('isVerified', {
    header: (info) => <DefaultHeader info={info} name="Verified?" type="boolean" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox className="" checked={row.getValue('isVerified')} />
      </div>
    ),
  }),
  columnHelper.accessor('club', {
    header: (info) => <DefaultHeader info={info} name="Club" type="string" />,
    cell: ({ row }) => {
      const club: Club | null | undefined = row.getValue('club')
      const name = club?.name || 'No Club'
      return <span>{name}</span>
    },
  }),
  columnHelper.display({
    id: 'actions',
    enableHiding: false,
    header: () => <span className="text-start cursor-default">Actions</span>,
    cell: () => {
      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Trash2 className="size-4 text-destructive" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }),
]


function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Fetch clubs
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await UserService.getUsers()
      console.log('Fetched users:', response.users)
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to fetch clubs')
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => {
      clearTimeout(timerId)
    }
  }, [search])

  const filteredUsers = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(lowerCaseSearch) ||
        user.role.toLowerCase().includes(lowerCaseSearch) ||
        (user.club?.name?.toLowerCase() || '').includes(lowerCaseSearch) ||
        user.isVerified.toString().toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, users])

  return (
    (isLoadingUsers) ? (
      <ClubAndUserTableSkeleton rows={8} />
    ) : (
      <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
        <h1 className="text-2xl font-bold mb-10 mt-8">Users Management</h1>
        <div className="flex justify-between gap-3 mb-4 w-full relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
          <CreateUserForm />
        </div>
        <DataTable<User, any> columns={columns} data={filteredUsers} />
      </div>
    )
  )
}

export default UserManagement
