import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TitleService } from '@/services/title.service'
import { NAME_LABELS, CATEGORY_LABELS } from '@/lib/competition-labels'
import { useUser } from '@/context/UserContext'
import type { TitlePointConfig } from '@/types'
import { useTranslation } from 'react-i18next'

interface PointConfigPanelProps {
  configs: TitlePointConfig[]
  onSave: () => void
}

function configLabel(config: TitlePointConfig): string {
  const name = NAME_LABELS[config.competitionName] || config.competitionName
  const cat = CATEGORY_LABELS[config.category] || config.category
  return `${name} - ${cat}`
}

const PointConfigPanel = ({ configs, onSave }: PointConfigPanelProps) => {
  const { t } = useTranslation('titles')
  const { role } = useUser()
  const isAdmin = role === 'ADMIN'

  // Keyed by config.id
  const [values, setValues] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (configs.length > 0) {
      const initial: Record<string, number> = {}
      configs.forEach((c) => {
        initial[c.id] = c.points
      })
      setValues(initial)
    }
  }, [configs])

  const handleChange = (id: string, value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setValues((prev) => ({ ...prev, [id]: num }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = configs
        .filter((c) => values[c.id] !== c.points)
        .map((c) => TitleService.updatePointConfig(c.id, values[c.id]))

      if (updates.length > 0) {
        await Promise.all(updates)
        toast.success(t('pointConfig.success'))
        onSave()
      }
    } catch {
      toast.error(t('pointConfig.error'))
    } finally {
      setIsSaving(false)
    }
  }

  // Sort by current point value descending
  const sortedConfigs = [...configs].sort((a, b) => (values[b.id] ?? b.points) - (values[a.id] ?? a.points))

  const hasChanges = configs.some((c) => values[c.id] !== c.points)

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold">{t('pointConfig.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('pointConfig.description')}</p>

      <div className="space-y-3">
        {sortedConfigs.map((config) => (
          <div key={config.id} className="flex items-center justify-between gap-3">
            <Label className="text-sm min-w-0 truncate" title={configLabel(config)}>
              {configLabel(config)}
            </Label>
            {isAdmin ? (
              <Input
                type="number"
                min={0}
                className="w-20 text-center"
                value={values[config.id] ?? config.points}
                onChange={(e) => handleChange(config.id, e.target.value)}
              />
            ) : (
              <span className="text-sm font-medium tabular-nums">
                {config.points} pts
              </span>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="w-full cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('pointConfig.save')}
            </>
          ) : (
            t('pointConfig.save')
          )}
        </Button>
      )}
    </div>
  )
}

export default PointConfigPanel
