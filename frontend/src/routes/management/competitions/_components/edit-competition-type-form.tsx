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
import CompetitionTypeService, {
  type CompetitionType,
  type CompetitionTypeFormData,
} from '@/services/competition-type.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Tag } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface EditCompetitionTypeFormProps {
  onSuccess?: () => void
  onClose?: () => void
  competitionType: CompetitionType
}

const competitionTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  format: z.string().optional(),
  hierarchy: z.coerce.number().optional(),
  category: z.string().optional(),
})

function EditCompetitionTypeForm({ onSuccess, onClose, competitionType }: EditCompetitionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof competitionTypeSchema>>({
    resolver: zodResolver(competitionTypeSchema),
    defaultValues: {
      name: competitionType.name || '',
      format: competitionType.format || '',
      hierarchy: competitionType.hierarchy,
      category: competitionType.category || '',
    },
  })

  async function onSubmit(values: z.infer<typeof competitionTypeSchema>) {
    try {
      setIsSubmitting(true)

      const updateData: CompetitionTypeFormData = {
        name: values.name,
        ...(values.format && { format: values.format }),
        ...(values.hierarchy !== undefined && { hierarchy: values.hierarchy }),
        ...(values.category && { category: values.category }),
      }

      await CompetitionTypeService.updateCompetitionType(competitionType.id, updateData)
      toast.success('Competition type updated successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating competition type:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update competition type')
    } finally {
      setIsSubmitting(false)
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
                  <FormLabel className="select-none">Name</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <Tag className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="text"
                        placeholder="e.g., LEAGUE, CUP"
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
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Format (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., SINGLE_ELIMINATION, ROUND_ROBIN"
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
              name="hierarchy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Hierarchy (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 1, 2, 3"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Category (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., SENIOR, JUNIOR"
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Save Changes
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
