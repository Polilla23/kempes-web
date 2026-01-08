import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import UserService from '@/services/user.service'
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
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import CreateUserForm from './create-user-form'
import EditUserForm from './edit-user-form'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/management/users/')({
  component: UserManagement,
})

const columnHelper = createColumnHelper<User>()

function UserManagement() {
  const { t } = useTranslation('users')
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  // Fetch clubs
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await UserService.getUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId)
      toast.success(t('delete.success'))
      fetchUsers() // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(t('delete.error'))
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedUser(null)
    setIsEditModalOpen(false)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('email', {
        header: (info) => <DefaultHeader info={info} name={t('fields.email')} type="string" />,
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: (info) => <DefaultHeader info={info} name={t('fields.role')} type="string" />,
        cell: (info) => <span className="capitalize">{info.getValue().toLowerCase()}</span>,
      }),
      columnHelper.accessor('isVerified', {
        header: (info) => <DefaultHeader info={info} name={t('fields.verified')} type="boolean" />,
        cell: ({ row }) => (
          <div className="pl-5">
            <Checkbox checked={row.original.isVerified} disabled />
          </div>
        ),
      }),
      columnHelper.accessor('club', {
        header: (info) => <DefaultHeader info={info} name={t('fields.club')} type="string" />,
        cell: ({ row }) => {
          // const club: Club | null | undefined = row.original.club
          const club: Club | null | undefined = row.getValue('club')
          const name = club?.name || t('table.noClub')
          return <span>{name}</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="flex justify-center cursor-default select-none">{t('table.actions')}</span>,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex justify-center">
              <DropdownMenu
                onOpenChange={(open) => {
                  if (!open) {
                    handleEditClose()
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(user)}>
                    <Pencil className="size-4" /> {t('edit.action')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="size-4 text-destructive" /> {t('delete.action')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [users, selectedUser, isEditModalOpen, t]
  )

  return isLoadingUsers ? (
    <ClubAndUserTableSkeleton rows={8} />
  ) : (
    <div className="flex flex-col items-center gap-2 h-full w-full max-w-3/4">
      <h1 className="text-3xl font-bold mb-10 mt-8 select-none">{t('title')}</h1>
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search" className="sr-only">
          {t('table.search')}
        </Label>
        <Input
          id="search"
          type="text"
          placeholder={`${t('table.search')}...`}
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateUserForm onSuccess={fetchUsers} />
      </div>
      <DataTable<User, any> columns={columns} data={filteredUsers} />
      {selectedUser && <EditUserForm user={selectedUser} onSuccess={fetchUsers} onClose={handleEditClose} />}
    </div>
  )
}

export default UserManagement
