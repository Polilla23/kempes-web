import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, User, ArrowRight, DollarSign, Clock } from 'lucide-react'
import type { UserClub } from '@/services/home.service'
import type { Transfer } from '@/types'
import { TransferService } from '@/services/transfer.service'

interface PendingConfirmationsTabProps {
  userClub: UserClub
  pendingTransfers: Transfer[]
  onRefresh: () => void
}

export function PendingConfirmationsTab({
  userClub,
  pendingTransfers,
  onRefresh,
}: PendingConfirmationsTabProps) {
  const { t } = useTranslation('transfers')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: 'approve' | 'reject'
    transfer: Transfer | null
  }>({
    isOpen: false,
    action: 'approve',
    transfer: null,
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get transfer type label
  const getTypeLabel = (type: string) => {
    return t(`types.${type}`)
  }

  // Determine if user is receiving in this transfer
  const isUserReceiving = (transfer: Transfer) => {
    return transfer.toClubId === userClub.id
  }

  // Handle approve
  const handleApprove = async () => {
    if (!dialogState.transfer) return

    setIsProcessing(dialogState.transfer.id)
    try {
      await TransferService.approveTransfer(dialogState.transfer.id)
      toast.success(t('pending.approveSuccess'))
      onRefresh()
    } catch (error) {
      console.error('Error approving transfer:', error)
      toast.error(t('pending.approveError'))
    } finally {
      setIsProcessing(null)
      setDialogState({ isOpen: false, action: 'approve', transfer: null })
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!dialogState.transfer) return

    setIsProcessing(dialogState.transfer.id)
    try {
      await TransferService.rejectTransfer(dialogState.transfer.id)
      toast.success(t('pending.rejectSuccess'))
      onRefresh()
    } catch (error) {
      console.error('Error rejecting transfer:', error)
      toast.error(t('pending.rejectError'))
    } finally {
      setIsProcessing(null)
      setDialogState({ isOpen: false, action: 'reject', transfer: null })
    }
  }

  // Open dialog
  const openDialog = (transfer: Transfer, action: 'approve' | 'reject') => {
    setDialogState({ isOpen: true, action, transfer })
  }

  if (pendingTransfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pending.title')}</CardTitle>
          <CardDescription>{t('pending.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">{t('pending.empty')}</p>
            <p className="text-sm text-muted-foreground">{t('pending.emptyDescription')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('pending.title')}
            <Badge variant="destructive">{pendingTransfers.length}</Badge>
          </CardTitle>
          <CardDescription>{t('pending.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4">
              {pendingTransfers.map((transfer) => {
                const receiving = isUserReceiving(transfer)
                const otherClub = receiving ? transfer.fromClub : transfer.toClub

                return (
                  <Card key={transfer.id} className="border-2 border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Transfer info */}
                        <div className="flex-1 space-y-2">
                          {/* Type badge and player */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{getTypeLabel(transfer.type)}</Badge>
                            <span className="font-medium">
                              {transfer.player?.name} {transfer.player?.lastName}
                            </span>
                            {transfer.player?.overall && (
                              <span className="text-sm text-muted-foreground">
                                (OVR: {transfer.player.overall})
                              </span>
                            )}
                          </div>

                          {/* Clubs visualization */}
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              {transfer.fromClub?.logo && (
                                <img
                                  src={transfer.fromClub.logo}
                                  alt={transfer.fromClub.name}
                                  className="h-5 w-5 object-contain"
                                />
                              )}
                              <span>{transfer.fromClub?.name || '-'}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-1">
                              {transfer.toClub?.logo && (
                                <img
                                  src={transfer.toClub.logo}
                                  alt={transfer.toClub.name}
                                  className="h-5 w-5 object-contain"
                                />
                              )}
                              <span>{transfer.toClub?.name || '-'}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          {transfer.totalAmount > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatCurrency(transfer.totalAmount)}</span>
                              {transfer.numberOfInstallments > 1 && (
                                <span className="text-muted-foreground">
                                  ({transfer.numberOfInstallments} {t('fields.installments')})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Initiated by */}
                          {transfer.initiatorClub && (
                            <p className="text-xs text-muted-foreground">
                              Iniciado por: {transfer.initiatorClub.name}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openDialog(transfer, 'approve')}
                            disabled={isProcessing === transfer.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t('pending.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(transfer, 'reject')}
                            disabled={isProcessing === transfer.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t('pending.reject')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={dialogState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ isOpen: false, action: 'approve', transfer: null })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.action === 'approve'
                ? t('pending.confirmApprove')
                : t('pending.confirmReject')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.action === 'approve'
                ? t('pending.approveDescription')
                : t('pending.rejectDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dialogState.transfer && (
            <div className="py-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {dialogState.transfer.player?.name} {dialogState.transfer.player?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{dialogState.transfer.fromClub?.name}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>{dialogState.transfer.toClub?.name}</span>
                </div>
                {dialogState.transfer.totalAmount > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(dialogState.transfer.totalAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isProcessing}>
              {t('buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialogState.action === 'approve' ? handleApprove : handleReject}
              disabled={!!isProcessing}
              className={
                dialogState.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {isProcessing
                ? '...'
                : dialogState.action === 'approve'
                  ? t('pending.approve')
                  : t('pending.reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
