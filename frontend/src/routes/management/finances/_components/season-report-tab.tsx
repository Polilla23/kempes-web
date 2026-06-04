import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, TrendingUp, DollarSign, Users, AlertTriangle, Trophy } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { FinanceService } from '@/services/finance.service'
import { formatCurrency } from '@/lib/finance-utils'
import type { Season, SeasonFinancialReport } from '@/types'

interface SeasonReportTabProps {
  seasons: Season[]
}

function RankingCard({
  title,
  clubName,
  amount,
  icon,
}: {
  title: string
  clubName: string | undefined
  amount: number | undefined
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {clubName ? (
        <div>
          <p className="font-semibold">{clubName}</p>
          {amount != null && (
            <p className="text-lg font-bold font-mono">{formatCurrency(amount)}</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">—</p>
      )}
    </div>
  )
}

export function SeasonReportTab({ seasons }: SeasonReportTabProps) {
  const { t } = useTranslation('finances')
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('')
  const [report, setReport] = useState<SeasonFinancialReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedSeasonId) return
    const fetchReport = async () => {
      setIsLoading(true)
      setReport(null)
      try {
        const res = await FinanceService.getSeasonFinancialReport(selectedSeasonId)
        setReport(res.report ?? null)
      } catch {
        setReport(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReport()
  }, [selectedSeasonId])

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium select-none">{t('seasonReport.selectSeason')}:</label>
        <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder={t('seasonReport.selectSeason')} />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                Temporada {s.number}
                {s.isActive && ' (Activa)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedSeasonId && (
        <p className="text-muted-foreground text-center py-12">{t('seasonReport.noReport')}</p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {!isLoading && report && (
        <div className="space-y-6">
          {/* Exec Stat Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('seasonReport.totalTransferVolume')}</p>
                <p className="text-lg font-bold">{formatCurrency(report.totalTransferVolume)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <div className="rounded-full bg-yellow-100 p-2.5 dark:bg-yellow-900">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('seasonReport.totalPrizesPaid')}</p>
                <p className="text-lg font-bold">{formatCurrency(report.totalPrizesPaid)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <div className="rounded-full bg-orange-100 p-2.5 dark:bg-orange-900">
                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('seasonReport.totalSalariesPaid')}</p>
                <p className="text-lg font-bold">{formatCurrency(report.totalSalariesPaid)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <div className="rounded-full bg-red-100 p-2.5 dark:bg-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('seasonReport.clubsInDeficit')}</p>
                <p className="text-lg font-bold">{report.clubsInDeficit}</p>
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div>
            <h3 className="text-base font-semibold mb-3">{t('seasonReport.rankings')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <RankingCard
                title={t('seasonReport.richestClub')}
                clubName={report.richestClub?.clubName}
                amount={report.richestClub?.balance}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <RankingCard
                title={t('seasonReport.biggestSpender')}
                clubName={report.biggestSpender?.clubName}
                amount={report.biggestSpender?.amount}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <RankingCard
                title={t('seasonReport.biggestSeller')}
                clubName={report.biggestSeller?.clubName}
                amount={report.biggestSeller?.amount}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <RankingCard
                title={t('seasonReport.biggestPayroll')}
                clubName={report.biggestPayroll?.clubName}
                amount={report.biggestPayroll?.amount}
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Prizes by Competition */}
          {report.prizesByCompetition.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3">{t('seasonReport.prizesByCompetition')}</h3>
              <div className="space-y-4">
                {report.prizesByCompetition.map((comp) => (
                  <div key={comp.competitionName} className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{comp.competitionName}</h4>
                      <span className="text-sm font-mono text-muted-foreground">
                        {formatCurrency(comp.totalPrizeAmount)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {comp.clubs.map((club, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] w-6 h-5 flex items-center justify-center p-0">
                              {club.position}°
                            </Badge>
                            <span>{club.clubName}</span>
                          </div>
                          <span className="font-mono">{formatCurrency(club.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clubs in Deficit */}
          <div>
            <h3 className="text-base font-semibold mb-3">{t('seasonReport.deficitClubs')}</h3>
            {report.deficitClubs.length === 0 ? (
              <Alert>
                <AlertDescription>{t('seasonReport.noDeficitClubs')}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {report.deficitClubs.map((club) => (
                  <div
                    key={club.clubId}
                    className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                  >
                    <span className="font-medium text-sm">{club.clubName}</span>
                    <Badge variant="destructive" className="font-mono">
                      {formatCurrency(club.balance ?? 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
