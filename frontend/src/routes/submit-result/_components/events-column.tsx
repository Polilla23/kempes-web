import { Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
}

export function EventsColumn({
  teamName,
  teamScore,
  events,
  onEventsChange,
  players,
  eventTypes,
  goalTypeId,
}: EventsColumnProps) {
  const { t } = useTranslation('submitResult')

  const addEvent = () => {
    const newEvent: EventRow = {
      id: crypto.randomUUID(),
      typeId: '',
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
      events.map((e) => (e.id === eventId ? { ...e, [field]: value } : e))
    )
  }

  // Calculate total goals from events
  const totalGoalEvents = events
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)

  const goalsMatch = totalGoalEvents === teamScore
  const showGoalError = !goalsMatch && events.length > 0

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          {t('events.homeTitle', { teamName })}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEvent}
          className="gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          {t('events.addEvent')}
        </Button>
      </div>

      {/* Event rows */}
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border border-border"
          >
            {/* Event type select */}
            <Select
              value={event.typeId}
              onValueChange={(value) => updateEvent(event.id, 'typeId', value)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder={t('events.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <span className="flex items-center gap-1">
                      <span>{type.icon}</span>
                      <span>{type.displayName}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Player combobox */}
            <div className="flex-1 min-w-0">
              <PlayerCombobox
                players={players}
                value={event.playerId || null}
                onSelect={(playerId) => updateEvent(event.id, 'playerId', playerId)}
                placeholder={t('events.selectPlayer')}
                searchPlaceholder={t('events.selectPlayer')}
                emptyMessage={t('events.noPlayers')}
                className="h-8 text-xs"
              />
            </div>

            {/* Quantity +/- */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() =>
                  updateEvent(event.id, 'quantity', Math.max(1, event.quantity - 1))
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-bold tabular-nums">
                {event.quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => updateEvent(event.id, 'quantity', event.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeEvent(event.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Goal validation message */}
      {showGoalError && (
        <p className="text-xs text-destructive">
          {t('events.goalsMismatch', {
            teamName,
            goalEvents: totalGoalEvents,
            score: teamScore,
          })}
        </p>
      )}

      {events.length === 0 && teamScore > 0 && (
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
