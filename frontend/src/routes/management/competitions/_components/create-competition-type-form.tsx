import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { CompetitionTypeService, type CompetitionTypeFormData } from '@/services/competition-type.service'
import { toast } from 'sonner'
import { Loader2, Plus, Tag } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

interface CreateCompetitionTypeFormProps {
  onSuccess?: () => void
}

// Enum values from Prisma schema
const COMPETITION_NAMES = [
  'LEAGUE_A', 'LEAGUE_B', 'LEAGUE_C', 'LEAGUE_D', 'LEAGUE_E',
  'KEMPES_CUP', 'GOLD_CUP', 'SILVER_CUP', 'CINDOR_CUP', 'SUPER_CUP', 'PROMOTIONS',
] as const

const COMPETITION_FORMATS = ['LEAGUE', 'CUP'] as const
const COMPETITION_CATEGORIES = ['SENIOR', 'KEMPESITA', 'MIXED'] as const

// Labels amigables para la UI
import {
  NAME_LABELS,
  FORMAT_LABELS,
  CATEGORY_LABELS,
} from '@/lib/competition-labels'

const competitionTypeSchema = z.object({
  name: z.enum(COMPETITION_NAMES, { required_error: 'Seleccioná un nombre' }),
  format: z.enum(COMPETITION_FORMATS, { required_error: 'Seleccioná un formato' }),
  hierarchy: z.coerce.number().min(1, 'La jerarquía debe ser al menos 1'),
  category: z.enum(COMPETITION_CATEGORIES, { required_error: 'Seleccioná una categoría' }),
})

const CreateCompetitionTypeForm = ({ onSuccess }: CreateCompetitionTypeFormProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof competitionTypeSchema>>({
    resolver: zodResolver(competitionTypeSchema),
    defaultValues: {
      name: undefined,
      format: undefined,
      hierarchy: undefined,
      category: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof competitionTypeSchema>) {
    try {
      setIsSubmitting(true)

      const data: CompetitionTypeFormData = {
        name: values.name,
        format: values.format,
        hierarchy: values.hierarchy,
        category: values.category,
      }

      await CompetitionTypeService.createCompetitionType(data)
      toast.success('Tipo de competencia creado correctamente')

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating competition type:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al crear el tipo de competencia.'
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
          Nuevo Tipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Crear Tipo de Competencia</DialogTitle>
          <DialogDescription>Agregá un nuevo tipo de competencia al sistema</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar nombre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPETITION_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {NAME_LABELS[name] || name}
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
                  <FormLabel>Formato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPETITION_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {FORMAT_LABELS[format] || format}
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
                  <FormLabel>Jerarquía</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ej: 1, 2, 3"
                      className="h-11"
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
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPETITION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat] || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancelar
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
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Crear Tipo
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
