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
import { Checkbox } from '@/components/ui/checkbox'
import { SeasonService } from '@/services/season.service'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import type { Season } from '@/types'
import { useTranslation } from 'react-i18next'

interface EditSeasonFormProps {
  onSuccess?: () => void
  onClose?: () => void
  season: Season
}

function EditSeasonForm({ onSuccess, onClose, season }: EditSeasonFormProps) {
  const { t } = useTranslation('seasons')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.SeasonSchema>>({
    resolver: zodResolver(FormSchemas.SeasonSchema),
    defaultValues: {
      number: season.number || 1,
      isActive: season.isActive ?? false,
    },
  })

  // Reset form when season changes
  useEffect(() => {
    if (season) {
      form.reset({
        number: season.number || 1,
        isActive: season.isActive ?? false,
      })
    }
  }, [season, form])

  async function onSubmit(values: z.infer<typeof FormSchemas.SeasonSchema>) {
    try {
      setVerificationStatus('loading')

      await SeasonService.updateSeason(season.id, {
        number: values.number,
        isActive: values.isActive,
      })
      setVerificationStatus('success')
      toast.success(t('edit.success'))
      onSuccess?.()
    } catch (error) {
      console.error('Error updating season:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : t('edit.error'))
    }
  }

  return (
    <Dialog open={!!season} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.seasonNumber')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={t('placeholders.seasonNumber')}
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="select-none">{t('labels.isActive')}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t('edit.activeDescription')}
                    </p>
                  </div>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('status.updating')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('buttons.update')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSeasonForm