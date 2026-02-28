import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface PlayerOption {
  id: string
  name: string
  lastName: string
  overall?: number | null
}

export interface PlayerGroup {
  label: string
  players: PlayerOption[]
}

interface PlayerComboboxProps {
  players: PlayerOption[]
  groups?: PlayerGroup[]
  value: string | null
  onSelect: (playerId: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function PlayerCombobox({
  players,
  groups,
  value,
  onSelect,
  placeholder = 'Seleccionar jugador...',
  searchPlaceholder = 'Buscar jugador...',
  emptyMessage = 'No se encontraron jugadores.',
  disabled = false,
  className,
}: PlayerComboboxProps) {
  const [open, setOpen] = useState(false)

  const allPlayers = groups ? groups.flatMap((g) => g.players) : players
  const selectedPlayer = allPlayers.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className="truncate">
            {selectedPlayer
              ? `${selectedPlayer.name.charAt(0)}. ${selectedPlayer.lastName}`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {groups ? (
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.players.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={`${player.name} ${player.lastName}`}
                      onSelect={() => {
                        onSelect(player.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === player.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="flex-1">
                        {player.name} {player.lastName}
                      </span>
                      {player.overall != null && (
                        <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {player.overall}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {players.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={`${player.name} ${player.lastName}`}
                    onSelect={() => {
                      onSelect(player.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === player.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="flex-1">
                      {player.name} {player.lastName}
                    </span>
                    {player.overall != null && (
                      <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {player.overall}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
