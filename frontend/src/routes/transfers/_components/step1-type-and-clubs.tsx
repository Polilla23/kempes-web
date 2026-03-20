import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  ShoppingCart,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Gavel,
  UserPlus,
  Building2,
  ChevronsUpDown,
  Check,
  Search,
} from 'lucide-react'
import type {
  TransferWizardState,
  TransferTypeOption,
  WizardStepProps,
  UserTransferRole,
} from '@/types/transfer-wizard'
import { TRANSFER_TYPE_CONFIGS } from '@/types/transfer-wizard'
import { ClubService } from '@/services/club.service'
import type { Club } from '@/types'

const TRANSFER_TYPE_ICONS: Record<TransferTypeOption, React.ElementType> = {
  PURCHASE: ShoppingCart,
  SALE: DollarSign,
  LOAN_IN: ArrowDownLeft,
  LOAN_OUT: ArrowUpRight,
  AUCTION: Gavel,
  FREE_AGENT: UserPlus,
  INACTIVE_STATUS: Building2,
}

const TRANSFER_TYPES: TransferTypeOption[] = [
  'PURCHASE',
  'SALE',
  'LOAN_IN',
  'LOAN_OUT',
  'AUCTION',
  'FREE_AGENT',
]

const TYPE_TO_KEY: Record<TransferTypeOption, string> = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  LOAN_IN: 'loanIn',
  LOAN_OUT: 'loanOut',
  AUCTION: 'auction',
  FREE_AGENT: 'freeAgent',
  INACTIVE_STATUS: 'inactive',
}

interface Step1Props extends Omit<WizardStepProps, 'onBack'> {
  userClubId: string | null
  userClubName: string | null
  userClubLogo: string | null
}

function ClubAvatar({
  src,
  name,
  size = 'md',
}: {
  src?: string | null
  name: string
  size?: 'sm' | 'md'
}) {
  const sz = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn(sz, 'rounded-full object-cover flex-shrink-0')}
    />
  ) : (
    <div
      className={cn(
        sz,
        'rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0',
      )}
    >
      <Building2 className="h-4 w-4 text-primary" />
    </div>
  )
}

