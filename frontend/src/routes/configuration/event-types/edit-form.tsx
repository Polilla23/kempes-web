import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventTypeService } from '@/services/event-type.service'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import type { EventType } from '@/types'
import { EventTypeName } from '@/types'
import { useTranslation } from 'react-i18next'

interface EditEventTypeFormProps {
  onSuccess?: () => void
  onClose?: () => void
  eventType: EventType
}

const eventTypeOptions = [
  { value: EventTypeName.GOAL, label: 'Goal ⚽', icon: '⚽' },
  { value: EventTypeName.YELLOW_CARD, label: 'Yellow Card 🟨', icon: '🟨' },
  { value: EventTypeName.RED_CARD, label: 'Red Card 🟥', icon: '🟥' },
  { value: EventTypeName.INJURY, label: 'Injury 🤕', icon: '🤕' },
  { value: EventTypeName.MVP, label: 'MVP 🌟', icon: '🌟' },
]

function EditEventTypeForm({ onSuccess, onClose, eventType }: EditEventTypeFormProps) {
  const { t } = useTranslation('eventTypes')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.EventTypeSchema>>({
    resolver: zodResolver(FormSchemas.EventTypeSchema),
    defaultValues: {
      name: eventType.name || EventTypeName.GOAL,
      displayName: eventType.displayName || '',
      icon: eventType.icon || '⚽',
      isActive: eventType.isActive ?? true,
    },
  })

  // Reset form when eventType changes
  useEffect(() => {
    if (eventType) {
      form.reset({
        name: eventType.name || EventTypeName.GOAL,
        displayName: eventType.displayName || '',
        icon: eventType.icon || '⚽',
        isActive: eventType.isActive ?? true,
      })
    }
  }, [eventType, form])

  async function onSubmit(values: z.infer<typeof FormSchemas.EventTypeSchema>) {
    try {
      setVerificationStatus('loading')

      await EventTypeService.updateEventType(eventType.id, {
        name: values.name,
        displayName: values.displayName,
        icon: values.icon,
        isActive: values.isActive,
      })
      setVerificationStatus('success')
      toast.success(t('edit.success'))
      onSuccess?.()
    } catch (error) {
      console.error('Error updating event type:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : t('edit.error'))
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
    <Dialog open={!!eventType} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.eventType')}</FormLabel>
                  <Select onValueChange={handleEventTypeChange} defaultValue={field.value} value={field.value}>
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
                    {t('edit.updating')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="size-4" />
                    {t('edit.button')}
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

export default EditEventTypeForm