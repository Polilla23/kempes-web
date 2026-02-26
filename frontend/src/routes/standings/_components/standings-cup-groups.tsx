import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { StandingsTable } from './standings-table'
import type { CupGroupsStatusResponse } from '../_types/standings.types'
import { useUser } from '@/context/UserContext'

interface StandingsCupGroupsProps {
  data: CupGroupsStatusResponse
  competitionId?: string
}

export function StandingsCupGroups({ data, competitionId }: StandingsCupGroupsProps) {
  const { t } = useTranslation(['standings', 'fixtures'])
  const user = useUser()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      {/* Header general */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {data.competitionName}
              </CardTitle>
              <CardDescription>
                {t('standings:cupGroups.groupStage')}
                {data.allGroupsComplete && (
                  <Badge variant="secondary" className="ml-2">
                    {t('standings:cupGroups.finished')}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* CTA para generar brackets cuando grupos están completos */}
      {data.allGroupsComplete && isAdmin && competitionId && (
        <Alert className="border-amber-500/50 bg-amber-500/5">
          <Trophy className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium">{t('fixtures:cup.groupsComplete')}</span>
              <span className="text-muted-foreground ml-1">— {t('fixtures:cup.groupsCompleteDesc')}</span>
            </div>
            <Button asChild size="sm" variant="outline" className="ml-4 shrink-0">
              <Link
                to="/management/fixtures/cup/kempes/generate-brackets"
                search={{ competitionId }}
              >
                {t('fixtures:cup.generateBrackets')}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tablas por grupo */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data.groups.map((group) => (
          <Card key={group.groupName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('standings:cupGroups.group', { name: group.groupName })}
                </CardTitle>
                <CardDescription>
                  {t('standings:cupGroups.matchesProgress', {
                    played: group.matchesPlayed,
                    total: group.matchesTotal,
                  })}
                  {group.isComplete && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t('standings:cupGroups.complete')}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <StandingsTable standings={group.standings} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
