// Components imports
import { Input } from '@/components/ui/input'
import { PlayerTableSkeleton } from '@/components/ui/form-skeletons'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/table/data-table'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlayerService } from '@/services/player.service'
import type { Club, Player } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import CreatePlayerForm from './create-player-form'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import EditPlayerForm from './edit-player-form'
import { ClubService } from '@/services/club.service'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/management/players/')({
  component: PlayerManagement,
})

function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false)
  const [selectedPlayer, setSetelectedPlayer] = useState<Player | null>(null)

  // Fetch players
  const fetchPlayers = async () => {
    try {
      setIsLoadingPlayers(true)
      const response = await PlayerService.getPlayers()
      setPlayers(response.players || [])
    } catch (error) {
      console.error('Error fetching players: ', error)
      toast.error('Failed to fetch players')
      setPlayers([])
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  const fetchClubs = async () => {
    try {
      const response = await ClubService.getClubs()
      setClubs(response.clubs || [])
    } catch (error) {
      console.error('Error fetching clubs: ', error)
      toast.error('Failed to fetch clubs')
      setClubs([])
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

  useEffect(() => {
    fetchPlayers()
  }, [])

  const filteredPlayers = useMemo(() => {
    if (!debouncedSearch.trim()) return players // Return all players if no search term

    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return players.filter((player) => {
      return (
        // Safe string checks with optional chaining and fallbacks
        (player.name?.toLowerCase() || '').includes(lowerCaseSearch) ||
        (player.lastName?.toLowerCase() || '').includes(lowerCaseSearch) ||
        (player.birthdate?.toLowerCase() || '').includes(lowerCaseSearch) ||
        // Convert numbers to strings for searching
        (player.overall?.toString() || '').includes(lowerCaseSearch) ||
        (player.salary?.toString() || '').includes(lowerCaseSearch) ||
        // Safe club name searches
        (player.ownerClub?.name?.toLowerCase() || '').includes(lowerCaseSearch) ||
        (player.actualClub?.name?.toLowerCase() || '').includes(lowerCaseSearch) ||
        // Safe optional field searches
        (player.sofifaId?.toLowerCase() || '').includes(lowerCaseSearch) ||
        (player.transfermarktId?.toLowerCase() || '').includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, players])

  const handleEditPlayer = (player: Player) => {
    setSetelectedPlayer(player)
    setIsEditingModalOpen(true)
  }

  // const handleSavePlayer = async (playerId: string, updatedData: { name: string; lastName: string; birthdate: string; overall: number; salary: number; ownerClubId: string; sofifaId: string; transfermarktId: string; isKempesita: boolean; isActive: boolean;}) => {
  //     try {
  //         await PlayerService.updatePlayer(playerId, updatedData)
  //         toast.success('Player updated successfully')
  //         setEditingPlayer(null)
  //         fetchPlayers() // Refresh the list
  //     } catch (error: any) {
  //         console.error('Error updating player: ', error)
  //         toast.error(error instanceof Error ? error.message : 'An error occurred while updating the player.')
  //     }
  // }

  // // Bulk Create Function
  // const handleBulkCreate = async () => {
  //     if (!selectedFile) {
  //         toast.error('Please select a CSV file')
  //         return
  //     }

  //     try {
  //         setIsUploading(true)
  //         await PlayerService.bulkCreatePlayer(selectedFile)
  //         toast.success('Players created successfully from CSV')
  //         setSelectedFile(null)
  //         setShowCreateForm(false)
  //         fetchPlayers()
  //     } catch (error: any) {
  //         console.error('Error creating players:', error)
  //         toast.error(error instanceof Error ? error.message : 'An error occurred while creating players from CSV')
  //     } finally {
  //         setIsUploading(false)
  //     }
  // }

  const handleEditClose = () => {
    setSetelectedPlayer(null)
    setIsEditingModalOpen(false)
  }

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await PlayerService.deletePlayer(playerId)
      toast.success('Player deleted successfully')
      fetchPlayers() // Refresh the player list
    } catch (error) {
      console.error('Error deleting player:', error)
      toast.error('Failed to delete player')
    }
  }

  const columnHelper = createColumnHelper<Player>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Firstname" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('lastName', {
        header: (info) => <DefaultHeader info={info} name="Lastname" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('birthdate', {
        header: (info) => <DefaultHeader info={info} name="Birthdate" type="string" />,
        cell: (info) => new Date(info.getValue()).toLocaleDateString('en-GB'),
      }),
      columnHelper.accessor('overall', {
        header: (info) => <DefaultHeader info={info} name="Overall" type="number" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('salary', {
        header: (info) => <DefaultHeader info={info} name="Salary" type="number" />,
        cell: (info) => {
          const salary = info.getValue()
          if (salary === null || salary === undefined) return 'N/A'
          return salary.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        },
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name="Active" type="boolean" />,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Badge variant={row.original.isActive ? "default" : "destructive"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        )
      }),
      columnHelper.accessor('ownerClub', {
        header: (info) => <DefaultHeader info={info} name="Owner Club" type="string" />,
        // cell: (info) => info.getValue(),
        cell: ({ row }) => {
          const club: Club | null | undefined = row.getValue('ownerClub')
          const name = club?.name || 'No club'
          return <span>{name}</span>
        },
      }),
      columnHelper.accessor('actualClub', {
        header: (info) => <DefaultHeader info={info} name="Actual Club" type="string" />,
        // cell: (info) => info.getValue(),
        cell: ({ row }) => {
          const club: Club | null | undefined = row.getValue('actualClub')
          const name = club?.name || 'No club'
          return <span>{name}</span>
        },
      }),
      columnHelper.accessor('sofifaId', {
        header: (info) => <DefaultHeader info={info} name="Sofifa Id" type="number" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('transfermarktId', {
        header: (info) => <DefaultHeader info={info} name="Transfermarkt Id" type="number" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">Actions</span>,
        cell: ({ row }) => {
          const player = row.original

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
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditPlayer(player)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeletePlayer(player.id)}>
                    <Trash2 className="size-4 text-destructive" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [players, selectedPlayer, isEditingModalOpen]
  )
  return isLoadingPlayers ? (
    <PlayerTableSkeleton rows={8} />
  ) : (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
      <h1 className="text-2xl font-bold mb-10 mt-8">Players Management</h1>
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
        <CreatePlayerForm fetchPlayers={fetchPlayers} />
      </div>
      <DataTable<Player, any> columns={columns} data={filteredPlayers} />
      {selectedPlayer && (
        <EditPlayerForm
          clubs={clubs}
          player={selectedPlayer}
          onSuccess={fetchPlayers}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default PlayerManagement
