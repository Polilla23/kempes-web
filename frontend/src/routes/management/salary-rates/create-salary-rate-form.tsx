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
  DialogClose,
} from '@/components/ui/dialog'
import { SalaryRateService } from '@/services/salary-rate.service'
import { toast } from 'sonner'
import { Loader2, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import type { RegisterSalaryRateFormData } from '@/types'
import { useTranslation } from 'react-i18next'

interface CreateSalaryRateFormProps {
  onSuccess?: () => void
}

const salaryRateSchema = z.object({
  minOverall: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
  maxOverall: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
  salary: z.coerce.number().min(100000, 'El salario debe ser mayor o igual a 100.000'),
}).refine((data) => data.minOverall <= data.maxOverall, {
  message: 'La media mínima debe ser menor o igual que la media máxima',
  path: ['maxOverall'],
})

const CreateSalaryRateForm = ({ onSuccess }: CreateSalaryRateFormProps) => {
  const { t } = useTranslation('salaryRates')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof salaryRateSchema>>({
    resolver: zodResolver(salaryRateSchema),
    defaultValues: {
      minOverall: 0,
      maxOverall: 0,
      salary: 100000,
    },
  })

  async function onSubmit(values: z.infer<typeof salaryRateSchema>) {
    try {
      setIsSubmitting(true)

      const salaryRateData: RegisterSalaryRateFormData = {
        minOverall: values.minOverall,
        maxOverall: values.maxOverall,
        salary: values.salary,
      }

      await SalaryRateService.createSalaryRate(salaryRateData)
      toast.success(t('create.success'))

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating salary rate:', error)
      toast.error(t('create.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
      setIsSubmitting(false)
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
            {/* Min Overall Field */}
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

            {/* Max Overall Field */}
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

            {/* Salary Field */}
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
                    {t('buttons.creating')}
                  </>
                ) : (
                  t('buttons.create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSalaryRateForm
