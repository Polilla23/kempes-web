import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Crown } from 'lucide-react'

export const Route = createFileRoute('/management/fixtures/cup/')({
  component: CupTypeSelector,
})

function CupTypeSelector() {
  const { t } = useTranslation('fixtures')
  const navigate = useNavigate()

  const cupTypes = [
    {
      id: 'kempes',
      title: 'Copa Kempes',
      description: 'Fase de grupos para equipos Mayores. Los clasificados pasan a Copa de Oro y Copa de Plata.',
      icon: Trophy,
      category: 'SENIOR',
      route: '/management/fixtures/cup/kempes',
    },
    {
      id: 'cindor',
      title: 'Copa Cindor',
      description: 'Eliminacion directa para todos los equipos Kempesitas activos.',
      icon: Users,
      category: 'KEMPESITA',
      route: '/management/fixtures/cup/cindor',
    },
    {
      id: 'supercopa',
      title: 'Supercopa',
      description: 'Eliminacion directa con 6 equipos seleccionados manualmente (Mayores o Kempesitas).',
      icon: Crown,
      category: 'AMBAS',
      route: '/management/fixtures/cup/supercopa',
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crear Copa</h1>
        <p className="text-muted-foreground">Selecciona el tipo de copa que deseas crear</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {cupTypes.map((cup) => (
          <Card
            key={cup.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate({ to: cup.route })}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <cup.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{cup.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {cup.category === 'AMBAS' ? 'Mayores / Kempesitas' : cup.category === 'SENIOR' ? 'Mayores' : 'Kempesitas'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{cup.description}</CardDescription>
              <Button variant="outline" className="w-full mt-4">
                Crear {cup.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CupTypeSelector
