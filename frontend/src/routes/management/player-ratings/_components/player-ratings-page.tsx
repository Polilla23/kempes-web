import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Star, Search, Save, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlayerService } from '@/services/player.service'
import { SalaryRateService } from '@/services/salary-rate.service'
import type { Player, SalaryRate } from '@/types'

export default function PlayerRatingsPage() {
  const { t } = useTranslation('playerRatings')

  const [players, setPlayers] = useState<Player[]>([])
  const [salaryRates, setSalaryRates] = useState<SalaryRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Edits: playerId -> new overall
  const [edits, setEdits] = useState<Record<string, number>>({})

  // Filters
  const [search, setSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [playersRes, ratesRes] = await Promise.all([
        PlayerService.getPlayers(),
        SalaryRateService.getSalaryRates(),
      ])
      const active = (playersRes.players || [])
        .filter((p) => p.isActive)
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
      setPlayers(active)
      setSalaryRates(ratesRes.salaryRates || [])
    } catch {
      toast.error(t('error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique clubs for filter
  const clubs = useMemo(() => {
    const clubMap = new Map<string, string>()
    players.forEach((p) => {
      if (p.actualClub) {
        clubMap.set(p.actualClub.id, p.actualClub.name)
      }
    })
    return Array.from(clubMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [players])

  // Calculate salary for a given overall
  const getSalaryForOverall = (overall: number): number => {
    const rate = salaryRates.find(
      (r) => overall >= r.minOverall && overall <= r.maxOverall
    )
    return rate ? rate.salary : 100000
  }

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase())
      const matchesClub =
        selectedClub === 'all' || p.actualClub?.id === selectedClub
      return matchesSearch && matchesClub
    })
  }, [players, search, selectedClub])

  const pendingCount = Object.keys(edits).length

  const handleOverallChange = (playerId: string, value: string) => {
    const num = parseInt(value)
    if (isNaN(num)) return

    const clamped = Math.max(0, Math.min(99, num))
    const player = players.find((p) => p.id === playerId)
    if (!player) return

    // If same as current, remove edit
    if (clamped === (player.overall ?? 0)) {
      setEdits((prev) => {
        const next = { ...prev }
        delete next[playerId]
        return next
      })
    } else {
      setEdits((prev) => ({ ...prev, [playerId]: clamped }))
    }
  }

  const handleSave = async () => {
    if (pendingCount === 0) return

    try {
      setIsSaving(true)
      const updates = Object.entries(edits).map(([playerId, overall]) => ({
        playerId,
        overall,
      }))

      await PlayerService.bulkUpdateOveralls(updates)
      toast.success(t('success', { count: updates.length }))
      setEdits({})
      await loadData()
    } catch {
      toast.error(t('error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEdits({})
  }

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4 h-full max-w-5xl w-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full mt-8">
          <div className="flex items-center gap-3">
            <Star className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Filters + Actions */}
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t('search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterClub')}</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 ? (
              <Badge variant="secondary">
                {t('status.pendingChanges', { count: pendingCount })}
              </Badge>
            ) : (
              <Badge variant="outline">{t('status.noChanges')}</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={pendingCount === 0}
            >
              <Undo2 className="h-4 w-4 mr-1.5" />
              {t('actions.reset')}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={pendingCount === 0 || isSaving}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isSaving ? t('actions.saving') : t('actions.save')}
            </Button>
          </div>
        </div>

        {/* Table */}
        {filteredPlayers.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('empty')}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">{t('table.player')}</TableHead>
                  <TableHead>{t('table.club')}</TableHead>
                  <TableHead className="text-center w-[100px]">{t('table.currentOverall')}</TableHead>
                  <TableHead className="text-center w-[120px]">{t('table.newOverall')}</TableHead>
                  <TableHead className="text-right">{t('table.currentSalary')}</TableHead>
                  <TableHead className="text-right">{t('table.newSalary')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => {
                  const currentOverall = player.overall ?? 0
                  const hasEdit = player.id in edits
                  const newOverall = hasEdit ? edits[player.id] : currentOverall
                  const currentSalary = player.salary
                  const newSalary = hasEdit
                    ? getSalaryForOverall(newOverall)
                    : currentSalary
                  const salaryChanged = hasEdit && newSalary !== currentSalary

                  return (
                    <TableRow
                      key={player.id}
                      className={hasEdit ? 'bg-primary/5' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {player.fullName}
                          {hasEdit && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {t('status.modified')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {player.actualClub?.name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {currentOverall}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          className="h-8 w-20 text-center mx-auto"
                          value={newOverall}
                          onChange={(e) =>
                            handleOverallChange(player.id, e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatSalary(currentSalary)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          salaryChanged
                            ? newSalary > currentSalary
                              ? 'text-red-500 font-medium'
                              : 'text-green-500 font-medium'
                            : ''
                        }`}
                      >
                        {hasEdit ? formatSalary(newSalary) : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
