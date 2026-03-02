import { useState } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import DashboardService from '@/services/dashboard.service'

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '4-5-1', '4-1-4-1']

interface FormationSelectorProps {
  currentFormation: string
  onFormationChange: (formation: string) => void
}

export function FormationSelector({ currentFormation, onFormationChange }: FormationSelectorProps) {
  const { t } = useTranslation('dashboard')
  const [saving, setSaving] = useState(false)

  const handleChange = async (formation: string) => {
    setSaving(true)
    try {
      await DashboardService.updateFormation(formation)
      onFormationChange(formation)
      toast.success(t('pitch.formationSaved'))
    } catch {
      toast.error(t('pitch.formationError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white/80">{t('pitch.formation')}:</span>
      <Select value={currentFormation} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-28 h-7 text-sm bg-black/40 border-white/20 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORMATIONS.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
