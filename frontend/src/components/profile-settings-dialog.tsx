import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/context/UserContext'
import MeService from '@/services/me.service'
import DashboardService from '@/services/dashboard.service'
import { useState, useRef, useEffect } from 'react'
import { Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '4-5-1', '4-1-4-1']

interface ProfileSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { username, email, avatar, refreshUser } = useUser()
  const [newUsername, setNewUsername] = useState(username || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [formation, setFormation] = useState<string | null>(null)
  const [originalFormation, setOriginalFormation] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('common')

  useEffect(() => {
    if (open) {
      setNewUsername(username || '')
      setPreviewUrl(null)
      setSelectedFile(null)

      MeService.getClub().then((club) => {
        if (club) {
          setFormation(club.preferredFormation)
          setOriginalFormation(club.preferredFormation)
        } else {
          setFormation(null)
          setOriginalFormation(null)
        }
      }).catch(() => {
        setFormation(null)
        setOriginalFormation(null)
      })
    }
  }, [open, username])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await MeService.updateProfile({
        username: newUsername,
        avatar: selectedFile || undefined,
      })

      if (formation !== null && formation !== originalFormation) {
        await DashboardService.updateFormation(formation)
        setOriginalFormation(formation)
      }

      await refreshUser()
      toast.success(t('profile.updateSuccess'))
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('profile.updateError'))
    } finally {
      setSaving(false)
    }
  }

  const displayAvatar = previewUrl || avatar || undefined
  const initials = (newUsername || email || 'U').slice(0, 2).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white size-6" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('profile.changeAvatar')}
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={t('profile.username')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.email')}</Label>
            <Input id="email" value={email || ''} disabled />
          </div>

          {formation !== null && (
            <div className="space-y-2">
              <Label htmlFor="formation">{t('profile.formation')}</Label>
              <Select value={formation} onValueChange={setFormation}>
                <SelectTrigger id="formation">
                  <SelectValue placeholder={t('profile.selectFormation')} />
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
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('profile.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('profile.saving') : t('profile.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
