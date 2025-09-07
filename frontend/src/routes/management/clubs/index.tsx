import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { ClubService } from '@/services/club.service'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { DefaultHeader } from '@/components/table/table-header'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CreateClubForm from './create-club-form'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'

export const Route = createFileRoute('/management/clubs/')({
  component: ClubManagement,
})

const columnHelper = createColumnHelper<Club>()

const columns = [
  columnHelper.accessor('name', {
    header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('logo', {
    header: (info) => <DefaultHeader info={info} name="Logo" type="string" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('user', {
    header: (info) => <DefaultHeader info={info} name="User" type="string" />,
    // cell: (info) => info.getValue(),
    cell: ({ row }) => {
      const user: User | null | undefined = row.getValue('user')
      const name = user?.email || 'No owner'
      return <span>{name}</span>
    }
  }),
  // columnHelper.accessor('isActive', {
  //   header: (info) => <DefaultHeader info={info} name="Active" type="boolean" />,
  //   cell: (info) => info.getValue(),
  // }),
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

function ClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // const [editingClub, setEditingClub] = useState<string | null>(null)

  // Fetch clubs
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

  // // Safe getOwnerEmail function
  // const getOwnerEmail = (club: Club) => {
  //   if (!club.user || !club.user.email) return 'No owner'
  //   return club.user.email
  // }

  // const handleEditClub = (clubId: string) => {
  //   setEditingClub(editingClub === clubId ? null : clubId)
  // }

  // const handleSaveClub = async (clubId: string, updatedData: { name: string; logo: string }) => {
  //   try {
  //     // You'll need to implement this method in your ClubService
  //     await ClubService.updateClub(clubId, updatedData)
  //     toast.success('Club updated successfully')
  //     setEditingClub(null)
  //     fetchClubs() // Refresh the list
  //   } catch (error: any) {
  //     console.error('Error updating club:', error)
  //     toast.error(error instanceof Error ? error.message : 'An error occurred while updating the club.')
  //   }
  // }

  return (
    (isLoadingClubs) ? (
      <ClubAndUserTableSkeleton rows={8} />
    ) : (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
        <h1 className="text-2xl font-bold mb-10 mt-8">Clubs Management</h1>
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
          <CreateClubForm />
        </div>
        <DataTable<Club, any> columns={columns} data={filteredClubs} />
      </div>
    )
  )
}

export default ClubManagement
