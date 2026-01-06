import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { ClubService } from '@/services/club.service'
import { toast } from 'sonner'
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
import CreateClubForm from './create-club-form'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import EditClubForm from './edit-club-form'
import UserService from '@/services/user.service'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/management/clubs/')({
  component: ClubManagement,
})

function ClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true) // Add loading state for users
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([]) // Change to User[] type

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true) // Set loading to true
      const response = await UserService.getUsers()
      const availableUsersFiltered =
        response.users?.filter((user: User) => {
          // Check if club is null, undefined, or an empty object
          return (
            !user.club ||
            user.club === null ||
            user.club === undefined ||
            (typeof user.club === 'object' && Object.keys(user.club).length === 0)
          )
        }) || []
      setAvailableUsers(availableUsersFiltered)
    } catch (error) {
      console.error('Error fetching users:', error)
      setAvailableUsers([])
      toast.error('Failed to fetch users')
    } finally {
      setIsLoadingUsers(false) // Set loading to false
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true)
      const response = await ClubService.getClubs()
      setClubs(response.clubs || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to fetch clubs')
      setClubs([])
    } finally {
      setIsLoadingClubs(false)
    }
  }

  useEffect(() => {
    fetchClubs()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // 0.5 second delay

    return () => clearTimeout(timer)
  }, [search])

  const filteredClubs = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return clubs.filter((club) => {
      return (
        club.name.toLowerCase().includes(lowerCaseSearch) ||
        (club.user?.email.toLowerCase() || 'No owner').includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, clubs])

  const handleDeleteClub = async (clubId: string) => {
    try {
      await ClubService.deleteClub(clubId)
      toast.success('Club deleted successfully')
      await Promise.all([fetchClubs(), fetchUsers()]) // Refresh both clubs and users
    } catch (error) {
      console.error('Error deleting club:', error)
      toast.error('Failed to delete club')
    }
  }

  const handleEditClick = (club: Club) => {
    setSelectedClub(club)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedClub(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<Club>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('logo', {
        header: (info) => <DefaultHeader info={info} name="Logo" type="string" />,
        cell: (info) => {
          const logo = info.getValue()
          return logo ? (
            <img src={logo} alt="Club logo" className="h-8 w-8 rounded" />
          ) : (
            <span className="text-gray-500">No logo</span>
          )
        },
      }),
      columnHelper.accessor('user', {
        header: (info) => <DefaultHeader info={info} name="User" type="string" />,
        cell: ({ row }) => {
          const user: User | null | undefined = row.getValue('user')
          const name = user?.email || 'No owner'
          return <span>{name}</span>
        },
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name="Active?" type="boolean" />,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Badge variant={row.original.isActive ? "default" : "destructive"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">Actions</span>,
        cell: ({ row }) => {
          const club = row.original
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(club)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeleteClub(club.id)}>
                    <Trash2 className="size-4 text-destructive" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [isEditModalOpen]
  )

  // Show loading if either clubs or users are loading
  if (isLoadingClubs || isLoadingUsers) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-2xl font-bold mb-10 mt-8 select-none">Clubs Management</h1>
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search..."
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateClubForm
          onSuccess={() => {
            fetchClubs()
            fetchUsers()
          }}
        />
      </div>
      <DataTable<Club, any> columns={columns} data={filteredClubs} />
      {selectedClub && (
        <EditClubForm
          club={selectedClub}
          availableUsers={availableUsers}
          onSuccess={() => {
            fetchClubs()
            fetchUsers()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default ClubManagement
