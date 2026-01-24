import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { MatchCard } from './match-card'
import type { GroupedMatches, Match } from '../_types/fixtures.types'

interface FixturesListViewProps {
  groupedMatches: GroupedMatches
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function FixturesListView({ groupedMatches }: FixturesListViewProps) {
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(0)

  // Aplanar partidos para paginación manteniendo info del grupo
  const allMatches = useMemo(() => {
    return Object.entries(groupedMatches).flatMap(([compId, { name, matches }]) =>
      matches.map((m) => ({ ...m, _groupId: compId, _groupName: name }))
    )
  }, [groupedMatches])

  const totalPages = Math.ceil(allMatches.length / pageSize)
  const paginatedMatches = allMatches.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  // Re-agrupar partidos paginados
  const paginatedGroups = useMemo(() => {
    const groups: Record<string, { name: string; matches: Match[] }> = {}
    paginatedMatches.forEach((match) => {
      const key = (match as any)._groupId
      if (!groups[key]) {
        groups[key] = { name: (match as any)._groupName, matches: [] }
      }
      groups[key].matches.push(match)
    })
    return groups
  }, [paginatedMatches])

  if (Object.keys(groupedMatches).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron partidos con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(paginatedGroups).map(([competitionId, { name, matches }]) => (
        <Card key={competitionId} className="bg-card border-border overflow-hidden">
          {/* Competition Header */}
          <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-foreground">{name}</span>
              <Badge variant="outline" className="text-xs">
                {matches.length} partidos
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Matches */}
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls */}
      {allMatches.length > PAGE_SIZE_OPTIONS[0] && (
        <>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(0)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium">
                Página {currentPage + 1} de {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-right px-2">
            Mostrando {currentPage * pageSize + 1} a{' '}
            {Math.min((currentPage + 1) * pageSize, allMatches.length)} de {allMatches.length}{' '}
            partidos
          </div>
        </>
      )}
    </div>
  )
}
