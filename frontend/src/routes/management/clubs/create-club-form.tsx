import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputFile } from '@/components/ui/input-file'
import { ClubService } from '@/services/club.service'
import UserService from '@/services/user.service'
import { toast } from 'sonner'
import { Loader2, Plus, Building2, Image, UserIcon, Download } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import type { RegisterClubFormData, User } from '@/types'
import { useTranslation } from 'react-i18next'

interface CreateClubFormProps {
  onSuccess?: () => void
}

const CreateClubForm = ({ onSuccess }: CreateClubFormProps) => {
  const { t } = useTranslation('clubs')
  const [open, setOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof FormSchemas.ClubSchema>>({
    resolver: zodResolver(FormSchemas.ClubSchema),
    defaultValues: {
      name: '',
      logo: undefined,
      userId: '',
      isActive: true,
    },
  })

  // Fetch available users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await UserService.getUsers()
      const availableUsersFiltered =
        response.users?.filter((user: User) => {
          return (
            !user.club ||
            user.club === null ||
            user.club === undefined ||
            (typeof user.club === 'object' && Object.keys(user.club).length === 0)
          )
        }) || []
      setAvailableUsers(availableUsersFiltered)
    } catch (error) {
      console.error('Error fetching users:', error)
      setAvailableUsers([])
      toast.error('Failed to fetch users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function onSubmit(values: z.infer<typeof FormSchemas.ClubSchema>) {
    try {
      setVerificationStatus('loading')

      const clubData: RegisterClubFormData = {
        name: values.name,
        logo: values.logo,
        userId: values.userId === 'none' || values.userId === '' ? undefined : values.userId,
        isActive: values.isActive,
      }

      await ClubService.createClub(clubData)
      toast.success(t('create.success'))

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating club:', error)
      toast.error(t('create.error'))
      setVerificationStatus('error')
    }
  }

  const handleBulkCreate = async () => {
    if (!selectedFile) return
    try {
      setIsUploading(true)
      await ClubService.bulkCreateClub(selectedFile)
      toast.success(t('csv.success'))
      setSelectedFile(null)
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating clubs from CSV:', error)
      toast.error(error instanceof Error ? error.message : t('csv.error'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadExample = () => {
    const csvContent = 'name;isActive\nClub Ejemplo 1;true\nClub Ejemplo 2;true\nClub Ejemplo 3;false'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'clubs_example.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
      setVerificationStatus(null)
      setAvailableUsers([])
      setSelectedFile(null)
      setIsUploading(false)
      setLogoPreview(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          {t('create.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('create.title')}</DialogTitle>
          <DialogDescription>{t('create.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">{t('tabs.single')}</TabsTrigger>
              <TabsTrigger value="multiple">{t('tabs.multiple')}</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Club Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="select-none">{t('labels.clubName')}</FormLabel>
                        <FormControl>
                          <div className="relative select-none">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                              <Building2 className="size-4 text-gray-400 select-none" />
                            </div>
                            <Input
                              type="text"
                              placeholder={t('placeholders.clubName')}
                              className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Logo File Field */}
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field: { onChange } }) => (
                      <FormItem>
                        <FormLabel className="select-none">{t('labels.logoUrl')}</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  onChange(file)
                                  setLogoPreview(URL.createObjectURL(file))
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              className="flex items-center justify-center h-16 w-16 rounded border-2 border-dashed border-gray-300 hover:border-cyan-500 transition-colors shrink-0 overflow-hidden"
                            >
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                              ) : (
                                <Image className="size-6 text-gray-400" />
                              )}
                            </button>
                            <span className="text-sm text-muted-foreground">
                              {logoPreview ? t('labels.changeImage') : t('placeholders.logoUrl')}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Club Owner Field */}
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="select-none">{t('labels.clubOwner')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'none'}
                          disabled={isLoadingUsers}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                              <div className="flex items-center gap-3">
                                <UserIcon className="size-4 text-gray-400" />
                                <SelectValue placeholder={t('placeholders.selectOwner')} />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingUsers ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="size-4 animate-spin" />
                                  Loading users...
                                </div>
                              </SelectItem>
                            ) : (
                              <>
                                <SelectItem value="none">{t('placeholders.noOwner')}</SelectItem>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    <div className="flex items-center gap-2">{user.email}</div>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
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
                            {t('labels.activeStatus')}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {t('labels.activeDescription')}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={verificationStatus === 'loading'}>
                      {t('buttons.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                      disabled={verificationStatus === 'loading' || isLoadingUsers}
                    >
                      {verificationStatus === 'loading' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          {t('buttons.create')}...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4" />
                          {t('buttons.create')}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="multiple">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{t('csv.title')}</h4>
                </div>

                <div className="space-y-4">
                  <div className="border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">{t('csv.formatTitle')}</h5>
                    <p className="text-sm text-blue-700 mb-2">
                      {t('csv.formatDescription')}
                    </p>
                    <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                      <li>name ({t('create.action')})</li>
                      <li>isActive (true/false, optional)</li>
                    </ul>
                    <p className="text-sm text-blue-700 mt-2 font-medium">
                      {t('csv.maxClubs')}
                    </p>
                  </div>

                  <Button variant="outline" onClick={handleDownloadExample} type="button" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {t('csv.downloadExample')}
                  </Button>

                  <InputFile onFileChange={setSelectedFile} accept=".csv" />

                  {selectedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        {t('csv.selectedFile')} <span className="font-medium">{selectedFile.name}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {t('csv.size')} {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {t('buttons.cancel')}
                  </Button>
                  <Button
                    onClick={handleBulkCreate}
                    disabled={!selectedFile || isUploading}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('csv.creating')}
                      </>
                    ) : (
                      t('csv.submit')
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClubForm
