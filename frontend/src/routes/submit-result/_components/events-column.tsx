import { Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PlayerCombobox, type PlayerOption } from '@/components/ui/player-combobox'
import { useTranslation } from 'react-i18next'

export interface EventRow {
  id: string
  typeId: string
  playerId: string
  quantity: number
}

export interface EventTypeOption {
  id: string
  name: string
  displayName: string
  icon: string
}

interface EventsColumnProps {
  teamName: string
  teamScore: number
  events: EventRow[]
  onEventsChange: (events: EventRow[]) => void
  players: PlayerOption[]
  eventTypes: EventTypeOption[]
  goalTypeId: string | null
  redCardTypeId: string | null
  injuryTypeId: string | null
  ownGoals: number
  onOwnGoalsChange: (n: number) => void
}

export function EventsColumn({
  teamName,
  teamScore,
  events,
  onEventsChange,
  players,
  eventTypes,
  goalTypeId,
  redCardTypeId,
  injuryTypeId,
  ownGoals,
  onOwnGoalsChange,
}: EventsColumnProps) {
  const { t } = useTranslation('submitResult')

  const addEvent = (typeId: string) => {
    const newEvent: EventRow = {
      id: crypto.randomUUID(),
      typeId,
      playerId: '',
      quantity: 1,
    }
    onEventsChange([...events, newEvent])
  }

  const removeEvent = (eventId: string) => {
    onEventsChange(events.filter((e) => e.id !== eventId))
  }

  const updateEvent = (eventId: string, field: keyof EventRow, value: string | number) => {
    onEventsChange(
      events.map((e) => {
        if (e.id !== eventId) return e

        // When changing event type, force quantity=1 for red cards and injuries
        if (field === 'typeId') {
          const isQuantityLocked = value === redCardTypeId || value === injuryTypeId
          return { ...e, typeId: value as string, quantity: isQuantityLocked ? 1 : e.quantity }
        }

        return { ...e, [field]: value }
      })
    )
  }

  // Get players already assigned to a specific event type in other rows
  const getHiddenPlayerIds = (currentEventId: string, currentTypeId: string) => {
    if (!currentTypeId) return []
    return events
      .filter((e) => e.id !== currentEventId && e.typeId === currentTypeId && e.playerId)
      .map((e) => e.playerId)
  }

  // Calculate total goals from events + own goals
  const totalGoalEvents = events
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)

  const totalGoals = totalGoalEvents + ownGoals
  const goalsMatch = totalGoals === teamScore
  const showGoalError = !goalsMatch && (events.length > 0 || ownGoals > 0)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          {t('events.homeTitle', { teamName })}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('events.addEvent')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {eventTypes.map((type) => (
              <DropdownMenuItem key={type.id} onClick={() => addEvent(type.id)}>
                <span className="mr-2">{type.icon}</span>
                {type.displayName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Event rows - compact single line each */}
      <div className="space-y-1.5">
        {events.map((event) => {
          const isQuantityLocked = event.typeId === redCardTypeId || event.typeId === injuryTypeId
          const hiddenIds = getHiddenPlayerIds(event.id, event.typeId)
          const availablePlayers = players.filter((p) => !hiddenIds.includes(p.id))
          const eventType = eventTypes.find((et) => et.id === event.typeId)

          return (
            <div
              key={event.id}
              className="flex items-center gap-1.5 p-1.5 bg-secondary/50 rounded-lg border border-border"
            >
              {/* Type select - icon only */}
              <Select
                value={event.typeId}
                onValueChange={(value) => updateEvent(event.id, 'typeId', value)}
              >
                <SelectTrigger className="h-8 text-xs px-2 gap-0 shrink-0" size="sm">
                  {eventType ? (
                    <span>{eventType.icon}</span>
                  ) : (
                    <SelectValue placeholder="?" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-1.5">
                        <span>{type.icon}</span>
                        <span>{type.displayName}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Player combobox - takes remaining space */}
              <div className="flex-1 min-w-0">
                <PlayerCombobox
                  players={availablePlayers}
                  value={event.playerId || null}
                  onSelect={(playerId) => updateEvent(event.id, 'playerId', playerId)}
                  placeholder={t('events.selectPlayer')}
                  searchPlaceholder={t('events.selectPlayer')}
                  emptyMessage={t('events.noPlayers')}
                  className="h-8 text-xs"
                />
              </div>

              {/* Quantity with ± buttons (only for goals) */}
              {!isQuantityLocked && (
                <div className="flex items-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    className="rounded-full"
                    onClick={() =>
                      updateEvent(event.id, 'quantity', Math.max(1, event.quantity - 1))
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={20}
                    value={event.quantity}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10)
                      if (!isNaN(parsed) && parsed >= 1) {
                        updateEvent(event.id, 'quantity', Math.min(20, parsed))
                      }
                    }}
                    className="w-6 h-6 text-center text-xs font-bold tabular-nums bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    className="rounded-full"
                    onClick={() => updateEvent(event.id, 'quantity', event.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Delete button */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeEvent(event.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Own goals control */}
      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-dashed border-border">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>🥅</span>
          <span>{t('events.ownGoals')}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="rounded-full"
            onClick={() => onOwnGoalsChange(Math.max(0, ownGoals - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={ownGoals}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10)
              onOwnGoalsChange(isNaN(parsed) ? 0 : Math.max(0, Math.min(20, parsed)))
            }}
            className="w-8 h-6 text-center text-xs font-bold tabular-nums bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="rounded-full"
            onClick={() => onOwnGoalsChange(ownGoals + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Goal validation message */}
      {showGoalError && (
        <p className="text-xs text-destructive">
          {t('events.goalsMismatch', {
            teamName,
            goalEvents: totalGoals,
            score: teamScore,
          })}
        </p>
      )}

      {events.length === 0 && ownGoals === 0 && teamScore > 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          {t('events.goalsMismatch', {
            teamName,
            goalEvents: 0,
            score: teamScore,
          })}
        </p>
      )}
    </div>
  )
}
