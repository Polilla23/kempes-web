import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, AlertTriangle, Clock, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import type { PlazoDTO } from '@/services/plazo.service'
import { PlazoService } from '@/services/plazo.service'

interface PlazoCardProps {
  plazo: PlazoDTO
  onEdit: (plazo: PlazoDTO) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}

export function PlazoCard({ plazo, onEdit, onDelete, onRefresh }: PlazoCardProps) {
  const { t } = useTranslation('plazos')
  const [scopesExpanded, setScopesExpanded] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const deadlineDate = new Date(plazo.deadline)
  const stats = plazo.stats || { total: 0, pending: 0, finalized: 0, cancelled: 0 }

  const handleToggleOpen = async () => {
    setIsToggling(true)
    try {
      await PlazoService.toggleOpen(plazo.id, !plazo.isOpen)
      toast.success(plazo.isOpen ? t('card.closedSuccess') : t('card.openedSuccess'))
      onRefresh()
    } catch {
      toast.error(t('error.update'))
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card
      className={`w-full transition-all ${
        plazo.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''
      }`}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title + Order + Status */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-base">{plazo.title}</span>
              <Badge variant="outline" className="text-[10px]">
                #{plazo.order}
              </Badge>
              {plazo.isOpen ? (
                <Badge
                  variant="default"
                  className="gap-1 text-[10px] bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={handleToggleOpen}
                >
                  {isToggling ? '...' : t('card.open')}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px] cursor-pointer"
                  onClick={handleToggleOpen}
                >
                  {isToggling ? '...' : t('card.closed')}
                </Badge>
              )}
              {plazo.isOverdue && (
                <Badge variant="destructive" className="gap-1 text-[10px]">
                  <AlertTriangle className="h-3 w-3" />
                  {t('status.overdue')}
                </Badge>
              )}
              {!plazo.isOverdue && deadlineDate > new Date() && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Clock className="h-3 w-3" />
                  {t('status.upcoming')}
                </Badge>
              )}
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <CalendarClock className="h-3.5 w-3.5" />
              {t('card.deadline')}: {deadlineDate.toLocaleDateString()}
            </div>

            {/* Match Stats */}
            {stats.total > 0 ? (
              <div className="flex items-center gap-3 text-xs">
                <span className="font-medium">{stats.total} {t('card.matches')}</span>
                <span className="text-yellow-600">{stats.pending} {t('card.pending')}</span>
                <span className="text-green-600">{stats.finalized} {t('card.finalized')}</span>
                {stats.cancelled > 0 && (
                  <span className="text-red-600">{stats.cancelled} {t('card.cancelled')}</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t('card.noMatches')}</p>
            )}

            {/* Scopes (collapsible) */}
            {plazo.scopes.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setScopesExpanded(!scopesExpanded)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {scopesExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {plazo.scopes.length} {plazo.scopes.length === 1 ? 'competición' : 'competiciones'}
                </button>
                {scopesExpanded && (
                  <div className="mt-1.5 space-y-1 pl-4 border-l-2 border-muted">
                    {plazo.scopes.map((scope) => (
                      <div key={scope.id} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {scope.competition?.name || scope.competitionId}
                        </span>
                        {scope.matchdayFrom != null && scope.matchdayTo != null && (
                          <span className="ml-1">
                            (Fechas {scope.matchdayFrom}–{scope.matchdayTo})
                          </span>
                        )}
                        {scope.knockoutRounds.length > 0 && (
                          <span className="ml-1">
                            ({scope.knockoutRounds.map((r) => t(`knockoutRounds.${r}` as any)).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(plazo)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(plazo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
