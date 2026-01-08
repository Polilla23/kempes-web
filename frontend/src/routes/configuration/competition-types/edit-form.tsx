import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CompetitionTypeService } from '@/services/competition-type.service'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import type { CompetitionType } from '@/types'
import { useTranslation } from 'react-i18next'

interface EditCompetitionTypeFormProps {
  onSuccess?: () => void
  onClose?: () => void
  competitionType: CompetitionType
}

const COMPETITION_NAME_OPTIONS = [
  { value: 'LEAGUE_A', label: 'League A' },
  { value: 'LEAGUE_B', label: 'League B' },
  { value: 'LEAGUE_C', label: 'League C' },
  { value: 'LEAGUE_D', label: 'League D' },
  { value: 'LEAGUE_E', label: 'League E' },
  { value: 'KEMPES_CUP', label: 'Kempes Cup' },
  { value: 'GOLD_CUP', label: 'Gold Cup' },
  { value: 'SILVER_CUP', label: 'Silver Cup' },
  { value: 'CINDOR_CUP', label: 'Cindor Cup' },
  { value: 'SUPER_CUP', label: 'Super Cup' },
]

const CATEGORY_OPTIONS = [
  { value: 'SENIOR', label: 'Senior' },
  { value: 'KEMPESITA', label: 'Kempesita' },
]

const FORMAT_OPTIONS = [
  { value: 'LEAGUE', label: 'League (Round Robin)' },
  { value: 'CUP', label: 'Cup (Knockout)' },
]

function EditCompetitionTypeForm({ onSuccess, onClose, competitionType }: EditCompetitionTypeFormProps) {
  const { t } = useTranslation('competitionTypes')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const formatOptions = [
    { value: 'LEAGUE', label: t('formats.LEAGUE') },
    { value: 'CUP', label: t('formats.CUP') },
  ]

  const form = useForm<z.infer<typeof FormSchemas.CompetitionTypeSchema>>({
    resolver: zodResolver(FormSchemas.CompetitionTypeSchema),
    defaultValues: {
      name: competitionType.name as any,
      category: competitionType.category as any,
      format: competitionType.format as any,
      hierarchy: competitionType.hierarchy || 1,
    },
  })

  // Reset form when competitionType changes
  useEffect(() => {
    if (competitionType) {
      form.reset({
        name: competitionType.name as any,
        category: competitionType.category as any,
        format: competitionType.format as any,
        hierarchy: competitionType.hierarchy || 1,
      })
    }
  }, [competitionType, form])

  async function onSubmit(values: z.infer<typeof FormSchemas.CompetitionTypeSchema>) {
    try {
      setVerificationStatus('loading')

      await CompetitionTypeService.updateCompetitionType(competitionType.id, {
        name: values.name,
        category: values.category,
        format: values.format,
        hierarchy: values.hierarchy,
      })
      setVerificationStatus('success')
      toast.success(t('edit.success'))
      onSuccess?.()
    } catch (error) {
      console.error('Error updating competition type:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : t('edit.error'))
    }
  }

  return (
    <Dialog open={!!competitionType} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('edit.title')}</DialogTitle>
          <DialogDescription>
            {t('edit.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.name')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder={t('placeholders.name')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPETITION_NAME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.category')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder={t('placeholders.category')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.format')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder={t('placeholders.format')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hierarchy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.hierarchy')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={t('placeholders.hierarchy')}
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('buttons.cancel')}
                </Button>
              </DialogClose>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200"
                type="submit"
                disabled={verificationStatus === 'loading'}
              >
                {verificationStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {t('status.updating')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="size-4" />
                    {t('buttons.update')}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCompetitionTypeForm