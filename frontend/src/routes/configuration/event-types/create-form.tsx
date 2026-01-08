import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EventTypeService } from '@/services/event-type.service'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { EventTypeName } from '@/types'
import { useTranslation } from 'react-i18next'

interface CreateEventTypeFormProps {
  onSuccess?: () => void
}

const eventTypeOptions = [
  { value: EventTypeName.GOAL, label: 'Goal ⚽', icon: '⚽' },
  { value: EventTypeName.YELLOW_CARD, label: 'Yellow Card 🟨', icon: '🟨' },
  { value: EventTypeName.RED_CARD, label: 'Red Card 🟥', icon: '🟥' },
  { value: EventTypeName.INJURY, label: 'Injury 🤕', icon: '🤕' },
  { value: EventTypeName.MVP, label: 'MVP 🌟', icon: '🌟' },
]

const CreateEventTypeForm = ({ onSuccess }: CreateEventTypeFormProps) => {
  const { t } = useTranslation('eventTypes')
  const [open, setOpen] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.EventTypeSchema>>({
    resolver: zodResolver(FormSchemas.EventTypeSchema),
    defaultValues: {
      name: EventTypeName.GOAL,
      displayName: '',
      icon: '⚽',
      isActive: true,
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchemas.EventTypeSchema>) {
    try {
      setVerificationStatus('loading')

      await EventTypeService.createEventType({
        name: values.name,
        displayName: values.displayName,
        icon: values.icon,
        isActive: values.isActive,
      })
      toast.success(t('create.success'))

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating event type:', error)
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

  const handleEventTypeChange = (value: string) => {
    const selectedOption = eventTypeOptions.find((opt) => opt.value === value)
    if (selectedOption) {
      form.setValue('name', value as EventTypeName)
      form.setValue('icon', selectedOption.icon)
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
                  <FormLabel>{t('labels.eventType')}</FormLabel>
                  <Select onValueChange={handleEventTypeChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder={t('placeholders.selectEventType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypeOptions.map((option) => (
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
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.displayName')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('placeholders.displayName')}
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('labels.icon')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('placeholders.icon')}
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="select-none">{t('labels.isActive')}</FormLabel>
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
                    {t('create.creating')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="size-4" />
                    {t('create.action')}
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

export default CreateEventTypeForm