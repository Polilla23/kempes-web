import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import type { Competition, LeagueConfig } from '@/types/fixture'

const leagueConfigSchema = z.object({
  league_position: z.enum(['TOP', 'MIDDLE', 'BOTTOM'], {
    required_error: 'Selecciona la posición de la liga',
  }),
  roundType: z.enum(['match', 'match_and_rematch'], {
    required_error: 'Selecciona el tipo de ronda',
  }),
  // Campos opcionales según posición
  firstIsChampion: z.boolean().optional(),
  topPlayoffType: z.enum(['TOP_3_FINALS', 'TOP_4_CROSS']).optional(),
  playoutType: z.enum(['5_VS_6', '4_VS_5']).optional(),
  directPromotions: z.number().min(0),
  playoffPromotions: z.number().min(0),
  directRelegations: z.number().min(0),
  playoffRelegations: z.number().min(0),
})

type LeagueConfigFormData = z.infer<typeof leagueConfigSchema>

interface LeagueConfigFormProps {
  competition: Competition
  existingConfig?: LeagueConfig
  onSave: (config: LeagueConfig) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export function LeagueConfigForm({
  competition,
  existingConfig,
  onSave,
  onBack,
  isFirst,
  isLast,
}: LeagueConfigFormProps) {
  const form = useForm<LeagueConfigFormData>({
    resolver: zodResolver(leagueConfigSchema),
    defaultValues: existingConfig
      ? {
          league_position: existingConfig.league_position,
          roundType: existingConfig.roundType,
          firstIsChampion: existingConfig.firstIsChampion,
          topPlayoffType: existingConfig.topPlayoffType,
          playoutType: existingConfig.playoutType,
          directPromotions: existingConfig.directPromotions || 0,
          playoffPromotions: existingConfig.playoffPromotions || 0,
          directRelegations: existingConfig.directRelegations || 0,
          playoffRelegations: existingConfig.playoffRelegations || 0,
        }
      : {
          league_position: 'MIDDLE',
          roundType: 'match_and_rematch',
          firstIsChampion: false,
          directPromotions: 1,
          playoffPromotions: 2,
          directRelegations: 1,
          playoffRelegations: 2,
        },
  })

  const leaguePosition = form.watch('league_position')
  const isTop = leaguePosition === 'TOP'
  const isMiddle = leaguePosition === 'MIDDLE'
  const isBottom = leaguePosition === 'BOTTOM'

  const onSubmit = (data: LeagueConfigFormData) => {
    const config: LeagueConfig = {
      competitionId: competition.id,
      competitionName: competition.name,
      league_position: data.league_position,
      roundType: data.roundType,
    }

    // Campos específicos según posición
    if (isTop) {
      config.firstIsChampion = data.firstIsChampion
      config.topPlayoffType = data.topPlayoffType
      config.playoutType = data.playoutType
      config.directRelegations = data.directRelegations
      config.playoffRelegations = data.playoffRelegations
    } else if (isMiddle) {
      config.playoutType = data.playoutType
      config.directPromotions = data.directPromotions
      config.playoffPromotions = data.playoffPromotions
      config.directRelegations = data.directRelegations
      config.playoffRelegations = data.playoffRelegations
    } else if (isBottom) {
      config.directPromotions = data.directPromotions
      config.playoffPromotions = data.playoffPromotions
      config.directRelegations = data.directRelegations
      config.playoffRelegations = data.playoffRelegations
    }

    onSave(config)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {competition.name}
            </CardTitle>
            <CardDescription>Configura las reglas y parámetros de esta liga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Posición de la liga */}
            <FormField
              control={form.control}
              name="league_position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posición de la Liga</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la posición" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TOP">Primera División (Top)</SelectItem>
                      <SelectItem value="MIDDLE">División Intermedia</SelectItem>
                      <SelectItem value="BOTTOM">Última División (Bottom)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Define si esta liga es de primera, intermedia o última</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Tipo de Ronda */}
            <FormField
              control={form.control}
              name="roundType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ronda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="match">Solo Ida</SelectItem>
                      <SelectItem value="match_and_rematch">Ida y Vuelta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Define si se juega solo ida o ida y vuelta</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Configuraciones específicas para TOP */}
            {isTop && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuración de Primera División</h3>

                  <FormField
                    control={form.control}
                    name="firstIsChampion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>El primero es campeón directo</FormLabel>
                          <FormDescription>Sin necesidad de playoffs finales</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="topPlayoffType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Playoffs (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin playoffs" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TOP_3_FINALS">Top 3 a finales</SelectItem>
                            <SelectItem value="TOP_4_CROSS">Top 4 cruzados</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="playoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Playouts (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin playouts" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5_VS_6">5° vs 6°</SelectItem>
                            <SelectItem value="4_VS_5">4° vs 5°</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="directRelegations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descensos Directos</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="playoffRelegations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playoffs para Descender</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Configuraciones específicas para MIDDLE */}
            {isMiddle && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sistema de Promociones y Descensos</h3>

                  <FormField
                    control={form.control}
                    name="playoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Playouts (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin playouts" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5_VS_6">5° vs 6°</SelectItem>
                            <SelectItem value="4_VS_5">4° vs 5°</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="directPromotions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ascensos Directos</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="playoffPromotions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playoffs para Ascender</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="directRelegations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descensos Directos</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="playoffRelegations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playoffs para Descender</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Configuraciones específicas para BOTTOM */}
            {isBottom && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sistema de Promociones</h3>
                  <p className="text-sm text-muted-foreground">
                    Como es la última división, solo hay ascensos (no descensos)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="directPromotions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ascensos Directos</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="playoffPromotions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playoffs para Ascender</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {isFirst ? 'Volver' : 'Liga Anterior'}
            </Button>
            <Button type="submit" className="gap-2">
              {isLast ? 'Finalizar Configuración' : 'Siguiente Liga'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
