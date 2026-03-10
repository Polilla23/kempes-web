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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CompetitionType } from '@/types'
import { CompetitionTypeService, type CompetitionTypeFormData } from '@/services/competition-type.service'
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

function EditCompetitionTypeForm({ onSuccess, onClose, competitionType }: EditCompetitionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof competitionTypeSchema>>({
    resolver: zodResolver(competitionTypeSchema),
    defaultValues: {
      name: competitionType.name as typeof COMPETITION_NAMES[number],
      format: competitionType.format as typeof COMPETITION_FORMATS[number],
      hierarchy: competitionType.hierarchy,
      category: competitionType.category as typeof COMPETITION_CATEGORIES[number],
    },
  })

  async function onSubmit(values: z.infer<typeof competitionTypeSchema>) {
    try {
      setIsSubmitting(true)

      const updateData: CompetitionTypeFormData = {
        name: values.name,
        format: values.format,
        hierarchy: values.hierarchy,
        category: values.category,
      }

      await CompetitionTypeService.updateCompetitionType(competitionType.id, updateData)
      toast.success('Tipo de competencia actualizado correctamente')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating competition type:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el tipo de competencia')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={!!competitionType} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Editar Tipo de Competencia</DialogTitle>
          <DialogDescription>
            Modificá los datos del tipo de competencia. Hacé clic en guardar cuando termines.
          </DialogDescription>
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
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Guardar Cambios
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
