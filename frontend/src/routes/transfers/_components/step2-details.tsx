import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, ChevronDown, Settings2, X, Check } from 'lucide-react'
import type { Player } from '@/types'
import type { WizardStepProps, PlayerPaymentConfig, SeasonPeriod } from '@/types/transfer-wizard'
import { calculateBalance } from '@/types/transfer-wizard'
import { PlayerPaymentModal } from './player-payment-modal'

interface Step2Props extends WizardStepProps {
  sellerPlayers: Player[]
  buyerPlayers: Player[]
  activeSeasonNumber: number
}

function makeDefaultConfig(player: Player): PlayerPaymentConfig {
  return {
    playerId: player.id,
    playerName: player.fullName,
    playerPosition: undefined,
    overall: player.overall ?? null,
    salary: player.salary,
    isKempesita: player.isKempesita,
    valuationAmount: 0,
    paymentType: 'SINGLE',
    numberOfInstallments: 1,
    installments: [],
  }
}

interface PlayerDropdownProps {
  label: string
  icon: React.ReactNode
  players: Player[]
  selected: PlayerPaymentConfig[]
  onToggle: (player: Player) => void
  onEdit: (player: Player, config: PlayerPaymentConfig) => void
  onRemove: (playerId: string) => void
}

function PlayerDropdown({ label, icon, players, selected, onToggle, onEdit, onRemove }: PlayerDropdownProps) {
  const [open, setOpen] = useState(false)

  const isSelected = (id: string) => selected.some((p) => p.playerId === id)

  const triggerLabel =
    selected.length > 0
      ? `${selected.length} jugador${selected.length > 1 ? 'es' : ''} seleccionado${selected.length > 1 ? 's' : ''}`
      : 'Seleccioná jugadores...'

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        <span>{label}</span>
        {selected.length > 0 && (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {selected.length}
          </Badge>
        )}
      </div>

      {/* Dropdown trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-9 font-normal text-sm"
          >
            <span className={cn(!selected.length && 'text-muted-foreground')}>{triggerLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar jugador..." />
            <CommandList>
              <CommandEmpty>No hay jugadores disponibles</CommandEmpty>
              <CommandGroup>
                {players.map((player) => {
                  const checked = isSelected(player.id)
                  return (
                    <CommandItem key={player.id} value={player.fullName} onSelect={() => onToggle(player)}>
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
                            checked ? 'bg-primary border-primary' : 'border-muted-foreground/40',
                          )}
                        >
                          {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                        <span className="flex-1 text-sm truncate">{player.fullName}</span>
                        {player.isKempesita && (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                            Kempesita
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex-shrink-0 w-6 text-right">
                          {player.overall ?? '-'}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected players list */}
      {selected.length > 0 && (
        <div
          className="space-y-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: '180px' }}
        >
          {selected.map((config) => {
            const player = players.find((p) => p.id === config.playerId)
            const hasAmount = config.valuationAmount > 0
            return (
              <div
                key={config.playerId}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border text-sm"
              >
                <span className="flex-1 font-medium truncate">{config.playerName}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{config.overall ?? '-'}</span>
                {config.isKempesita && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                    Kempesita
                  </Badge>
                )}
                {hasAmount ? (
                  <span className="text-xs font-mono text-primary flex-shrink-0">
                    ${config.valuationAmount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 flex-shrink-0">Sin monto</span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => player && onEdit(player, config)}
                  title="Configurar pago"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(config.playerId)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Step2Details({
  wizardState,
  onUpdate,
  sellerPlayers,
  buyerPlayers,
  activeSeasonNumber,
}: Step2Props) {
  const { t } = useTranslation('transfers')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isAddingToSell, setIsAddingToSell] = useState(true)
  const [editingConfig, setEditingConfig] = useState<PlayerPaymentConfig | undefined>()

  // Handle period selection
  const handlePeriodChange = (period: SeasonPeriod) => {
    onUpdate((prev) => ({ ...prev, selectedPeriod: period }))
  }

  const handleToggleSeller = (player: Player) => {
    const alreadySelected = wizardState.playersToSell.some((p) => p.playerId === player.id)
    if (alreadySelected) {
      onUpdate((prev) => ({
        ...prev,
        playersToSell: prev.playersToSell.filter((p) => p.playerId !== player.id),
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        playersToSell: [...prev.playersToSell, makeDefaultConfig(player)],
      }))
    }
  }

  const handleToggleBuyer = (player: Player) => {
    const alreadySelected = wizardState.playersAsPayment.some((p) => p.playerId === player.id)
    if (alreadySelected) {
      onUpdate((prev) => ({
        ...prev,
        playersAsPayment: prev.playersAsPayment.filter((p) => p.playerId !== player.id),
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        playersAsPayment: [...prev.playersAsPayment, makeDefaultConfig(player)],
      }))
    }
  }

  const handleOpenModal = (player: Player, config: PlayerPaymentConfig, toSell: boolean) => {
    setSelectedPlayer(player)
    setIsAddingToSell(toSell)
    setEditingConfig(config)
    setModalOpen(true)
  }

  const handleSavePlayerConfig = (config: PlayerPaymentConfig) => {
    if (isAddingToSell) {
      onUpdate((prev) => ({
        ...prev,
        playersToSell: prev.playersToSell.map((p) => (p.playerId === config.playerId ? config : p)),
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        playersAsPayment: prev.playersAsPayment.map((p) => (p.playerId === config.playerId ? config : p)),
      }))
    }
  }

  const handleRemoveSeller = (playerId: string) => {
    onUpdate((prev) => ({
      ...prev,
      playersToSell: prev.playersToSell.filter((p) => p.playerId !== playerId),
    }))
  }

  const handleRemoveBuyer = (playerId: string) => {
    onUpdate((prev) => ({
      ...prev,
      playersAsPayment: prev.playersAsPayment.filter((p) => p.playerId !== playerId),
    }))
  }

  const balance = calculateBalance(wizardState.playersToSell, wizardState.playersAsPayment)

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`

  const PeriodButton = ({ period, label }: { period: SeasonPeriod; label: string }) => (
    <Button
      type="button"
      variant={wizardState.selectedPeriod === period ? 'default' : 'outline'}
      size="sm"
      className="h-7 px-3 text-xs"
      onClick={() => handlePeriodChange(period)}
    >
      {label}
    </Button>
  )

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{t('periodSelector.title', 'Periodo')}:</Label>
          <div className="flex items-center gap-1">
            <PeriodButton period="START" label={t('periodSelector.start', 'Inicio')} />
            <PeriodButton period="MID" label={t('periodSelector.mid', 'Mitad')} />
            <PeriodButton period="END" label={t('periodSelector.end', 'Final')} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">{t('labels.season', 'Temporada')}:</Label>
          <Badge variant="secondary" className="font-mono text-xs">
            T{activeSeasonNumber}
          </Badge>
        </div>
      </div>

      {/* Two-column player selection */}
      <div className="grid grid-cols-2 gap-4">
        <PlayerDropdown
          label={t('playersPanel.toSell', 'Jugadores a Vender')}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          players={sellerPlayers}
          selected={wizardState.playersToSell}
          onToggle={handleToggleSeller}
          onEdit={(player, config) => handleOpenModal(player, config, true)}
          onRemove={handleRemoveSeller}
        />
        <PlayerDropdown
          label={t('playersPanel.asPayment', 'A recibir')}
          icon={<TrendingDown className="h-4 w-4 text-blue-500" />}
          players={buyerPlayers}
          selected={wizardState.playersAsPayment}
          onToggle={handleToggleBuyer}
          onEdit={(player, config) => handleOpenModal(player, config, false)}
          onRemove={handleRemoveBuyer}
        />
      </div>

      {/* Compact balance bar — pinned to bottom */}
      <div className="mt-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border text-sm flex-wrap">
        <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
        <span className="text-muted-foreground text-xs">{t('balance.selling', 'Vendo')}:</span>
        <span className="font-mono font-semibold text-green-600 text-xs">{fmt(balance.selling)}</span>
        <span className="text-muted-foreground mx-1 text-xs">—</span>
        <TrendingDown className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
        <span className="text-muted-foreground text-xs">{t('balance.receiving', 'Recibo')}:</span>
        <span className="font-mono font-semibold text-blue-600 text-xs">{fmt(balance.receiving)}</span>
        <span className="text-muted-foreground mx-1 text-xs">=</span>
        <span
          className={cn(
            'font-mono font-bold text-xs',
            balance.balance > 0
              ? 'text-green-600'
              : balance.balance < 0
                ? 'text-red-500'
                : 'text-muted-foreground',
          )}
        >
          {balance.balance > 0 ? '+' : ''}
          {fmt(balance.balance)}
        </span>
      </div>

      {/* Payment Modal */}
      <PlayerPaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        player={selectedPlayer}
        onSave={handleSavePlayerConfig}
        activeSeasonNumber={activeSeasonNumber}
        selectedPeriod={wizardState.selectedPeriod}
        existingConfig={editingConfig}
      />
    </div>
  )
}
