import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ShoppingCart,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Gavel,
  UserPlus,
  UserX,
  Building2,
  Search,
  Check,
} from 'lucide-react'
import type {
  TransferWizardState,
  TransferTypeOption,
  WizardStepProps,
  UserTransferRole,
} from '@/types/transfer-wizard'
import { TRANSFER_TYPE_CONFIGS, TRANSFER_TYPE_COLORS } from '@/types/transfer-wizard'
import { ClubService } from '@/services/club.service'
import type { Club } from '@/types'

// Icon mapping for transfer types
const TRANSFER_TYPE_ICONS: Record<TransferTypeOption, React.ElementType> = {
  PURCHASE: ShoppingCart,
  SALE: DollarSign,
  LOAN_IN: ArrowDownLeft,
  LOAN_OUT: ArrowUpRight,
  AUCTION: Gavel,
  FREE_AGENT: UserPlus,
  INACTIVE_STATUS: UserX,
}

// All available transfer types (excluding INACTIVE_STATUS for now as per common usage)
const TRANSFER_TYPES: TransferTypeOption[] = [
  'PURCHASE',
  'SALE',
  'LOAN_IN',
  'LOAN_OUT',
  'AUCTION',
  'FREE_AGENT',
]

// Translation key mapping
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

export function Step1TypeAndClubs({
  wizardState,
  onUpdate,
  onNext,
  userClubId,
  userClubName,
  userClubLogo,
}: Step1Props) {
  const { t } = useTranslation('transfers')
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingClubs, setIsLoadingClubs] = useState(false)

  // Fetch clubs when type is selected
  useEffect(() => {
    const fetchClubs = async () => {
      if (!wizardState.transferType) return

      const config = TRANSFER_TYPE_CONFIGS[wizardState.transferType]
      if (!config.requiresOtherClub) return

      setIsLoadingClubs(true)
      try {
        const response = await ClubService.getClubs()
        // Filter out user's club
        const otherClubs = response.clubs.filter((club) => club.id !== userClubId)
        setClubs(otherClubs)
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setIsLoadingClubs(false)
      }
    }

    fetchClubs()
  }, [wizardState.transferType, userClubId])

  const handleSelectType = (type: TransferTypeOption) => {
    const config = TRANSFER_TYPE_CONFIGS[type]
    const userRole: UserTransferRole = config.userRole

    // Set clubs based on user role
    let sellerClubId = null
    let sellerClubName = null
    let sellerClubLogo = null
    let buyerClubId = null
    let buyerClubName = null
    let buyerClubLogo = null

    if (userRole === 'SELLER') {
      // User is selling, so user's club is the seller
      sellerClubId = userClubId
      sellerClubName = userClubName
      sellerClubLogo = userClubLogo
    } else {
      // User is buying, so user's club is the buyer
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
      // Reset dependent fields
      playersToSell: [],
      playersAsPayment: [],
      loanDetails:
        type === 'LOAN_IN' || type === 'LOAN_OUT'
          ? { durationHalves: 2, loanFee: 0, salaryPercentage: 50 }
          : null,
    }))

    // Reset search
    setSearchQuery('')
  }

  const handleSelectOtherClub = (club: Club) => {
    const userRole = wizardState.userRole

    if (userRole === 'SELLER') {
      // User is selling, so the other club is the buyer
      onUpdate((prev) => ({
        ...prev,
        buyerClubId: club.id,
        buyerClubName: club.name,
        buyerClubLogo: club.logo || null,
      }))
    } else {
      // User is buying, so the other club is the seller
      onUpdate((prev) => ({
        ...prev,
        sellerClubId: club.id,
        sellerClubName: club.name,
        sellerClubLogo: club.logo || null,
      }))
    }
  }

  // Filter clubs by search query
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Determine which club to show as selected in the "other club" section
  const selectedOtherClubId =
    wizardState.userRole === 'SELLER' ? wizardState.buyerClubId : wizardState.sellerClubId

  // Check if we need to show the clubs section
  const showClubsSection =
    wizardState.transferType &&
    TRANSFER_TYPE_CONFIGS[wizardState.transferType].requiresOtherClub

  return (
    <div className="space-y-6">
      {/* Transfer Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('wizard.steps.type.description')}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TRANSFER_TYPES.map((type) => {
            const Icon = TRANSFER_TYPE_ICONS[type]
            const key = TYPE_TO_KEY[type]
            const config = TRANSFER_TYPE_CONFIGS[type]
            const isSelected = wizardState.transferType === type
            const colorClasses = TRANSFER_TYPE_COLORS[config.color]

            return (
              <Card
                key={type}
                className={cn(
                  'cursor-pointer transition-all border-2',
                  isSelected
                    ? colorClasses
                    : 'hover:border-gray-300 border-transparent bg-gray-50 dark:bg-gray-800'
                )}
                onClick={() => handleSelectType(type)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={cn(
                      'mx-auto mb-2 p-2 rounded-lg w-fit',
                      isSelected ? 'bg-white/50' : 'bg-white dark:bg-gray-700'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', !isSelected && 'text-gray-700 dark:text-gray-200')} />
                  </div>
                  <p className={cn(
                    'text-sm font-medium',
                    !isSelected && 'text-gray-700 dark:text-gray-200'
                  )}>
                    {t(`typeCards.${key}.title`)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Clubs Section - Only shown when a type is selected and requires another club */}
      {showClubsSection && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {t('clubsInvolved.title', 'Equipos Involucrados')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller Club */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t('clubsInvolved.sellerClub', 'Equipo Vendedor')}
                </Label>
                {wizardState.userRole === 'SELLER' ? (
                  // User's club - non-editable
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    {wizardState.sellerClubLogo ? (
                      <img
                        src={wizardState.sellerClubLogo}
                        alt={wizardState.sellerClubName || ''}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{wizardState.sellerClubName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('clubsInvolved.yourClub', 'Tu Club')}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Other club - searchable select
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('playerSelection.searchPlaceholder', 'Buscar club...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <ScrollArea className="h-[180px] rounded-md border">
                      <div className="p-2 space-y-1">
                        {isLoadingClubs ? (
                          <p className="text-center py-4 text-sm text-muted-foreground">
                            Cargando...
                          </p>
                        ) : filteredClubs.length === 0 ? (
                          <p className="text-center py-4 text-sm text-muted-foreground">
                            No se encontraron clubes
                          </p>
                        ) : (
                          filteredClubs.map((club) => (
                            <div
                              key={club.id}
                              className={cn(
                                'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                selectedOtherClubId === club.id
                                  ? 'bg-primary/10 border border-primary'
                                  : 'hover:bg-muted'
                              )}
                              onClick={() => handleSelectOtherClub(club)}
                            >
                              {club.logo ? (
                                <img
                                  src={club.logo}
                                  alt={club.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Building2 className="h-4 w-4" />
                                </div>
                              )}
                              <span className="flex-1 text-sm">{club.name}</span>
                              {selectedOtherClubId === club.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Buyer Club */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t('clubsInvolved.buyerClub', 'Equipo Comprador')}
                </Label>
                {wizardState.userRole === 'BUYER' ? (
                  // User's club - non-editable
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    {wizardState.buyerClubLogo ? (
                      <img
                        src={wizardState.buyerClubLogo}
                        alt={wizardState.buyerClubName || ''}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{wizardState.buyerClubName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('clubsInvolved.yourClub', 'Tu Club')}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Other club - searchable select
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('playerSelection.searchPlaceholder', 'Buscar club...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <ScrollArea className="h-[180px] rounded-md border">
                      <div className="p-2 space-y-1">
                        {isLoadingClubs ? (
                          <p className="text-center py-4 text-sm text-muted-foreground">
                            Cargando...
                          </p>
                        ) : filteredClubs.length === 0 ? (
                          <p className="text-center py-4 text-sm text-muted-foreground">
                            No se encontraron clubes
                          </p>
                        ) : (
                          filteredClubs.map((club) => (
                            <div
                              key={club.id}
                              className={cn(
                                'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                selectedOtherClubId === club.id
                                  ? 'bg-primary/10 border border-primary'
                                  : 'hover:bg-muted'
                              )}
                              onClick={() => handleSelectOtherClub(club)}
                            >
                              {club.logo ? (
                                <img
                                  src={club.logo}
                                  alt={club.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Building2 className="h-4 w-4" />
                                </div>
                              )}
                              <span className="flex-1 text-sm">{club.name}</span>
                              {selectedOtherClubId === club.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
