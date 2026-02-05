import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Search,
  Plus,
  X,
  ArrowRightLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { Player } from '@/types'
import type {
  TransferWizardState,
  WizardStepProps,
  PlayerPaymentConfig,
  SeasonPeriod,
} from '@/types/transfer-wizard'
import { calculateBalance } from '@/types/transfer-wizard'
import { PlayerPaymentModal } from './player-payment-modal'

interface Step2Props extends WizardStepProps {
  sellerPlayers: Player[]
  buyerPlayers: Player[]
  activeSeasonNumber: number
}

export function Step2Details({
  wizardState,
  onUpdate,
  onNext,
  onBack,
  sellerPlayers,
  buyerPlayers,
  activeSeasonNumber,
}: Step2Props) {
  const { t } = useTranslation('transfers')

  // Search states
  const [searchSeller, setSearchSeller] = useState('')
  const [searchBuyer, setSearchBuyer] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isAddingToSell, setIsAddingToSell] = useState(true)
  const [editingConfig, setEditingConfig] = useState<PlayerPaymentConfig | undefined>()

  // Filter players by search
  const filteredSellerPlayers = useMemo(() => {
    return sellerPlayers.filter(
      (p) =>
        p.isActive &&
        (p.name.toLowerCase().includes(searchSeller.toLowerCase()) ||
          p.lastName.toLowerCase().includes(searchSeller.toLowerCase()))
    )
  }, [sellerPlayers, searchSeller])

  const filteredBuyerPlayers = useMemo(() => {
    return buyerPlayers.filter(
      (p) =>
        p.isActive &&
        (p.name.toLowerCase().includes(searchBuyer.toLowerCase()) ||
          p.lastName.toLowerCase().includes(searchBuyer.toLowerCase()))
    )
  }, [buyerPlayers, searchBuyer])

  // Check if player is already selected
  const isPlayerSelectedToSell = (playerId: string) =>
    wizardState.playersToSell.some((p) => p.playerId === playerId)

  const isPlayerSelectedAsPayment = (playerId: string) =>
    wizardState.playersAsPayment.some((p) => p.playerId === playerId)

  // Handle period selection
  const handlePeriodChange = (period: SeasonPeriod) => {
    onUpdate((prev) => ({ ...prev, selectedPeriod: period }))
  }

  // Open modal for adding/editing player
  const handleOpenModal = (player: Player, toSell: boolean) => {
    setSelectedPlayer(player)
    setIsAddingToSell(toSell)

    // Check if editing existing
    const existingConfig = toSell
      ? wizardState.playersToSell.find((p) => p.playerId === player.id)
      : wizardState.playersAsPayment.find((p) => p.playerId === player.id)

    setEditingConfig(existingConfig)
    setModalOpen(true)
  }

  // Handle save from modal
  const handleSavePlayerConfig = (config: PlayerPaymentConfig) => {
    if (isAddingToSell) {
      // Adding/editing player to sell
      onUpdate((prev) => {
        const existing = prev.playersToSell.findIndex(
          (p) => p.playerId === config.playerId
        )
        const newList =
          existing >= 0
            ? prev.playersToSell.map((p, i) => (i === existing ? config : p))
            : [...prev.playersToSell, config]
        return { ...prev, playersToSell: newList }
      })
    } else {
      // Adding/editing player as payment
      onUpdate((prev) => {
        const existing = prev.playersAsPayment.findIndex(
          (p) => p.playerId === config.playerId
        )
        const newList =
          existing >= 0
            ? prev.playersAsPayment.map((p, i) => (i === existing ? config : p))
            : [...prev.playersAsPayment, config]
        return { ...prev, playersAsPayment: newList }
      })
    }
  }

  // Remove player from list
  const handleRemovePlayer = (playerId: string, fromSell: boolean) => {
    if (fromSell) {
      onUpdate((prev) => ({
        ...prev,
        playersToSell: prev.playersToSell.filter((p) => p.playerId !== playerId),
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        playersAsPayment: prev.playersAsPayment.filter((p) => p.playerId !== playerId),
      }))
    }
  }

  // Calculate balance
  const balance = calculateBalance(wizardState.playersToSell, wizardState.playersAsPayment)

  // Period selector component
  const PeriodButton = ({
    period,
    label,
  }: {
    period: SeasonPeriod
    label: string
  }) => (
    <Button
      type="button"
      variant={wizardState.selectedPeriod === period ? 'default' : 'outline'}
      size="sm"
      onClick={() => handlePeriodChange(period)}
    >
      {label}
    </Button>
  )

  // Render player card in list
  const renderPlayerCard = (player: Player, toSell: boolean) => {
    const isSelected = toSell
      ? isPlayerSelectedToSell(player.id)
      : isPlayerSelectedAsPayment(player.id)

    const config = toSell
      ? wizardState.playersToSell.find((p) => p.playerId === player.id)
      : wizardState.playersAsPayment.find((p) => p.playerId === player.id)

    return (
      <div
        key={player.id}
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border transition-all',
          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium">
              {player.name} {player.lastName}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>OVR: {player.overall || '-'}</span>
              {player.isKempesita && (
                <Badge variant="secondary" className="text-xs">
                  K
                </Badge>
              )}
              {player.position && <span>- {player.position}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && config && (
            <Badge variant="outline" className="font-mono">
              ${config.valuationAmount.toLocaleString()}
            </Badge>
          )}
          <Button
            size="sm"
            variant={isSelected ? 'secondary' : 'outline'}
            onClick={() => handleOpenModal(player, toSell)}
          >
            {isSelected ? (
              <span className="text-xs">{t('edit.title', 'Editar')}</span>
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          {isSelected && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemovePlayer(player.id, toSell)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Render selected player chip
  const renderSelectedChip = (config: PlayerPaymentConfig, fromSell: boolean) => (
    <div
      key={config.playerId}
      className="flex items-center gap-2 p-2 rounded-lg bg-muted"
    >
      <div className="flex-1">
        <span className="text-sm font-medium">
          {config.playerName} {config.playerLastName}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>OVR: {config.overall || '-'}</span>
          <span className="font-mono">${config.valuationAmount.toLocaleString()}</span>
          {config.paymentType === 'INSTALLMENTS' && (
            <Badge variant="outline" className="text-xs">
              {config.numberOfInstallments} cuotas
            </Badge>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const player = fromSell
            ? sellerPlayers.find((p) => p.id === config.playerId)
            : buyerPlayers.find((p) => p.id === config.playerId)
          if (player) handleOpenModal(player, fromSell)
        }}
      >
        <span className="text-xs">{t('edit.title', 'Editar')}</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleRemovePlayer(config.playerId, fromSell)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with clubs */}
      <div className="flex items-center justify-center gap-6 py-4 bg-muted/30 rounded-lg">
        {/* Seller club */}
        <div className="flex items-center gap-3">
          {wizardState.sellerClubLogo ? (
            <img
              src={wizardState.sellerClubLogo}
              alt={wizardState.sellerClubName || ''}
              className="h-12 w-12 rounded-full object-cover border-2 border-background shadow"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          )}
          <span className="font-semibold">{wizardState.sellerClubName}</span>
        </div>

        {/* Arrow */}
        <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />

        {/* Buyer club */}
        <div className="flex items-center gap-3">
          <span className="font-semibold">{wizardState.buyerClubName}</span>
          {wizardState.buyerClubLogo ? (
            <img
              src={wizardState.buyerClubLogo}
              alt={wizardState.buyerClubName || ''}
              className="h-12 w-12 rounded-full object-cover border-2 border-background shadow"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Period selector and season */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">
            {t('periodSelector.title', 'Periodo')}:
          </Label>
          <div className="flex items-center gap-2">
            <PeriodButton period="START" label={t('periodSelector.start', 'Inicio')} />
            <PeriodButton period="MID" label={t('periodSelector.mid', 'Mitad')} />
            <PeriodButton period="END" label={t('periodSelector.end', 'Final')} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t('labels.season', 'Temporada')}:
          </Label>
          <Badge variant="secondary" className="font-mono">
            T{activeSeasonNumber}
          </Badge>
        </div>
      </div>

      {/* Two columns: Seller players and Buyer players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seller's players (to sell) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t('playersPanel.toSell', 'Jugadores a Vender')}
              {wizardState.playersToSell.length > 0 && (
                <Badge variant="secondary">{wizardState.playersToSell.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected players */}
            {wizardState.playersToSell.length > 0 && (
              <div className="space-y-2 mb-4">
                {wizardState.playersToSell.map((config) =>
                  renderSelectedChip(config, true)
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('playersPanel.searchPlayer', 'Buscar jugador...')}
                value={searchSeller}
                onChange={(e) => setSearchSeller(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Players list */}
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {filteredSellerPlayers.length > 0 ? (
                  filteredSellerPlayers.map((player) =>
                    renderPlayerCard(player, true)
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('playerSelection.noPlayers', 'No hay jugadores disponibles')}
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Buyer's players (as payment) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              {t('playersPanel.asPayment', 'Jugadores como Parte de Pago')}
              {wizardState.playersAsPayment.length > 0 && (
                <Badge variant="secondary">{wizardState.playersAsPayment.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected players */}
            {wizardState.playersAsPayment.length > 0 && (
              <div className="space-y-2 mb-4">
                {wizardState.playersAsPayment.map((config) =>
                  renderSelectedChip(config, false)
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('playersPanel.searchPlayer', 'Buscar jugador...')}
                value={searchBuyer}
                onChange={(e) => setSearchBuyer(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Players list */}
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {filteredBuyerPlayers.length > 0 ? (
                  filteredBuyerPlayers.map((player) =>
                    renderPlayerCard(player, false)
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('playerSelection.noPlayers', 'No hay jugadores disponibles')}
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Balance card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Selling total */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">
                {t('balance.selling', 'Vendo')}:
              </span>
              <span className="font-mono font-semibold text-green-600">
                ${balance.selling.toLocaleString()}
              </span>
            </div>

            <Minus className="h-4 w-4 text-muted-foreground" />

            {/* Receiving total */}
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                {t('balance.receiving', 'Recibo')}:
              </span>
              <span className="font-mono font-semibold text-blue-600">
                ${balance.receiving.toLocaleString()}
              </span>
            </div>

            <span className="text-muted-foreground">=</span>

            {/* Balance */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                balance.balance > 0
                  ? 'bg-green-100 text-green-700'
                  : balance.balance < 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
              )}
            >
              <span className="text-sm font-medium">
                {t('balance.balance', 'Balance')}:
              </span>
              <span className="font-mono font-bold">
                {balance.balance > 0 ? '+' : ''}${balance.balance.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
