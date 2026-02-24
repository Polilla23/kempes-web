import { Card, CardContent } from '@/components/ui/card'

interface StandingsLegendProps {
  type: 'league' | 'cup-groups'
}

export function StandingsLegend({ type }: StandingsLegendProps) {
  if (type === 'cup-groups') {
    return (
      <Card className="mt-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500/20 dark:bg-amber-400/20 border-l-4 border-l-amber-600 dark:border-l-amber-500 rounded" />
              <span>Clasifica a Copa de Oro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-400/20 dark:bg-slate-300/20 border-l-4 border-l-slate-400 dark:border-l-slate-400 rounded" />
              <span>Clasifica a Copa de Plata</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border-l-4 border-l-yellow-500 rounded" />
            <span>Campeón</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border-l-4 border-l-green-500 rounded" />
            <span>Ascenso directo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border-l-4 border-l-blue-500 rounded" />
            <span>Playoff</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border-l-4 border-l-red-500 rounded" />
            <span>Descenso</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
