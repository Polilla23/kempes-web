import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import { StandingsTable } from './standings-table'
import type { CupGroupsStatusResponse } from '../_types/standings.types'

interface StandingsCupGroupsProps {
  data: CupGroupsStatusResponse
}

export function StandingsCupGroups({ data }: StandingsCupGroupsProps) {
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
                Fase de Grupos
                {data.allGroupsComplete && (
                  <Badge variant="secondary" className="ml-2">
                    Finalizado
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tablas por grupo */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data.groups.map((group) => (
          <Card key={group.groupName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Grupo {group.groupName}</CardTitle>
                <CardDescription>
                  {group.matchesPlayed} de {group.matchesTotal} partidos
                  {group.isComplete && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Completo
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
