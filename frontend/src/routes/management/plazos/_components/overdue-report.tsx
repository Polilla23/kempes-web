import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { AlertTriangle, ChevronDown, ChevronLeft, CheckCircle, Shield, Clock } from 'lucide-react'
import { PlazoService, type OverdueReport as OverdueReportType } from '@/services/plazo.service'
import { toast } from 'sonner'

interface OverdueReportProps {
  seasonId: string
  onBack: () => void
}

export function OverdueReport({ seasonId, onBack }: OverdueReportProps) {
  const { t } = useTranslation('plazos')
  const [report, setReport] = useState<OverdueReportType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId])

  const loadReport = async () => {
    try {
      setIsLoading(true)
      const data = await PlazoService.getOverdueReport(seasonId)
      setReport(data)
    } catch {
      toast.error(t('error.fetch'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleClub = (clubId: string) => {
    setExpandedClubs((prev) => {
      const next = new Set(prev)
      if (next.has(clubId)) next.delete(clubId)
      else next.add(clubId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const summary = report?.summary || { totalOverdueMatches: 0, totalPending: 0, totalLatePlayed: 0, affectedClubs: 0 }
  const clubs = report?.clubs || []

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <div>
          <h2 className="text-xl font-bold">{t('overdue.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('overdueReport.subtitle')}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-destructive">{summary.totalPending}</p>
            <p className="text-xs text-muted-foreground">{t('overdue.summary.totalPending')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{summary.totalLatePlayed}</p>
            <p className="text-xs text-muted-foreground">{t('overdue.summary.totalLatePlayed')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{summary.affectedClubs}</p>
            <p className="text-xs text-muted-foreground">{t('overdue.summary.affectedClubs')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clubs list */}
      {clubs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-muted-foreground">{t('overdue.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        clubs.map((clubReport) => (
          <Collapsible
            key={clubReport.club.id}
            open={expandedClubs.has(clubReport.club.id)}
            onOpenChange={() => toggleClub(clubReport.club.id)}
          >
            <Card className="border-destructive/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-2 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-muted border">
                        {clubReport.club.logo ? (
                          <img src={clubReport.club.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-base">{clubReport.club.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {clubReport.totalPending > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('overdue.club.pendingCount', { count: clubReport.totalPending })}
                        </Badge>
                      )}
                      {clubReport.totalLatePlayed > 0 && (
                        <Badge className="gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                          <Clock className="h-3 w-3" />
                          {t('overdue.club.latePlayedCount', { count: clubReport.totalLatePlayed })}
                        </Badge>
                      )}
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedClubs.has(clubReport.club.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {clubReport.plazos.map((plazo) => (
                      <div key={plazo.plazoId}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">{plazo.title}</span>
                          <span className="text-xs text-muted-foreground">
                            — {t('overdueReport.plazoDeadline')} {new Date(plazo.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-3 border-l-2 border-muted">
                          {plazo.matches.map((match) => {
                            const isSinDisputar = match.overdueStatus === 'SIN_DISPUTAR'
                            return (
                              <div
                                key={match.id}
                                className={`flex items-center justify-between rounded-lg p-2 text-sm border-l-2 ${
                                  isSinDisputar
                                    ? 'bg-destructive/10 border-l-destructive'
                                    : 'bg-amber-500/10 border-l-amber-500'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded flex items-center justify-center overflow-hidden bg-muted border">
                                    {match.rival.logo ? (
                                      <img src={match.rival.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Shield className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="text-muted-foreground">{t('overdue.match.vs')}</span>
                                  <span className="font-medium truncate max-w-[140px]">
                                    {match.rival.name}
                                  </span>
                                  {match.score && (
                                    <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                      {match.isHome
                                        ? `${match.score.home} - ${match.score.away}`
                                        : `${match.score.away} - ${match.score.home}`}
                                    </span>
                                  )}
                                  <Badge variant="outline" className="text-[10px]">
                                    {match.isHome ? t('overdue.match.home') : t('overdue.match.away')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {match.competition}
                                  </span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {match.knockoutRound
                                      ? t(`knockoutRounds.${match.knockoutRound}` as any)
                                      : t('overdue.match.matchday', { n: match.matchdayOrder })}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      isSinDisputar
                                        ? 'border-destructive/50 text-destructive'
                                        : 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                                    }`}
                                  >
                                    {isSinDisputar ? t('overdue.match.sinDisputar') : t('overdue.match.latePlayed')}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      )}
    </div>
  )
}
