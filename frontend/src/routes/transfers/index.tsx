import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import HomeService, { type UserClub } from '@/services/home.service'
import { NewTransferTab } from './_components/new-transfer-tab'
import { PendingConfirmationsTab } from './_components/pending-confirmations-tab'
import { MyTransfersTab } from './_components/my-transfers-tab'
import type { Transfer, SeasonHalf, Club, Player } from '@/types'
import { TransferService } from '@/services/transfer.service'
import { SeasonHalfService } from '@/services/season-half.service'
import { ClubService } from '@/services/club.service'
import { PlayerService } from '@/services/player.service'
import type { TransferCenterState } from '@/types/transfer-wizard'

export const Route = createFileRoute('/transfers/')({
  component: TransferCenter,
})

function TransferCenter() {
  const { t } = useTranslation('transfers')

  // State for the transfer center
  const [isLoading, setIsLoading] = useState(true)
  const [userClub, setUserClub] = useState<UserClub | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [seasonHalves, setSeasonHalves] = useState<SeasonHalf[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<Transfer[]>([])
  const [clubTransfers, setClubTransfers] = useState<Transfer[]>([])

  const [centerState, setCenterState] = useState<TransferCenterState>({
    activeTab: 'new',
    userClubId: null,
    userClubName: null,
  })

  // Fetch all data for the transfer center
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // First fetch the user's club
      const clubData = await HomeService.getUserClub()
      setUserClub(clubData)

      if (clubData) {
        setCenterState((prev) => ({
          ...prev,
          userClubId: clubData.id,
          userClubName: clubData.name,
        }))

        // Fetch additional data in parallel
        const [clubsData, playersData, seasonHalvesData, pendingData, historyData] = await Promise.all([
          ClubService.getClubs(),
          PlayerService.getPlayers(),
          SeasonHalfService.getSeasonHalves(),
          TransferService.getPendingConfirmations(clubData.id),
          TransferService.getTransfersByClub(clubData.id, 'both'),
        ])

        setClubs(clubsData.clubs || [])
        setPlayers(playersData.players || [])
        setSeasonHalves(seasonHalvesData.seasonHalves || [])
        setPendingTransfers(pendingData.transfers || [])
        setClubTransfers(historyData.transfers || [])
      }
    } catch (error) {
      console.error('Error fetching transfer center data:', error)
      toast.error(t('messages.noTransfers'))
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh pending and history after an action
  const refreshTransfers = async () => {
    if (!userClub) return

    try {
      const [pendingData, historyData] = await Promise.all([
        TransferService.getPendingConfirmations(userClub.id),
        TransferService.getTransfersByClub(userClub.id, 'both'),
      ])

      setPendingTransfers(pendingData.transfers || [])
      setClubTransfers(historyData.transfers || [])
    } catch (error) {
      console.error('Error refreshing transfers:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-8">
        <div className="flex flex-col items-center gap-2 h-full max-w-5xl w-full">
          <ClubAndUserTableSkeleton rows={6} />
        </div>
      </div>
    )
  }

  if (!userClub) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-8">
        <div className="flex flex-col items-center gap-2 h-full max-w-5xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4">{t('center.title')}</h1>
          <p className="text-muted-foreground">{t('messages.noTransfers')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full px-4 py-8">
      <div className="flex flex-col items-center gap-2 h-full max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold select-none">{t('center.title')}</h1>
          <p className="text-muted-foreground">{t('center.subtitle', { clubName: userClub.name })}</p>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="new"
          className="w-full"
          onValueChange={(value) =>
            setCenterState((prev) => ({
              ...prev,
              activeTab: value as 'new' | 'pending' | 'history',
            }))
          }
        >
          <TabsList className="mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="new">{t('center.tabs.new')}</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              {t('center.tabs.pending')}
              {pendingTransfers.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {pendingTransfers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">{t('center.tabs.history')}</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <NewTransferTab
              userClub={userClub}
              clubs={clubs}
              players={players}
              seasonHalves={seasonHalves}
              onTransferCreated={refreshTransfers}
            />
          </TabsContent>

          <TabsContent value="pending">
            <PendingConfirmationsTab
              userClub={userClub}
              pendingTransfers={pendingTransfers}
              onRefresh={refreshTransfers}
            />
          </TabsContent>

          <TabsContent value="history">
            <MyTransfersTab userClub={userClub} transfers={clubTransfers} onRefresh={refreshTransfers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TransferCenter
