import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo, useCallback } from 'react'
import UserService from '@/services/user.service'
import { toast } from 'sonner'
import { DefaultHeader } from '@/components/table/table-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserTableSkeleton } from '@/components/ui/form-skeletons'
import CreateUserForm from './create-user-form'
import EditUserForm from './edit-user-form'

export const Route = createFileRoute('/management/users/')({
  component: UserManagement,
})

const columnHelper = createColumnHelper<User>()

function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch clubs
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true)
      const users = await UserService.getUsers()
      console.log('Fetched users:', users)
      setUsers(users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        await UserService.deleteUser(userId)
        toast.success('User deleted successfully')
        fetchUsers() // Refresh the user list
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    },
    [fetchUsers]
  )

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
  }

  const handleEditClose = () => {
    setSelectedUser(null)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('email', {
        header: (info) => <DefaultHeader info={info} name="Email" type="string" />,
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex flex-col">
              <span className="font-semibold">{user.email}</span>
              <span className="text-xs text-muted-foreground">{user.club?.name || 'No club assigned'}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('role', {
        header: (info) => <DefaultHeader info={info} name="Role" type="string" />,
        cell: ({ row }) => {
          const role = row.getValue('role') as string
          const isAdmin = role === 'ADMIN'

          return (
            <Badge variant={isAdmin ? 'default' : 'secondary'} className="font-semibold">
              {role}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('isVerified', {
        header: (info) => <DefaultHeader info={info} name="Status" type="boolean" />,
        cell: ({ row }) => {
          const isVerified = row.getValue('isVerified') as boolean

          return (
            <div className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</span>
                </>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('club', {
        header: (info) => <DefaultHeader info={info} name="Assigned Club" type="string" />,
        cell: ({ row }) => {
          const club: Club | null | undefined = row.getValue('club')

          if (!club) {
            return <span className="text-muted-foreground italic">No club assigned</span>
          }

          return <span className="font-medium">{club.name}</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ellipsis className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleEditClick(user)}>
                    <Pencil className="size-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="size-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [handleDeleteUser]
  )

  return isLoadingUsers ? (
    <UserTableSkeleton rows={8} />
  ) : (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">Manage users, assign roles, and track verification status</p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 select-none text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreateUserForm onSuccess={fetchUsers} />
      </div>

      <DataTable<User, any> columns={columns} data={filteredUsers} />
      {selectedUser && <EditUserForm user={selectedUser} onSuccess={fetchUsers} onClose={handleEditClose} />}
    </div>
  )
}

export default UserManagement
