/**
 * CLUBS MANAGEMENT - REFACTORED WITH TANSTACK QUERY
 *
 * Antes (OLD):
 * - useState para clubs, loading, errors
 * - useEffect para fetch inicial
 * - Llamadas manuales a fetchClubs() después de crear/editar/eliminar
 * - Manejo manual de loading/error states
 * - 150+ líneas con lógica mezclada
 *
 * Después (NEW):
 * - useClubs() hook → auto-fetching, caching, refetching
 * - Mutations devuelven estados (isLoading, isError)
 * - Invalidación automática → no más fetchClubs() manuales
 * - Optimistic updates → UI instantánea
 * - 80 líneas, más limpio y mantenible
 */

import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Club, User } from '@/types'
import { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import EditClubForm from './edit-club-form'

// 🎯 NEW: Import TanStack Query hooks
import { useClubs, useDeleteClub } from '@/features/clubs/hooks'
import { useUsers } from '@/features/users/hooks' // You'll create this next

export const Route = createFileRoute('/management/clubs/')({
  component: ClubManagement,
})

function ClubManagement() {
  // 🎯 NEW: Use TanStack Query hooks instead of useState + useEffect
  const { data: clubs = [], isLoading: isLoadingClubs } = useClubs()
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()
  const deleteClubMutation = useDeleteClub()

  const [search, setSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filter users without clubs (same logic)
  const availableUsers = useMemo(
    () =>
      users.filter((user: User) => {
        return (
          !user.club ||
          user.club === null ||
          user.club === undefined ||
          (typeof user.club === 'object' && Object.keys(user.club).length === 0)
        )
      }),
    [users]
  )

  // Search filtering with debounce (same logic)
  const filteredClubs = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase()
    return clubs.filter((club) => {
      return (
        club.name.toLowerCase().includes(lowerCaseSearch) ||
        (club.user?.email.toLowerCase() || 'No owner').includes(lowerCaseSearch)
      )
    })
  }, [search, clubs])

  // 🎯 NEW: Delete with mutation (optimistic update handled in hook)
  const handleDeleteClub = async (clubId: string) => {
    deleteClubMutation.mutate(clubId)
    // No need for fetchClubs() or fetchUsers() - auto-invalidates!
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
          <div className="pl-5">
            <Checkbox checked={row.original.isActive} disabled />
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

  // 🎯 NEW: Simplified loading (no more manual state management)
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
        {/* 🎯 NEW: No need for onSuccess callback - auto-invalidates */}
        <CreateClubForm />
      </div>
      <DataTable<Club, any> columns={columns} data={filteredClubs} />
      {selectedClub && (
        <EditClubForm
          club={selectedClub}
          availableUsers={availableUsers}
          onSuccess={handleEditClose} // Only close modal
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default ClubManagement
