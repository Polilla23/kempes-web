import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { SeasonService } from '@/services/season.service'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CreateSeasonFormProps {
  onSuccess?: () => void
}

const CreateSeasonForm = ({ onSuccess }: CreateSeasonFormProps) => {
  const { t } = useTranslation('seasons')
  const [open, setOpen] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.SeasonSchema>>({
    resolver: zodResolver(FormSchemas.SeasonSchema),
    defaultValues: {
      number: 1,
      isActive: false,
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchemas.SeasonSchema>) {
    try {
      setVerificationStatus('loading')

      await SeasonService.createSeason({
        number: values.number,
        isActive: values.isActive,
      })
      toast.success(t('create.success'))

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating season:', error)
      toast.error(error instanceof Error ? error.message : t('create.error'))
      setVerificationStatus('error')
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form and states when closing
      form.reset()
      setVerificationStatus(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          {t('create.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('create.title')}</DialogTitle>
          <DialogDescription>{t('create.description')}</DialogDescription>
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
                      {t('create.activeDescription')}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                type="submit"
                disabled={verificationStatus === 'loading'}
              >
                {verificationStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('status.creating')}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('buttons.create')}
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

export default CreateSeasonForm