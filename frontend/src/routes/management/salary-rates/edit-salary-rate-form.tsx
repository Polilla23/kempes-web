import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SalaryRateService } from '@/services/salary-rate.service'
import type { SalaryRate } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

interface EditSalaryRateFormProps {
  onSuccess?: () => void
  onClose?: () => void
  salaryRate: SalaryRate
}

const salaryRateSchema = z.object({
  minOverall: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
  maxOverall: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
  salary: z.coerce.number().min(100000, 'El salario debe ser mayor o igual a 100.000'),
}).refine((data) => data.minOverall <= data.maxOverall, {
  message: 'La media mínima debe ser menor o igual que la media máxima',
  path: ['maxOverall'],
})

function EditSalaryRateForm({ onSuccess, onClose, salaryRate }: EditSalaryRateFormProps) {
  const { t } = useTranslation('salaryRates')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof salaryRateSchema>>({
    resolver: zodResolver(salaryRateSchema),
    defaultValues: {
      minOverall: salaryRate.minOverall,
      maxOverall: salaryRate.maxOverall,
      salary: salaryRate.salary,
    },
  })

  async function onSubmit(values: z.infer<typeof salaryRateSchema>) {
    try {
      setIsSubmitting(true)

      const updateData = {
        minOverall: values.minOverall,
        maxOverall: values.maxOverall,
        salary: values.salary,
      }

      await SalaryRateService.updateSalaryRate(salaryRate.id, updateData)
      toast.success(t('edit.success'))
      onSuccess?.()
    } catch (error) {
      console.error('Error updating salary rate:', error)
      toast.error(t('edit.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={!!salaryRate} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="minOverall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.minOverall')}</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <TrendingDown className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="number"
                        placeholder={t('placeholders.minOverall')}
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxOverall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.maxOverall')}</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <TrendingUp className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="number"
                        placeholder={t('placeholders.maxOverall')}
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.salary')}</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <DollarSign className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="number"
                        placeholder={t('placeholders.salary')}
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {t('buttons.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('buttons.updating')}
                  </>
                ) : (
                  t('buttons.update')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSalaryRateForm
