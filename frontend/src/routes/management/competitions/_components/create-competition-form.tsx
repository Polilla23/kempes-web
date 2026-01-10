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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import CompetitionService, { type CompetitionFormData } from '@/services/competition.service'
import type { CompetitionType } from '@/services/competition-type.service'
import { toast } from 'sonner'
import { Loader2, Plus, Trophy } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

interface CreateCompetitionFormProps {
  competitionTypes: CompetitionType[]
  onSuccess?: () => void
}

const competitionSchema = z.object({
  name: z.string().min(3, 'Competition name must be at least 3 characters'),
  typeId: z.string().min(1, 'Please select a competition type'),
  seasonId: z.string().min(1, 'Season is required'),
  isActive: z.boolean(),
})

const CreateCompetitionForm = ({ competitionTypes, onSuccess }: CreateCompetitionFormProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof competitionSchema>>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: '',
      typeId: '',
      seasonId: '',
      isActive: true,
    },
  })

  async function onSubmit(values: z.infer<typeof competitionSchema>) {
    try {
      setIsSubmitting(true)

      const competitionData: CompetitionFormData = {
        name: values.name,
        typeId: values.typeId,
        seasonId: values.seasonId,
        isActive: values.isActive,
      }

      await CompetitionService.createCompetition(competitionData)
      toast.success('Competition created successfully!')

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating competition:', error)
      toast.error(
        error instanceof Error ? error.message : 'An error occurred while creating the competition.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      form.reset()
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          New Competition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Competition</DialogTitle>
          <DialogDescription>Add a new competition to the system</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Competition Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Competition Name</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <Trophy className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter competition name"
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competition Type Field */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Competition Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select competition type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {competitionTypes.length === 0 ? (
                        <SelectItem value="no-types" disabled>
                          No competition types available
                        </SelectItem>
                      ) : (
                        competitionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Season Field */}
            <FormField
              control={form.control}
              name="seasonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Season</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 2024, 2024/2025"
                      className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Active Competition
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Allow this competition to be used for fixtures and matches
                    </p>
                  </div>
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
                    <Trophy className="size-4" />
                    Create Competition
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

export default CreateCompetitionForm
