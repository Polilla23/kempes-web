import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import HomeService, { type UserClub } from '@/services/home.service'
import { TransferService } from '@/services/transfer.service'
import { SeasonHalfService } from '@/services/season-half.service'
import { ClubService } from '@/services/club.service'
import { PlayerService } from '@/services/player.service'
import { NewTransferTab } from './_components/new-transfer-tab'
import { TransferFilters, type TransferFiltersState } from './_components/transfer-filters'
import { TransferListPanel } from './_components/transfer-list-panel'
import { TransferDetailPanel } from './_components/transfer-detail-panel'
import type { Transfer, Club, Player, SeasonHalf } from '@/types'

export const Route = createFileRoute('/transfers/')({
  component: TransferCenter,
})

function TransferCenter() {
  const { t } = useTranslation('transfers')

  const [isLoading, setIsLoading] = useState(true)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [userClub, setUserClub] = useState<UserClub | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Transfer | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [filters, setFilters] = useState<TransferFiltersState>({})

  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardClubs, setWizardClubs] = useState<Club[]>([])
  const [wizardPlayers, setWizardPlayers] = useState<Player[]>([])
  const [wizardSeasonHalves, setWizardSeasonHalves] = useState<SeasonHalf[]>([])
  const [wizardDataLoaded, setWizardDataLoaded] = useState(false)

  const fetchTransfers = async () => {
    const data = await TransferService.getTransfers()
    setTransfers(data.transfers)
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const [transfersResult, clubResult] = await Promise.allSettled([
        TransferService.getTransfers(),
        HomeService.getUserClub(),
      ])
      if (transfersResult.status === 'fulfilled') {
        setTransfers(transfersResult.value.transfers)
      } else {
        console.error('Error loading transfers:', transfersResult.reason)
      }
      if (clubResult.status === 'fulfilled') {
        setUserClub(clubResult.value)
      } else {
        console.error('Error loading user club:', clubResult.reason)
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const handleSelectTransfer = async (id: string) => {
    if (selectedId === id) return
    setSelectedId(id)
    setDetailLoading(true)
    try {
      const data = await TransferService.getTransferById(id)
      setDetail(data.transfer ?? null)
    } catch (error) {
      console.error('Error loading transfer detail:', error)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenWizard = async () => {
    if (!wizardDataLoaded) {
      try {
        const [clubsData, playersData, seasonHalvesData] = await Promise.all([
          ClubService.getClubs(),
          PlayerService.getPlayers(),
          SeasonHalfService.getSeasonHalves(),
        ])
        setWizardClubs(clubsData.clubs || [])
        setWizardPlayers(playersData.players || [])
        setWizardSeasonHalves(seasonHalvesData.seasonHalves || [])
        setWizardDataLoaded(true)
      } catch (error) {
        console.error('Error loading wizard data:', error)
      }
    }
    setWizardOpen(true)
  }

  const handleTransferCreated = async () => {
    setWizardOpen(false)
    await fetchTransfers()
  }

  // Derive unique club names from all transfers for the club filter dropdown
  const clubNames = useMemo(() => {
    const names = new Set<string>()
    for (const tr of transfers) {
      if (tr.fromClub?.name) names.add(tr.fromClub.name)
      if (tr.toClub?.name) names.add(tr.toClub.name)
    }
    return [...names].sort()
  }, [transfers])

  const filteredTransfers = useMemo(() => {
    return transfers.filter((tr) => {
      if (filters.type && tr.type !== filters.type) return false
      if (filters.status && tr.status !== filters.status) return false
      if (filters.clubName) {
        const matchesFrom = tr.fromClub?.name === filters.clubName
        const matchesTo = tr.toClub?.name === filters.clubName
        if (!matchesFrom && !matchesTo) return false
      }
      if (filters.dateFrom && new Date(tr.createdAt) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(tr.createdAt) > new Date(filters.dateTo + 'T23:59:59')) return false
      return true
    })
  }, [transfers, filters])

  const isFiltered = Object.values(filters).some(Boolean)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-8">
        <ClubAndUserTableSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full px-[5%] lg:px-[7%] xl:px-[10%] py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold select-none">{t('center.title')}</h1>
        </div>
        {userClub && (
          <Button size="sm" onClick={handleOpenWizard}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t('newButton')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <TransferFilters filters={filters} onFiltersChange={setFilters} clubNames={clubNames} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TransferListPanel
          transfers={filteredTransfers}
          selectedId={selectedId}
          onSelect={handleSelectTransfer}
          isFiltered={isFiltered}
        />
        <TransferDetailPanel transfer={detail} isLoading={detailLoading} />
      </div>

      {/* New Transfer Dialog */}
      {userClub && (
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogContent className="w-[860px] max-w-[95vw] h-[680px] max-h-[95vh] overflow-hidden p-0 gap-0">
            <DialogTitle className="sr-only">{t('wizard.title')}</DialogTitle>
            {/* Strip Card border/shadow so the wizard fills the dialog cleanly */}
            <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none">
              <NewTransferTab
                userClub={userClub}
                clubs={wizardClubs}
                players={wizardPlayers}
                seasonHalves={wizardSeasonHalves}
                onTransferCreated={handleTransferCreated}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default TransferCenter
