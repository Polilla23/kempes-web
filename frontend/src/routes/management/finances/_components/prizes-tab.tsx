import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Ellipsis, Pencil, Trash2, Trophy, Loader2 } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'
import { CompetitionTypeService, type CompetitionType } from '@/services/competition-type.service'
import type { CompetitionPrize, Club } from '@/types'
import api from '@/services/api'

interface PrizesTabProps {
  prizes: CompetitionPrize[]
  onRefresh: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PrizesTab({ prizes, onRefresh }: PrizesTabProps) {
  const { t } = useTranslation('finances')
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAwardOpen, setIsAwardOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState<CompetitionPrize | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create form state
  const [createForm, setCreateForm] = useState({
    competitionTypeId: '',
    position: 1,
    prizeAmount: 0,
    description: '',
  })

  // Award form state
  const [awardForm, setAwardForm] = useState({
    clubId: '',
    competitionTypeId: '',
    position: 1,
    description: '',
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    prizeAmount: 0,
    description: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ctRes, clubsRes] = await Promise.all([
          CompetitionTypeService.getCompetitionTypes(),
          api.get<{ data: Club[] }>('/api/v1/clubs'),
        ])
        setCompetitionTypes(ctRes.competitionTypes || [])
        setClubs(clubsRes.data?.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    try {
      setIsSubmitting(true)
      await FinanceService.createPrize(createForm)
      toast.success(t('prizes.create.success'))
      setIsCreateOpen(false)
      setCreateForm({ competitionTypeId: '', position: 1, prizeAmount: 0, description: '' })
      onRefresh()
    } catch (error) {
      toast.error(t('prizes.create.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingPrize) return
    try {
      setIsSubmitting(true)
      await FinanceService.updatePrize(editingPrize.id, editForm)
      toast.success(t('prizes.edit.success'))
      setEditingPrize(null)
      onRefresh()
    } catch (error) {
      toast.error(t('prizes.edit.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deletePrize(id)
      toast.success(t('prizes.delete.success'))
      onRefresh()
    } catch (error) {
      toast.error(t('prizes.delete.error'))
    }
  }

  const handleAward = async () => {
    try {
      setIsSubmitting(true)
      await FinanceService.awardPrize(awardForm)
      toast.success(t('prizes.award.success'))
      setIsAwardOpen(false)
      setAwardForm({ clubId: '', competitionTypeId: '', position: 1, description: '' })
      onRefresh()
    } catch (error) {
      toast.error(t('prizes.award.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const columnHelper = createColumnHelper<CompetitionPrize>()

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'competitionType',
        header: (info) => <DefaultHeader info={info} name={t('fields.competitionType')} type="string" />,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.competitionType?.name || '-'}</span>
        ),
      }),
      columnHelper.accessor('position', {
        header: (info) => <DefaultHeader info={info} name={t('prizes.position')} type="number" />,
        cell: (info) => {
          const pos = info.getValue()
          const variant = pos === 1 ? 'default' : pos === 2 ? 'secondary' : 'outline'
          return <Badge variant={variant}>#{pos}</Badge>
        },
      }),
      columnHelper.accessor('prizeAmount', {
        header: (info) => <DefaultHeader info={info} name={t('prizes.amount')} type="number" />,
        cell: (info) => (
          <span className="font-mono text-green-600 font-medium">{formatCurrency(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('description', {
        header: (info) => <DefaultHeader info={info} name={t('fields.description')} type="string" />,
        cell: (info) => <span className="text-muted-foreground">{info.getValue() || '-'}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-center cursor-default">{t('table.actions')}</span>,
        cell: ({ row }) => {
          const prize = row.original
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingPrize(prize)
                      setEditForm({
                        prizeAmount: prize.prizeAmount,
                        description: prize.description || '',
                      })
                    }}
                  >
                    <Pencil className="size-4" /> {t('prizes.edit.title')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(prize.id)}>
                    <Trash2 className="size-4 text-destructive" /> {t('prizes.delete.title')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [t]
  )

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Dialog open={isAwardOpen} onOpenChange={setIsAwardOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Trophy className="size-4 mr-1" /> {t('prizes.award.title')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('prizes.award.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>{t('fields.club')}</Label>
                <Select value={awardForm.clubId} onValueChange={(v) => setAwardForm({ ...awardForm, clubId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('labels.selectClub')} /></SelectTrigger>
                  <SelectContent>
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('fields.competitionType')}</Label>
                <Select value={awardForm.competitionTypeId} onValueChange={(v) => setAwardForm({ ...awardForm, competitionTypeId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('labels.selectCompetition')} /></SelectTrigger>
                  <SelectContent>
                    {competitionTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('fields.position')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={awardForm.position}
                  onChange={(e) => setAwardForm({ ...awardForm, position: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>{t('fields.description')}</Label>
                <Input
                  value={awardForm.description}
                  onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                  placeholder={t('placeholders.description')}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('buttons.cancel', { ns: 'common', defaultValue: 'Cancelar' })}</Button>
              </DialogClose>
              <Button onClick={handleAward} disabled={isSubmitting || !awardForm.clubId || !awardForm.competitionTypeId}>
                {isSubmitting ? <Loader2 className="animate-spin size-4" /> : t('prizes.award.title')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1" /> {t('buttons.createPrize')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('prizes.create.title')}</DialogTitle>
              <DialogDescription>{t('prizes.create.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>{t('fields.competitionType')}</Label>
                <Select value={createForm.competitionTypeId} onValueChange={(v) => setCreateForm({ ...createForm, competitionTypeId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('labels.selectCompetition')} /></SelectTrigger>
                  <SelectContent>
                    {competitionTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('fields.position')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={createForm.position}
                  onChange={(e) => setCreateForm({ ...createForm, position: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>{t('fields.amount')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={createForm.prizeAmount}
                  onChange={(e) => setCreateForm({ ...createForm, prizeAmount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>{t('fields.description')}</Label>
                <Input
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t('placeholders.description')}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('buttons.cancel', { ns: 'common', defaultValue: 'Cancelar' })}</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={isSubmitting || !createForm.competitionTypeId}>
                {isSubmitting ? <Loader2 className="animate-spin size-4" /> : t('buttons.createPrize')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Prize Dialog */}
      <Dialog open={!!editingPrize} onOpenChange={(open) => !open && setEditingPrize(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('prizes.edit.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('fields.amount')}</Label>
              <Input
                type="number"
                min={0}
                value={editForm.prizeAmount}
                onChange={(e) => setEditForm({ ...editForm, prizeAmount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>{t('fields.description')}</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('buttons.cancel', { ns: 'common', defaultValue: 'Cancelar' })}</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin size-4" /> : t('prizes.edit.title')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prizes Table */}
      <DataTable<CompetitionPrize, any> columns={columns} data={prizes} />
    </div>
  )
}
