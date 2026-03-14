import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X, Loader2 } from 'lucide-react'
import type { PlazoDTO } from '@/services/plazo.service'
import type { Competition } from '@/services/competition.service'

const KNOCKOUT_ROUNDS = [
  'ROUND_OF_64',
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTERFINAL',
  'SEMIFINAL',
  'FINAL',
  'THIRD_PLACE',
  'LIGUILLA',
  'TRIANGULAR_SEMI',
  'TRIANGULAR_FINAL',
  'PLAYOUT',
  'PROMOTION',
  'REDUCIDO_QUARTER',
  'REDUCIDO_SEMI',
  'REDUCIDO_FINAL',
]

interface ScopeForm {
  competitionId: string
  matchdayFrom: string
  matchdayTo: string
  knockoutRounds: string[]
}

interface PlazoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPlazo: PlazoDTO | null
  competitions: Competition[]
  isSubmitting?: boolean
  onSubmit: (data: {
    title: string
    deadline: string
    order: number
    isOpen?: boolean
    scopes: Array<{
      competitionId: string
      matchdayFrom?: number | null
      matchdayTo?: number | null
      knockoutRounds?: string[]
    }>
  }) => void
}

export function PlazoFormDialog({
  open,
  onOpenChange,
  editingPlazo,
  competitions,
  isSubmitting = false,
  onSubmit,
}: PlazoFormDialogProps) {
  const { t } = useTranslation('plazos')

  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [order, setOrder] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [scopes, setScopes] = useState<ScopeForm[]>([])

  useEffect(() => {
    if (editingPlazo) {
      setTitle(editingPlazo.title)
      setDeadline(editingPlazo.deadline.split('T')[0])
      setOrder(editingPlazo.order)
      setIsOpen(editingPlazo.isOpen ?? false)
      setScopes(
        editingPlazo.scopes.map((s) => ({
          competitionId: s.competitionId,
          matchdayFrom: s.matchdayFrom?.toString() || '',
          matchdayTo: s.matchdayTo?.toString() || '',
          knockoutRounds: s.knockoutRounds || [],
        }))
      )
    } else {
      setTitle('')
      setDeadline('')
      setOrder(1)
      setIsOpen(false)
      setScopes([])
    }
  }, [editingPlazo, open])

  const addScope = () => {
    setScopes([...scopes, { competitionId: '', matchdayFrom: '', matchdayTo: '', knockoutRounds: [] }])
  }

  const removeScope = (index: number) => {
    setScopes(scopes.filter((_, i) => i !== index))
  }

  const updateScope = (index: number, field: keyof ScopeForm, value: any) => {
    const updated = [...scopes]
    updated[index] = { ...updated[index], [field]: value }
    setScopes(updated)
  }

  const toggleKnockoutRound = (index: number, round: string) => {
    const updated = [...scopes]
    const current = updated[index].knockoutRounds
    updated[index] = {
      ...updated[index],
      knockoutRounds: current.includes(round)
        ? current.filter((r) => r !== round)
        : [...current, round],
    }
    setScopes(updated)
  }

  const getCompetitionSystem = (compId: string) => {
    const comp = competitions.find((c) => c.id === compId)
    return comp?.system || 'ROUND_ROBIN'
  }

  const handleSubmit = () => {
    onSubmit({
      title,
      deadline,
      order,
      isOpen,
      scopes: scopes
        .filter((s) => s.competitionId)
        .map((s) => ({
          competitionId: s.competitionId,
          matchdayFrom: s.matchdayFrom ? parseInt(s.matchdayFrom) : null,
          matchdayTo: s.matchdayTo ? parseInt(s.matchdayTo) : null,
          knockoutRounds: s.knockoutRounds.length > 0 ? s.knockoutRounds : undefined,
        })),
    })
  }

  const usedCompetitionIds = scopes.map((s) => s.competitionId).filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlazo ? t('edit.title') : t('create.title')}
          </DialogTitle>
          <DialogDescription>
            {editingPlazo ? t('edit.description') : t('create.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label>{t('fields.title')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('fields.titlePlaceholder')}
            />
          </div>

          {/* Deadline + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('fields.deadline')}</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('fields.order')}</Label>
              <Input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">{t('fields.orderHelp')}</p>
            </div>
          </div>

          {/* Is Open */}
          {!editingPlazo && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOpen"
                checked={isOpen}
                onCheckedChange={(checked) => setIsOpen(checked === true)}
              />
              <Label htmlFor="isOpen" className="text-sm font-normal cursor-pointer">
                {t('form.isOpen')}
              </Label>
            </div>
          )}

          {/* Scopes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('scopes.title')}</Label>
              <Button variant="outline" size="sm" onClick={addScope}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t('scopes.add')}
              </Button>
            </div>

            {scopes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">{t('scopes.empty')}</p>
            )}

            {scopes.map((scope, index) => {
              const system = getCompetitionSystem(scope.competitionId)
              return (
                <div key={index} className="border rounded-lg p-3 space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2"
                    onClick={() => removeScope(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>

                  {/* Competition selector */}
                  <div className="grid gap-1.5">
                    <Label className="text-xs">{t('scopes.competition')}</Label>
                    <Select
                      value={scope.competitionId}
                      onValueChange={(v) => updateScope(index, 'competitionId', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={t('scopes.selectCompetition')} />
                      </SelectTrigger>
                      <SelectContent>
                        {competitions
                          .filter(
                            (c) => c.id === scope.competitionId || !usedCompetitionIds.includes(c.id)
                          )
                          .map((comp) => (
                            <SelectItem key={comp.id} value={comp.id}>
                              {comp.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {scope.competitionId && system === 'ROUND_ROBIN' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">{t('scopes.matchdayFrom')}</Label>
                        <Input
                          type="number"
                          min={1}
                          className="h-8 text-xs"
                          value={scope.matchdayFrom}
                          onChange={(e) => updateScope(index, 'matchdayFrom', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">{t('scopes.matchdayTo')}</Label>
                        <Input
                          type="number"
                          min={1}
                          className="h-8 text-xs"
                          value={scope.matchdayTo}
                          onChange={(e) => updateScope(index, 'matchdayTo', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {scope.competitionId && system === 'KNOCKOUT' && (
                    <div className="grid gap-1.5">
                      <Label className="text-xs">{t('scopes.knockoutRounds')}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {KNOCKOUT_ROUNDS.map((round) => (
                          <Badge
                            key={round}
                            variant={scope.knockoutRounds.includes(round) ? 'default' : 'outline'}
                            className="cursor-pointer text-[10px]"
                            onClick={() => toggleKnockoutRound(index, round)}
                          >
                            {t(`knockoutRounds.${round}` as any)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !deadline || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {editingPlazo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
