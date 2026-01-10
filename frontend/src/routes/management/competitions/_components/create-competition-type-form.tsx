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
import CompetitionTypeService, { type CompetitionTypeFormData } from '@/services/competition-type.service'
import { toast } from 'sonner'
import { Loader2, Plus, Tag } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

interface CreateCompetitionTypeFormProps {
  onSuccess?: () => void
}

const competitionTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  format: z.string().optional(),
  hierarchy: z.coerce.number().optional(),
  category: z.string().optional(),
})

const CreateCompetitionTypeForm = ({ onSuccess }: CreateCompetitionTypeFormProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof competitionTypeSchema>>({
    resolver: zodResolver(competitionTypeSchema),
    defaultValues: {
      name: '',
      format: '',
      hierarchy: undefined,
      category: '',
    },
  })

  async function onSubmit(values: z.infer<typeof competitionTypeSchema>) {
    try {
      setIsSubmitting(true)

      const data: CompetitionTypeFormData = {
        name: values.name,
        ...(values.format && { format: values.format }),
        ...(values.hierarchy !== undefined && { hierarchy: values.hierarchy }),
        ...(values.category && { category: values.category }),
      }

      await CompetitionTypeService.createCompetitionType(data)
      toast.success('Competition type created successfully!')

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating competition type:', error)
      toast.error(
        error instanceof Error ? error.message : 'An error occurred while creating the competition type.'
      )
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
          New Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Competition Type</DialogTitle>
          <DialogDescription>Add a new competition type to the system</DialogDescription>
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
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Create Type
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
