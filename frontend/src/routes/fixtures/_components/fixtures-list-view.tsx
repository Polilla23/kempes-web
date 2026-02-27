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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MatchCard } from './match-card'
import type { GroupedMatches, Match } from '../_types/fixtures.types'
import { ROUND_LABELS } from '../_types/fixtures.types'

interface FixturesListViewProps {
  groupedMatches: GroupedMatches
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function getSubGroupKey(match: Match): string {
  if (match.stage === 'KNOCKOUT' && match.knockoutRound) {
    return match.knockoutRound
  }
  return `FECHA_${match.matchdayOrder}`
}

function getSubGroupLabel(key: string): string {
  if (key.startsWith('FECHA_')) {
    return `Fecha ${key.replace('FECHA_', '')}`
  }
  return ROUND_LABELS[key] || key
}

function renderCollapsibleSection(
  key: string,
  label: string,
  matchCount: number,
  isExpanded: boolean,
  onToggle: (open: boolean) => void,
  children: React.ReactNode,
  level: 'group' | 'fecha' | 'default' = 'default'
) {
  const headerStyles = {
    group: 'px-4 py-2 bg-secondary/40 hover:bg-secondary/60',
    fecha: 'pl-8 pr-4 py-1.5 bg-secondary/20 hover:bg-secondary/30',
    default: 'px-4 py-2 bg-secondary/30 hover:bg-secondary/50',
  }
  const textStyles = {
    group: 'text-sm font-semibold text-foreground/80',
    fecha: 'text-xs font-medium text-muted-foreground',
    default: 'text-sm font-medium text-muted-foreground',
  }

  return (
    <Collapsible key={key} open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between cursor-pointer transition-colors',
            headerStyles[level]
          )}
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
            <span className={textStyles[level]}>{label}</span>
            <Badge variant="outline" className="text-xs">
              {matchCount}
            </Badge>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

function renderCompetitionMatches(
  competitionId: string,
  matches: Match[],
  expandedSubGroups: Set<string>,
  setExpandedSubGroups: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  // Detectar si hay fase de grupos (matches ROUND_ROBIN con homePlaceholder = grupo)
  const hasGroups = matches.some(
    (m) => m.stage === 'ROUND_ROBIN' && m.homePlaceholder
  )

  if (!hasGroups) {
    // Sin grupos: agrupar por fecha/knockout (comportamiento actual)
    const subGroups = new Map<string, Match[]>()
    matches.forEach((match) => {
      const key = getSubGroupKey(match)
      if (!subGroups.has(key)) subGroups.set(key, [])
      subGroups.get(key)!.push(match)
    })

    return Array.from(subGroups.entries()).map(([subKey, subMatches]) => {
      const fullKey = `${competitionId}::${subKey}`
      const isExpanded = expandedSubGroups.has(fullKey)

      return renderCollapsibleSection(
        subKey,
        getSubGroupLabel(subKey),
        subMatches.length,
        isExpanded,
        (open) => {
          setExpandedSubGroups((prev) => {
            const next = new Set(prev)
            if (open) next.add(fullKey)
            else next.delete(fullKey)
            return next
          })
        },
        <div className="divide-y divide-border">
          {subMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )
    })
  }

  // Con grupos: separar en group-stage y knockout
  const groupStageMatches = matches.filter(
    (m) => m.stage === 'ROUND_ROBIN' && m.homePlaceholder
  )
  const knockoutMatches = matches.filter(
    (m) => !(m.stage === 'ROUND_ROBIN' && m.homePlaceholder)
  )

  // Agrupar por nombre de grupo (A, B, C...) ordenado alfabéticamente
  const groups = new Map<string, Match[]>()
  groupStageMatches.forEach((match) => {
    const groupName = match.homePlaceholder!
    if (!groups.has(groupName)) groups.set(groupName, [])
    groups.get(groupName)!.push(match)
  })
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  // Agrupar knockout por ronda
  const knockoutSubGroups = new Map<string, Match[]>()
  knockoutMatches.forEach((match) => {
    const key = getSubGroupKey(match)
    if (!knockoutSubGroups.has(key)) knockoutSubGroups.set(key, [])
    knockoutSubGroups.get(key)!.push(match)
  })

  return (
    <>
      {/* Grupos: nivel 1 = grupo, nivel 2 = fecha */}
      {sortedGroups.map(([groupName, groupMatches]) => {
        const groupKey = `${competitionId}::GROUP_${groupName}`
        const isGroupExpanded = expandedSubGroups.has(groupKey)

        // Sub-agrupar por fecha dentro del grupo
        const fechas = new Map<string, Match[]>()
        groupMatches.forEach((match) => {
          const fechaKey = `FECHA_${match.matchdayOrder}`
          if (!fechas.has(fechaKey)) fechas.set(fechaKey, [])
          fechas.get(fechaKey)!.push(match)
        })

        return renderCollapsibleSection(
          `GROUP_${groupName}`,
          `Grupo ${groupName}`,
          groupMatches.length,
          isGroupExpanded,
          (open) => {
            setExpandedSubGroups((prev) => {
              const next = new Set(prev)
              if (open) next.add(groupKey)
              else next.delete(groupKey)
              return next
            })
          },
          <div className="divide-y divide-border">
            {Array.from(fechas.entries()).map(([fechaKey, fechaMatches]) => {
              const fullFechaKey = `${competitionId}::GROUP_${groupName}::${fechaKey}`
              const isFechaExpanded = expandedSubGroups.has(fullFechaKey)

              return renderCollapsibleSection(
                fechaKey,
                getSubGroupLabel(fechaKey),
                fechaMatches.length,
                isFechaExpanded,
                (open) => {
                  setExpandedSubGroups((prev) => {
                    const next = new Set(prev)
                    if (open) next.add(fullFechaKey)
                    else next.delete(fullFechaKey)
                    return next
                  })
                },
                <div className="divide-y divide-border">
                  {fechaMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>,
                'fecha'
              )
            })}
          </div>,
          'group'
        )
      })}

      {/* Knockout: nivel 1 = ronda */}
      {Array.from(knockoutSubGroups.entries()).map(
        ([subKey, subMatches]) => {
          const fullKey = `${competitionId}::${subKey}`
          const isExpanded = expandedSubGroups.has(fullKey)

          return renderCollapsibleSection(
            subKey,
            getSubGroupLabel(subKey),
            subMatches.length,
            isExpanded,
            (open) => {
              setExpandedSubGroups((prev) => {
                const next = new Set(prev)
                if (open) next.add(fullKey)
                else next.delete(fullKey)
                return next
              })
            },
            <div className="divide-y divide-border">
              {subMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )
        }
      )}
    </>
  )
}

export function FixturesListView({ groupedMatches }: FixturesListViewProps) {
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(0)
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(new Set())

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
        <Card key={competitionId} className="bg-card border-border overflow-hidden py-0 gap-0">
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

          {/* Matches grouped by matchday/phase/group */}
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {renderCompetitionMatches(competitionId, matches, expandedSubGroups, setExpandedSubGroups)}
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
