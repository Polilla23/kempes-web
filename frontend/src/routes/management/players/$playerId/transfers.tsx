import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PlayerService } from '@/services/player.service'
import { TransferService } from '@/services/transfer.service'
import { TransferDetailPanel } from '../../../transfers/_components/transfer-detail-panel'
import { PlayerCareerPath } from '../_components/player-career-path'
import { TYPE_BADGE_CLASSES, TYPE_LABELS, STATUS_BADGE_CLASSES, STATUS_LABELS } from '../../../transfers/_components/transfer-badge-classes'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/finance-utils'
import type { Player, Transfer } from '@/types'

export const Route = createFileRoute('/management/players/$playerId/transfers')({
  component: PlayerTransfersPage,
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function PlayerTransfersPage() {
  const { playerId } = Route.useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [player, setPlayer] = useState<Player | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [playerResult, transfersResult] = await Promise.allSettled([
        PlayerService.getPlayerById(playerId),
        TransferService.getTransfersByPlayer(playerId),
      ])
      if (playerResult.status === 'fulfilled') setPlayer(playerResult.value.player ?? null)
      if (transfersResult.status === 'fulfilled') setTransfers(transfersResult.value.transfers)
      setIsLoading(false)
    }
    load()
  }, [playerId])

  const handleSelectTransfer = async (transferId: string) => {
    setDetailLoading(true)
    setSheetOpen(true)
    try {
      const res = await TransferService.getTransferById(transferId)
      setSelectedTransfer(res.transfer ?? null)
    } catch {
      setSelectedTransfer(null)
    } finally {
      setDetailLoading(false)
    }
  }

  // Compute stats
  const stats = {
    total: transfers.length,
    clubs: new Set([...transfers.map((t) => t.toClubId)]).size,
    biggest: transfers.reduce(
      (max, tr) => (tr.totalAmount > (max?.totalAmount ?? 0) ? tr : max),
      null as Transfer | null
    ),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full px-[5%] lg:px-[7%] xl:px-[10%] py-6 gap-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/management/players">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a jugadores
          </Link>
        </Button>
      </div>

      {/* Player Header */}
      {player && (
        <div className="flex items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{player.fullName}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {player.overall != null && (
                <Badge variant="outline" className="font-mono font-bold">
                  OVR {player.overall}
                </Badge>
              )}
              {player.isKempesita && (
                <Badge variant="secondary">Kempesita</Badge>
              )}
              {player.actualClub && (
                <span className="text-sm text-muted-foreground">
                  Club actual: <strong>{player.actualClub.name}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Total transferencias</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Clubes</p>
          <p className="text-2xl font-bold">{stats.clubs}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Mayor transferencia</p>
          <p className="text-2xl font-bold">
            {stats.biggest ? formatAmount(stats.biggest.totalAmount) : '—'}
          </p>
        </div>
      </div>

      {/* Career Path */}
      {transfers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Trayectoria</h2>
          <div className="rounded-xl border p-4 overflow-x-auto">
            <PlayerCareerPath transfers={transfers} />
          </div>
        </div>
      )}

      {/* Transfer History Table */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Historial de transferencias</h2>
        {transfers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Sin transferencias registradas</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">De</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">A</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Monto</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Cuotas</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {[...transfers]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((tr) => (
                    <tr
                      key={tr.id}
                      className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectTransfer(tr.id)}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(tr.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            TYPE_BADGE_CLASSES[tr.type]
                          )}
                        >
                          {TYPE_LABELS[tr.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{tr.fromClub?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tr.toClub?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatAmount(tr.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {tr.numberOfInstallments > 1 ? `${tr.numberOfInstallments} cuotas` : 'Única'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            STATUS_BADGE_CLASSES[tr.status]
                          )}
                        >
                          {STATUS_LABELS[tr.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalle de transferencia</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <TransferDetailPanel transfer={selectedTransfer} isLoading={detailLoading} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
