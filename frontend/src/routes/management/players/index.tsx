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
import { Badge } from '@/components/ui/badge'
import { PlayerService } from '@/services/player.service'
import type { Club, Player } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useCallback } from 'react'
import CreatePlayerForm from './create-player-form'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import EditPlayerForm from './edit-player-form'
import { ClubService } from '@/services/club.service'

export const Route = createFileRoute('/management/players/')({
  component: PlayerManagement,
})

function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedPlayer, setSetelectedPlayer] = useState<Player | null>(null)

  // Fetch players
  const fetchPlayers = useCallback(async () => {
    try {
      setIsLoadingPlayers(true)
      const players = await PlayerService.getPlayers()
      console.log('PLAYERS DATA: ', players)
      setPlayers(players || [])
    } catch (error) {
      console.error('Error fetching players: ', error)
      toast.error('Failed to fetch players')
      setPlayers([])
    } finally {
      setIsLoadingPlayers(false)
    }
  }, [])

  const fetchClubs = useCallback(async () => {
    try {
      const clubs = await ClubService.getClubs()
      setClubs(clubs || [])
    } catch (error) {
      console.error('Error fetching clubs: ', error)
      toast.error('Failed to fetch clubs')
      setClubs([])
    }
  }, [])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // 0.5 second delay

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

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
  }

  const handleDeletePlayer = useCallback(
    async (playerId: string) => {
      try {
        await PlayerService.deletePlayer(playerId)
        toast.success('Player deleted successfully')
        fetchPlayers() // Refresh the player list
      } catch (error) {
        console.error('Error deleting player:', error)
        toast.error('Failed to delete player')
      }
    },
    [fetchPlayers]
  )

  const columnHelper = createColumnHelper<Player>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
        cell: ({ row }) => {
          const player = row.original
          const fullName = `${player.name} ${player.lastName}`

          return (
            <div className="flex flex-col">
              <span className="font-semibold">{fullName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(player.birthdate).toLocaleDateString('en-GB')}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('overall', {
        header: () => (
          <div className="flex justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall</span>
          </div>
        ),
        cell: ({ row }) => {
          const overall = row.getValue('overall') as number
          const color =
            overall >= 80
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : overall >= 70
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'

          return (
            <div className="flex justify-center">
              <Badge variant="outline" className={`font-semibold ${color}`}>
                {overall}
              </Badge>
            </div>
          )
        },
      }),
      columnHelper.accessor('salary', {
        header: (info) => <DefaultHeader info={info} name="Salary" type="number" />,
        cell: (info) => {
          const salary = info.getValue()
          return (
            <span className="font-medium">
              {salary.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          )
        },
      }),
      columnHelper.accessor('ownerClub', {
        header: (info) => <DefaultHeader info={info} name="Owner Club" type="string" />,
        cell: ({ row }) => {
          const club: Club | null | undefined = row.getValue('ownerClub')

          if (!club) {
            return <span className="text-muted-foreground italic">No club</span>
          }

          return (
            <div className="flex items-center gap-2">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={`${club.name} logo`}
                  className="h-7 w-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-medium">{club.name}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('actualClub', {
        header: (info) => <DefaultHeader info={info} name="Current Club" type="string" />,
        cell: ({ row }) => {
          const club: Club | null | undefined = row.getValue('actualClub')
          const ownerClub: Club | null | undefined = row.getValue('ownerClub')

          if (!club) {
            return <span className="text-muted-foreground italic">No club</span>
          }

          const isOnLoan = ownerClub && ownerClub.id !== club.id

          return (
            <div className="flex items-center gap-2">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={`${club.name} logo`}
                  className="h-7 w-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{club.name}</span>
                {isOnLoan && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    On Loan
                  </Badge>
                )}
              </div>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const player = row.original

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
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleEditPlayer(player)}>
                    <Pencil className="size-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDeletePlayer(player.id)}
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
    [columnHelper, handleDeletePlayer]
  )
  return isLoadingPlayers ? (
    <PlayerTableSkeleton rows={8} />
  ) : (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Players Management</h1>
        <p className="text-muted-foreground">
          Manage your players, track their stats, and monitor loan status
        </p>
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
            placeholder="Search players..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
