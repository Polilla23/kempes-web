import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  CalendarClock,
  Plus,
  Trash2,
  ChevronLeft,
  Check,
  Clock,
  AlertTriangle,
  Zap,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SeasonService } from '@/services/season.service'
import { SeasonDeadlineService } from '@/services/season-deadline.service'
import type { Season, SeasonDeadline, DeadlineType } from '@/types'

export const Route = createFileRoute('/configuration/seasons/deadlines')({
  component: DeadlinesPage,
})

const DEADLINE_TYPES: DeadlineType[] = [
  'TRANSFER_MARKET',
  'COVID_REDRAW',
  'MATCH_SCHEDULE',
  'INSTALLMENT_DUE',
  'SEASON_CLOSE',
  'CUSTOM',
]

const DEADLINE_TYPE_COLORS: Record<DeadlineType, string> = {
  TRANSFER_MARKET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COVID_REDRAW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  MATCH_SCHEDULE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  INSTALLMENT_DUE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  SEASON_CLOSE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  CUSTOM: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

function DeadlinesPage() {
  const { t } = useTranslation('seasonDeadlines')
  const { t: tSeasons } = useTranslation('seasons')
  const navigate = useNavigate()

  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('')
  const [deadlines, setDeadlines] = useState<SeasonDeadline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<SeasonDeadline | null>(null)

  // Form state
  const [formType, setFormType] = useState<DeadlineType>('TRANSFER_MARKET')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState('')

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeasonId) {
      fetchDeadlines(selectedSeasonId)
    }
  }, [selectedSeasonId])

  const fetchSeasons = async () => {
    try {
      const response = await SeasonService.getSeasons()
      const sorted = (response.seasons || []).sort((a, b) => b.number - a.number)
      setSeasons(sorted)
      // Auto-select active season
      const active = sorted.find((s) => s.isActive)
      if (active) setSelectedSeasonId(active.id)
      else if (sorted.length > 0) setSelectedSeasonId(sorted[0].id)
    } catch {
      toast.error(tSeasons('list.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDeadlines = async (seasonId: string) => {
    try {
      const data = await SeasonDeadlineService.getBySeasonId(seasonId)
      setDeadlines(data)
    } catch {
      toast.error(t('error.fetch'))
    }
  }

  const handleCreate = async () => {
    try {
      if (editingDeadline) {
        await SeasonDeadlineService.update(editingDeadline.id, {
          title: formTitle,
          description: formDescription || undefined,
          date: formDate,
        })
        toast.success(t('success.updated'))
      } else {
        await SeasonDeadlineService.create({
          seasonId: selectedSeasonId,
          type: formType,
          title: formTitle,
          description: formDescription || undefined,
          date: formDate,
        })
        toast.success(t('success.created'))
      }
      resetForm()
      setIsCreateOpen(false)
      setEditingDeadline(null)
      fetchDeadlines(selectedSeasonId)
    } catch {
      toast.error(editingDeadline ? t('error.update') : t('error.create'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await SeasonDeadlineService.delete(id)
      toast.success(t('delete.success'))
      fetchDeadlines(selectedSeasonId)
    } catch {
      toast.error(t('delete.error'))
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await SeasonDeadlineService.toggleCompleted(id)
      toast.success(t('success.toggled'))
      fetchDeadlines(selectedSeasonId)
    } catch {
      toast.error(t('error.update'))
    }
  }

  const handleQuickCreate = async () => {
    const today = new Date()
    const defaultDeadlines = DEADLINE_TYPES.filter((t) => t !== 'CUSTOM').map((type, i) => ({
      type,
      title: t(`types.${type}`),
      date: new Date(today.getFullYear(), today.getMonth() + i + 1, 1).toISOString(),
    }))

    try {
      const result = await SeasonDeadlineService.bulkCreate({
        seasonId: selectedSeasonId,
        deadlines: defaultDeadlines,
      })
      toast.success(t('quickCreate.success', { count: result.count }))
      fetchDeadlines(selectedSeasonId)
    } catch {
      toast.error(t('error.create'))
    }
  }

  const openEdit = (deadline: SeasonDeadline) => {
    setEditingDeadline(deadline)
    setFormType(deadline.type)
    setFormTitle(deadline.title)
    setFormDescription(deadline.description || '')
    setFormDate(deadline.date.split('T')[0])
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setFormType('TRANSFER_MARKET')
    setFormTitle('')
    setFormDescription('')
    setFormDate('')
    setEditingDeadline(null)
  }

  const getDeadlineStatus = (deadline: SeasonDeadline) => {
    if (deadline.isCompleted) return 'completed'
    const now = new Date()
    const deadlineDate = new Date(deadline.date)
    if (deadlineDate < now) return 'overdue'
    return 'pending'
  }

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4 h-full max-w-4xl w-full px-4">
        {/* Header */}
        <div className="flex items-center gap-3 w-full mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/configuration/seasons/' })}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CalendarClock className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        {/* Season selector + Actions */}
        <div className="flex items-center justify-between w-full gap-3">
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={tSeasons('fields.seasonLabel', { number: '...' })} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {tSeasons('fields.seasonLabel', { number: s.number })}
                  {s.isActive && ` (${tSeasons('status.active')})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {deadlines.length === 0 && (
              <Button variant="outline" onClick={handleQuickCreate}>
                <Zap className="mr-2 h-4 w-4" />
                {t('quickCreate.button')}
              </Button>
            )}
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('create.button')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDeadline ? t('edit.title') : t('create.title')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDeadline ? t('edit.description') : t('create.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {!editingDeadline && (
                    <div className="grid gap-2">
                      <Label>{t('fields.type')}</Label>
                      <Select
                        value={formType}
                        onValueChange={(v) => {
                          setFormType(v as DeadlineType)
                          if (!formTitle) setFormTitle(t(`types.${v}`))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEADLINE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`types.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>{t('fields.title')}</Label>
                    <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('fields.description')}</Label>
                    <Input
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('fields.date')}</Label>
                    <Input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm() }}>
                    {tSeasons('buttons.cancel')}
                  </Button>
                  <Button onClick={handleCreate} disabled={!formTitle || !formDate}>
                    {editingDeadline ? tSeasons('buttons.update') : tSeasons('buttons.create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Deadlines list */}
        {deadlines.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('empty')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full space-y-3 mb-8">
            {deadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline)
              return (
                <Card
                  key={deadline.id}
                  className={`w-full transition-all ${
                    status === 'completed'
                      ? 'opacity-60'
                      : status === 'overdue'
                        ? 'border-destructive/50'
                        : ''
                  }`}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {/* Toggle button */}
                      <button
                        onClick={() => handleToggle(deadline.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          status === 'completed'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {status === 'completed' && <Check className="h-4 w-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${status === 'completed' ? 'line-through' : ''}`}
                          >
                            {deadline.title}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              DEADLINE_TYPE_COLORS[deadline.type]
                            }`}
                          >
                            {t(`types.${deadline.type}`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {new Date(deadline.date).toLocaleDateString()}
                          </span>
                          {deadline.description && (
                            <span className="text-sm text-muted-foreground">
                              — {deadline.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === 'overdue' && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('status.overdue')}
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {t('status.pending')}
                        </Badge>
                      )}
                      {status === 'completed' && (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          {t('status.completed')}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(deadline)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(deadline.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeadlinesPage
