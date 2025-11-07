import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo, useCallback } from 'react'
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
  const [availableUsers, setAvailableUsers] = useState<User[]>([]) // Change to User[] type

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true) // Set loading to true
      const users = await UserService.getUsers()
      const availableUsersFiltered =
        users?.filter((user: User) => {
          // Check if club is null, undefined, or an empty object
          return (
            !user.club ||
            user.club === null ||
            user.club === undefined ||
            (typeof user.club === 'object' && Object.keys(user.club).length === 0)
          )
        }) || []
      setAvailableUsers(availableUsersFiltered)
      console.log('Available users for clubs:', availableUsersFiltered)
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
      const clubs = await ClubService.getClubs()
      setClubs(clubs || [])
      console.log('Fetched clubs:', clubs)
    } catch (error) {
      console.error('❌ Clubs Component - Error fetching clubs:', error)
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

  const handleDeleteClub = useCallback(async (clubId: string) => {
    try {
      await ClubService.deleteClub(clubId)
      toast.success('Club deleted successfully')
      await Promise.all([fetchClubs(), fetchUsers()]) // Refresh both clubs and users
    } catch (error) {
      console.error('Error deleting club:', error)
      toast.error('Failed to delete club')
    }
  }, [])

  const handleEditClick = useCallback((club: Club) => {
    setSelectedClub(club)
  }, [])

  const handleEditClose = useCallback(() => {
    setSelectedClub(null)
  }, [])

  const columnHelper = createColumnHelper<Club>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('logo', {
        header: () => <span className="sr-only">Logo</span>,
        cell: (info) => {
          const logo = info.getValue()
          const clubName = info.row.original.name
          return (
            <div className="flex items-center justify-center w-12">
              {logo ? (
                <img
                  src={logo}
                  alt={`${clubName} logo`}
                  className="h-10 w-10 rounded-full object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {clubName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )
        },
        enableSorting: false,
      }),
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Club Name" type="string" />,
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('user', {
        header: (info) => <DefaultHeader info={info} name="Owner" type="string" />,
        cell: ({ row }) => {
          const user: User | null | undefined = row.getValue('user')
          if (!user) {
            return <span className="text-muted-foreground italic">No owner</span>
          }
          return <span className="font-medium">{user.email}</span>
        },
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name="Status" type="boolean" />,
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600 dark:bg-gray-400"></span>
                Inactive
              </span>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const club = row.original
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                    <Ellipsis className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleEditClick(club)}>
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClub(club.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [columnHelper, handleDeleteClub, handleEditClick]
  )

  // Show loading if either clubs or users are loading
  if (isLoadingClubs || isLoadingUsers) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Clubs Management</h1>
        <p className="text-muted-foreground">Manage your clubs, assign owners, and track their status</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search clubs..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