export function Step1TypeAndClubs({
  wizardState,
  onUpdate,
  userClubId,
  userClubName,
  userClubLogo,
}: Step1Props) {
  const { t } = useTranslation('transfers')
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(false)
  const [comboOpen, setComboOpen] = useState(false)
  const [clubSearch, setClubSearch] = useState('')

  const filteredClubs = useMemo(() => {
    if (!clubSearch.trim()) return clubs
    const q = clubSearch.toLowerCase()
    return clubs.filter((c) => c.name.toLowerCase().includes(q))
  }, [clubs, clubSearch])

  useEffect(() => {
    if (!wizardState.transferType) return
    const config = TRANSFER_TYPE_CONFIGS[wizardState.transferType]
    if (!config.requiresOtherClub) return
    if (clubs.length > 0) return

    const fetchClubs = async () => {
      setIsLoadingClubs(true)
      try {
        const response = await ClubService.getClubs()
        setClubs(response.clubs.filter((c) => c.id !== userClubId))
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setIsLoadingClubs(false)
      }
    }
    fetchClubs()
  }, [wizardState.transferType, userClubId, clubs.length])

  const handleSelectType = (type: TransferTypeOption) => {
    const config = TRANSFER_TYPE_CONFIGS[type]
    const userRole: UserTransferRole = config.userRole

    let sellerClubId = null
    let sellerClubName = null
    let sellerClubLogo = null
    let buyerClubId = null
    let buyerClubName = null
    let buyerClubLogo = null

    if (userRole === 'SELLER') {
      sellerClubId = userClubId
      sellerClubName = userClubName
      sellerClubLogo = userClubLogo
    } else {
      buyerClubId = userClubId
      buyerClubName = userClubName
      buyerClubLogo = userClubLogo
    }

    onUpdate((prev) => ({
      ...prev,
      transferType: type,
      userRole,
      sellerClubId,
      sellerClubName,
      sellerClubLogo,
      buyerClubId,
      buyerClubName,
      buyerClubLogo,
      playersToSell: [],
      playersAsPayment: [],
      loanDetails:
        type === 'LOAN_IN' || type === 'LOAN_OUT'
          ? { durationHalves: 2, loanFee: 0, salaryPercentage: 50 }
          : null,
    }))
  }

  const handleComboOpenChange = (open: boolean) => {
    setComboOpen(open)
    if (!open) setClubSearch('')
  }

  const handleSelectOtherClub = (club: Club) => {
    if (wizardState.userRole === 'SELLER') {
      onUpdate((prev) => ({
        ...prev,
        buyerClubId: club.id,
        buyerClubName: club.name,
        buyerClubLogo: club.logo || null,
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        sellerClubId: club.id,
        sellerClubName: club.name,
        sellerClubLogo: club.logo || null,
      }))
    }
    setComboOpen(false)
  }

  const config = wizardState.transferType
    ? TRANSFER_TYPE_CONFIGS[wizardState.transferType]
    : null
  const isFreeAgent = wizardState.transferType === 'FREE_AGENT'
  const isInactive = wizardState.transferType === 'INACTIVE_STATUS'

  // Other club data (right side)
  const otherClub =
    wizardState.userRole === 'SELLER'
      ? {
          id: wizardState.buyerClubId,
          name: wizardState.buyerClubName,
          logo: wizardState.buyerClubLogo,
        }
      : {
          id: wizardState.sellerClubId,
          name: wizardState.sellerClubName,
          logo: wizardState.sellerClubLogo,
        }

  const myRoleLabel =
    wizardState.userRole === 'SELLER'
      ? t('wizard.roles.seller', 'Vendedor')
      : t('wizard.roles.buyer', 'Comprador')

  const otherRoleLabel =
    wizardState.userRole === 'SELLER'
      ? t('wizard.roles.buyer', 'Comprador')
      : t('wizard.roles.seller', 'Vendedor')

  return (
    <div className="space-y-6">
      {/* Transfer Type Dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t('wizard.steps.typeAndClubs.typeLabel', 'Tipo de transferencia')}
        </Label>
        <Select
          value={wizardState.transferType ?? ''}
          onValueChange={(v) => handleSelectType(v as TransferTypeOption)}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t(
                'wizard.steps.typeAndClubs.typePlaceholder',
                'Seleccioná el tipo de operación',
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {TRANSFER_TYPES.map((type) => {
              const Icon = TRANSFER_TYPE_ICONS[type]
              const key = TYPE_TO_KEY[type]
              return (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{t(`typeCards.${key}.title`)}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {config && (
          <p className="text-xs text-muted-foreground">
            {t(`typeCards.${TYPE_TO_KEY[wizardState.transferType!]}.description`)}
          </p>
        )}
      </div>

      {/* Clubs — always visible, fixed layout */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t('clubsInvolved.title', 'Clubes involucrados')}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Left: My club (always fixed) */}
          <div className="space-y-1.5">
            <div className="h-5 flex items-center">
              {wizardState.transferType && (
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  {myRoleLabel}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border h-[62px]">
              <ClubAvatar src={userClubLogo} name={userClubName ?? ''} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userClubName}</p>
                <p className="text-xs text-muted-foreground">
                  {t('clubsInvolved.yourClub', 'Tu club')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Other club */}
          <div className="space-y-1.5">
            <div className="h-5 flex items-center">
              {wizardState.transferType && (
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  {isFreeAgent
                    ? t('wizard.roles.freeAgent', 'Sin club')
                    : isInactive
                      ? '—'
                      : otherRoleLabel}
                </Badge>
              )}
            </div>

            {!wizardState.transferType ? (
              /* No type selected yet */
              <div className="h-[62px] rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground text-center px-3">
                {t(
                  'wizard.steps.typeAndClubs.clubPlaceholder',
                  'Elegí un tipo de operación',
                )}
              </div>
            ) : isFreeAgent ? (
              /* FREE_AGENT: right side is "Sin club" */
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border h-[62px]">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t('wizard.roles.freeAgent', 'Sin club')}
                  </p>
                  <p className="text-xs text-muted-foreground">Agente libre</p>
                </div>
              </div>
            ) : isInactive ? (
              /* INACTIVE_STATUS: no other club */
              <div className="h-[62px] rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                {t('wizard.roles.noOtherClub', 'No aplica')}
              </div>
            ) : (
              /* Searchable combobox — native scroll to bypass react-remove-scroll */
              <Popover open={comboOpen} onOpenChange={handleComboOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    className="w-full h-[62px] px-3 justify-between font-normal"
                  >
                    {otherClub.id ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <ClubAvatar
                          src={otherClub.logo}
                          name={otherClub.name ?? ''}
                          size="sm"
                        />
                        <span className="truncate text-sm font-medium">
                          {otherClub.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {t(
                          'wizard.steps.typeAndClubs.clubSearchPlaceholder',
                          'Buscar club...',
                        )}
                      </span>
                    )}
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <div className="flex flex-col">
                    {/* Search input */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input
                        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                        placeholder={t(
                          'wizard.steps.typeAndClubs.clubSearchPlaceholder',
                          'Buscar club...',
                        )}
                        value={clubSearch}
                        onChange={(e) => setClubSearch(e.target.value)}
                      />
                    </div>
                    {/* Scrollable list — onWheel stops propagation to Dialog */}
                    <div
                      className="overflow-y-auto py-1"
                      style={{ maxHeight: '200px' }}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {isLoadingClubs ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
                      ) : filteredClubs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t('wizard.steps.typeAndClubs.noClubs', 'No se encontraron clubes')}
                        </p>
                      ) : (
                        filteredClubs.map((club) => (
                          <button
                            key={club.id}
                            type="button"
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-default text-left',
                              otherClub.id === club.id && 'bg-accent',
                            )}
                            onClick={() => handleSelectOtherClub(club)}
                          >
                            <ClubAvatar src={club.logo} name={club.name} size="sm" />
                            <span className="flex-1 truncate">{club.name}</span>
                            {otherClub.id === club.id && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
