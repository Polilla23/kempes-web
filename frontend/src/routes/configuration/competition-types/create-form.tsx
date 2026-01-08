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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CompetitionTypeService } from '@/services/competition-type.service'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CreateCompetitionTypeFormProps {
  onSuccess?: () => void
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

const CreateCompetitionTypeForm = ({ onSuccess }: CreateCompetitionTypeFormProps) => {
  const { t } = useTranslation('competitionTypes')
  const [open, setOpen] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const formatOptions = [
    { value: 'LEAGUE', label: t('formats.LEAGUE') },
    { value: 'CUP', label: t('formats.CUP') },
  ]

  const form = useForm<z.infer<typeof FormSchemas.CompetitionTypeSchema>>({
    resolver: zodResolver(FormSchemas.CompetitionTypeSchema),
    defaultValues: {
      name: undefined,
      category: undefined,
      format: undefined,
      hierarchy: 1,
    },
  })

  // Auto-set format and hierarchy based on competition name
  const handleNameChange = (value: string) => {
    form.setValue('name', value as any)
    
    // If it's a LEAGUE, auto-set format to LEAGUE
    if (value.startsWith('LEAGUE_')) {
      form.setValue('format', 'LEAGUE')
      
      // Auto-set hierarchy based on league letter
      const hierarchyMap: Record<string, number> = {
        'LEAGUE_A': 1,
        'LEAGUE_B': 2,
        'LEAGUE_C': 3,
        'LEAGUE_D': 4,
        'LEAGUE_E': 5,
      }
      form.setValue('hierarchy', hierarchyMap[value] || 1)
    } else {
      // If it's a CUP, reset format and hierarchy to defaults
      form.setValue('format', undefined as any)
      form.setValue('hierarchy', 1)
    }
  }

  async function onSubmit(values: z.infer<typeof FormSchemas.CompetitionTypeSchema>) {
    try {
      setVerificationStatus('loading')

      await CompetitionTypeService.createCompetitionType({
        name: values.name,
        category: values.category,
        format: values.format,
        hierarchy: values.hierarchy,
      })
      toast.success(t('create.success'))

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating competition type:', error)
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.name')}</FormLabel>
                  <Select onValueChange={handleNameChange} value={field.value}>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={form.watch('name')?.startsWith('LEAGUE_')}
                  >
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
                      disabled={form.watch('name')?.startsWith('LEAGUE_')}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
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
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {t('status.creating')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="size-4" />
                    {t('buttons.create')}
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

export default CreateCompetitionTypeForm