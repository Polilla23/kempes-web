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
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

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
      toast.success('Competition type updated successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating competition type:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : 'Failed to update competition type')
    }
  }

  return (
    <Dialog open={!!competitionType} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Competition Type</DialogTitle>
          <DialogDescription>
            Make changes to the competition type here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Competition Name</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select competition name" />
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
                  <FormLabel className="select-none">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select category" />
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
                  <FormLabel className="select-none">Format</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
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
                  <FormLabel className="select-none">Hierarchy</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter hierarchy (e.g., 1, 2, 3)"
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
                  Cancel
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
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="size-4" />
                    Update Competition Type
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