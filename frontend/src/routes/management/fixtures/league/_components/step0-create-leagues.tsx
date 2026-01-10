import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import type { LeagueWizardState, LeagueCreationConfig } from '@/types/fixture'

interface Step0CreateLeaguesProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
}

type LeagueType = 'MAYORES' | 'MENORES'

interface LeagueFormData {
  id: string
  name: string
  type: LeagueType
  isChampionFirstPlace: boolean
  playoffMode?: 'LIGUILLA' | 'ELIMINACION'
  directRelegations: number
  promotions: number
  hasPlayoutForLastPromotion: boolean
  playoutOpponent?: string
}

export function Step0CreateLeagues({ wizardState, onUpdate, onNext }: Step0CreateLeaguesProps) {
  const [leagues, setLeagues] = useState<LeagueFormData[]>([
    {
      id: crypto.randomUUID(),
      name: 'Liga A',
      type: 'MAYORES',
      isChampionFirstPlace: true,
      directRelegations: 0,
      promotions: 0,
      hasPlayoutForLastPromotion: false,
    },
  ])

  const handleAddLeague = () => {
    const newLeague: LeagueFormData = {
      id: crypto.randomUUID(),
      name: `Liga ${String.fromCharCode(65 + leagues.length)}`,
      type: 'MAYORES',
      isChampionFirstPlace: true,
      directRelegations: 0,
      promotions: 0,
      hasPlayoutForLastPromotion: false,
    }
    setLeagues([...leagues, newLeague])
  }

  const handleRemoveLeague = (id: string) => {
    if (leagues.length === 1) {
      toast.error('Debe haber al menos una liga')
      return
    }
    setLeagues(leagues.filter((l) => l.id !== id))
  }

  const handleUpdateLeague = (id: string, updates: Partial<LeagueFormData>) => {
    setLeagues(
      leagues.map((league) =>
        league.id === id
          ? {
              ...league,
              ...updates,
              // Reset playoff mode if champion is first place
              ...(updates.isChampionFirstPlace === true ? { playoffMode: undefined } : {}),
            }
          : league
      )
    )
  }

  const validateAndContinue = () => {
    // Validar que todas las ligas tengan nombre
    const invalidLeagues = leagues.filter((l) => !l.name.trim())
    if (invalidLeagues.length > 0) {
      toast.error('Todas las ligas deben tener un nombre')
      return
    }

    // Validar nombres únicos
    const names = leagues.map((l) => l.name.toLowerCase())
    const hasDuplicates = names.length !== new Set(names).size
    if (hasDuplicates) {
      toast.error('Los nombres de las ligas deben ser únicos')
      return
    }

    // Convertir a formato del wizard
    const leagueConfigs: LeagueCreationConfig[] = leagues.map((league) => ({
      id: league.id,
      name: league.name,
      type: league.type,
      isChampionFirstPlace: league.isChampionFirstPlace,
      playoffMode: league.playoffMode,
      directRelegations: league.directRelegations,
      promotions: league.promotions,
      hasPlayoutForLastPromotion: league.hasPlayoutForLastPromotion,
      playoutOpponent: league.playoutOpponent,
    }))

    onUpdate({
      ...wizardState,
      leagueCreationConfigs: leagueConfigs,
    })

    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Crear Ligas
          </CardTitle>
          <CardDescription>
            Define las ligas que deseas crear y sus reglas básicas. Podrás configurar detalles adicionales en
            los siguientes pasos.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formularios de ligas */}
      <div className="space-y-4">
        {leagues.map((league, index) => (
          <Card key={league.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={league.type === 'MAYORES' ? 'default' : 'secondary'} className="h-8 px-3">
                    {league.type === 'MAYORES' ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Mayores
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Menores
                      </>
                    )}
                  </Badge>
                  <CardTitle className="text-lg">{league.name || `Liga ${index + 1}`}</CardTitle>
                </div>
                {leagues.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveLeague(league.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre y Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${league.id}`}>Nombre de la Liga</Label>
                  <Input
                    id={`name-${league.id}`}
                    value={league.name}
                    onChange={(e) => handleUpdateLeague(league.id, { name: e.target.value })}
                    placeholder="Liga A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`type-${league.id}`}>Tipo</Label>
                  <Select
                    value={league.type}
                    onValueChange={(value) => handleUpdateLeague(league.id, { type: value as LeagueType })}
                  >
                    <SelectTrigger id={`type-${league.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAYORES">Mayores</SelectItem>
                      <SelectItem value="MENORES">Menores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Configuraciones para MAYORES */}
              {league.type === 'MAYORES' && (
                <div className="space-y-4">
                  {/* ¿El primero es campeón? */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>¿El primero es el campeón?</Label>
                      <p className="text-sm text-muted-foreground">
                        Si es No, deberás elegir el modo de definición
                      </p>
                    </div>
                    <Checkbox
                      checked={league.isChampionFirstPlace}
                      onCheckedChange={(checked: boolean) =>
                        handleUpdateLeague(league.id, { isChampionFirstPlace: checked })
                      }
                    />
                  </div>

                  {/* Modo de playoff (solo si no es campeón directo) */}
                  {!league.isChampionFirstPlace && (
                    <div className="space-y-2 ml-4 p-4 border rounded-lg bg-muted/50">
                      <Label htmlFor={`playoff-${league.id}`}>Modo de definición</Label>
                      <Select
                        value={league.playoffMode}
                        onValueChange={(value) =>
                          handleUpdateLeague(league.id, { playoffMode: value as 'LIGUILLA' | 'ELIMINACION' })
                        }
                      >
                        <SelectTrigger id={`playoff-${league.id}`}>
                          <SelectValue placeholder="Seleccionar modo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LIGUILLA">Liguilla</SelectItem>
                          <SelectItem value="ELIMINACION">Eliminación</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        {league.playoffMode === 'LIGUILLA'
                          ? 'Define posiciones, fases (Semi y Final) → Elegir posición semi y final'
                          : 'Fases (Semi, Final, etc.) → Elegir posiciones'}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Descensos y Promociones */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`relegations-${league.id}`}>Cantidad de descensos directos</Label>
                      <Input
                        id={`relegations-${league.id}`}
                        type="number"
                        min="0"
                        value={league.directRelegations}
                        onChange={(e) =>
                          handleUpdateLeague(league.id, { directRelegations: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`promotions-${league.id}`}>Cantidad de promociones</Label>
                      <Input
                        id={`promotions-${league.id}`}
                        type="number"
                        min="0"
                        value={league.promotions}
                        onChange={(e) =>
                          handleUpdateLeague(league.id, { promotions: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  {/* Playout para última promoción */}
                  {league.promotions > 0 && (
                    <div className="space-y-3 ml-4 p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>¿El último de la promo se decide por playoff/reducido?</Label>
                          <p className="text-sm text-muted-foreground">
                            Se calculará según descensos directos y promos
                          </p>
                        </div>
                        <Checkbox
                          checked={league.hasPlayoutForLastPromotion}
                          onCheckedChange={(checked: boolean) =>
                            handleUpdateLeague(league.id, { hasPlayoutForLastPromotion: checked })
                          }
                        />
                      </div>

                      {league.hasPlayoutForLastPromotion && (
                        <div className="space-y-2 mt-3">
                          <Label htmlFor={`playout-opponent-${league.id}`}>Playoff vs</Label>
                          <Select
                            value={league.playoutOpponent}
                            onValueChange={(value) =>
                              handleUpdateLeague(league.id, { playoutOpponent: value })
                            }
                          >
                            <SelectTrigger id={`playout-opponent-${league.id}`}>
                              <SelectValue placeholder="Seleccionar oponente" />
                            </SelectTrigger>
                            <SelectContent>
                              {leagues
                                .filter((l) => l.id !== league.id && l.type === 'MENORES')
                                .map((l) => (
                                  <SelectItem key={l.id} value={l.id}>
                                    {l.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Configuraciones para MENORES */}
              {league.type === 'MENORES' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`promotions-menores-${league.id}`}>Cantidad de ascensos directos</Label>
                      <Input
                        id={`promotions-menores-${league.id}`}
                        type="number"
                        min="0"
                        value={league.promotions}
                        onChange={(e) =>
                          handleUpdateLeague(league.id, { promotions: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Los playoffs de ascenso se configurarán automáticamente según las reglas de las ligas
                    mayores.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botón agregar liga */}
      <Button variant="outline" className="w-full" onClick={handleAddLeague}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Liga
      </Button>

      {/* Footer con navegación */}
      <Card>
        <CardFooter className="flex justify-between pt-6">
          <div className="text-sm text-muted-foreground">{leagues.length} liga(s) configurada(s)</div>
          <Button onClick={validateAndContinue}>
            Continuar
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
