import { useState, useRef } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ImageIcon,
  X,
  Send,
  ArrowLeft,
  Eye,
  FileText,
  Tag,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  List,
  Loader2,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNewsContent } from '@/lib/format-content'
import { checkAuth } from '@/services/auth-guard'
import NewsService from '@/services/news.service'
import { toast } from 'sonner'

export const Route = createFileRoute('/news/create')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: CreateNewsPage,
})

const availableTags = [
  'Anuncio Oficial',
  'Transferencia',
  'Resultado',
  'Copa Kempes',
  'Copa de Oro',
  'Copa de Plata',
  'Liga Mayores',
  'Liga Menores',
  'Recordatorio',
  'Debate',
  'Humor',
]

interface LocalImage {
  id: string
  previewUrl: string
  file: File
}

interface FormErrors {
  title?: string
  content?: string
  tags?: string
  images?: string
}

function CreateNewsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [images, setImages] = useState<LocalImage[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showErrors, setShowErrors] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: LocalImage[] = []

    for (let i = 0; i < files.length && images.length + newImages.length < 4; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} es demasiado grande (máximo 5MB)`)
        continue
      }

      const tempId = `local-${Date.now()}-${i}`
      const previewUrl = URL.createObjectURL(file)

      newImages.push({ id: tempId, previewUrl, file })
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string) => {
    const image = images.find((img) => img.id === id)
    if (image) {
      URL.revokeObjectURL(image.previewUrl)
    }
    setImages(images.filter((img) => img.id !== id))
  }

  const insertFormatting = (format: 'bold' | 'italic' | 'underline' | 'list') => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let newText = ''
    let cursorOffset = 0

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`
        cursorOffset = selectedText ? 0 : 2
        break
      case 'italic':
        newText = `_${selectedText}_`
        cursorOffset = selectedText ? 0 : 1
        break
      case 'underline':
        newText = `__${selectedText}__`
        cursorOffset = selectedText ? 0 : 2
        break
      case 'list':
        newText = `\n- ${selectedText}`
        cursorOffset = selectedText ? 0 : 3
        break
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length - cursorOffset
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio'
    } else if (title.length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres'
    }

    if (!content.trim()) {
      newErrors.content = 'El contenido es obligatorio'
    } else if (content.length < 50) {
      newErrors.content = 'El contenido debe tener al menos 50 caracteres'
    }

    if (selectedTags.length === 0) {
      newErrors.tags = 'Debes seleccionar al menos una etiqueta'
    }

    if (images.length === 0) {
      newErrors.images = 'Debes agregar al menos una imagen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setShowErrors(true)
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Step 1: Upload all images
      const uploadedUrls: string[] = []

      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        setUploadProgress(`Subiendo imagen ${i + 1} de ${images.length}...`)

        try {
          const result = await NewsService.uploadImage(image.file)
          uploadedUrls.push(result.publicUrl)
        } catch (error) {
          toast.error(`Error al subir ${image.file.name}`)
          console.error('Upload error:', error)
          setIsSubmitting(false)
          setUploadProgress('')
          return
        }
      }

      // Step 2: Create the news post with uploaded image URLs
      setUploadProgress('Publicando noticia...')
      await NewsService.create({
        title,
        content,
        tags: selectedTags,
        images: uploadedUrls,
        isPublished: true,
      })

      toast.success('Noticia publicada exitosamente')
      navigate({ to: '/news' })
    } catch (error) {
      toast.error('Error al publicar la noticia')
      console.error('Publish error:', error)
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/news">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Crear Publicación</h1>
            <p className="text-sm text-muted-foreground">Comparte noticias con la comunidad KML</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? 'Editar' : 'Vista previa'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress || 'Publicando...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors Summary */}
      {showErrors && Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor corrige los siguientes errores antes de publicar:
            <ul className="list-disc list-inside mt-2 text-sm">
              {errors.title && <li>{errors.title}</li>}
              {errors.content && <li>{errors.content}</li>}
              {errors.tags && <li>{errors.tags}</li>}
              {errors.images && <li>{errors.images}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {!isPreview ? (
            <>
              {/* Title */}
              <Card
                className={cn('bg-card border-border', showErrors && errors.title && 'border-destructive')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Título *</CardTitle>
                    </div>
                    {showErrors && errors.title && (
                      <span className="text-xs text-destructive">{errors.title}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Dale un título llamativo a tu publicación..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                      'text-lg font-semibold',
                      showErrors && errors.title && 'border-destructive',
                    )}
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card
                className={cn('bg-card border-border', showErrors && errors.content && 'border-destructive')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Contenido *</CardTitle>
                    </div>
                    {showErrors && errors.content && (
                      <span className="text-xs text-destructive">{errors.content}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 mb-2 p-1 bg-muted/50 rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => insertFormatting('bold')}
                      title="Negrita"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => insertFormatting('italic')}
                      title="Cursiva"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => insertFormatting('underline')}
                      title="Subrayado"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => insertFormatting('list')}
                      title="Lista"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  <Textarea
                    ref={contentRef}
                    placeholder="¿Qué está pasando en la KML? Comparte noticias, resultados, fichajes, análisis..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={cn(
                      'min-h-[200px] resize-none',
                      showErrors && errors.content && 'border-destructive',
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {content.length} / 2000 caracteres (mínimo 50)
                  </p>
                </CardContent>
              </Card>

              {/* Images */}
              <Card
                className={cn('bg-card border-border', showErrors && errors.images && 'border-destructive')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Imágenes *</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {showErrors && errors.images && (
                        <span className="text-xs text-destructive">{errors.images}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{images.length}/4</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((image) => (
                      <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden group">
                        <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'aspect-video bg-muted/50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer',
                          showErrors && errors.images ? 'border-destructive' : 'border-border',
                        )}
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Subir imagen</span>
                        <span className="text-[10px] text-muted-foreground">(máx. 5MB)</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Preview */
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm text-muted-foreground">Vista previa</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    TU
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tu Usuario</p>
                    <p className="text-xs text-muted-foreground">Ahora mismo</p>
                  </div>
                </div>

                {title && <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>}

                <div
                  className="text-foreground whitespace-pre-wrap mb-4"
                  dangerouslySetInnerHTML={{
                    __html: formatNewsContent(content) || 'Tu contenido aparecerá aquí...',
                  }}
                />

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag.replace(/\s+/g, '')}
                      </Badge>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <div
                    className={cn(
                      'grid gap-2 rounded-lg overflow-hidden',
                      images.length === 1 && 'grid-cols-1',
                      images.length >= 2 && 'grid-cols-2',
                    )}
                  >
                    {images.map((image) => (
                      <div key={image.id} className="aspect-video rounded-lg overflow-hidden">
                        <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card className={cn('bg-card border-border', showErrors && errors.tags && 'border-destructive')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">Etiquetas *</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">{selectedTags.length}/3</span>
              </div>
            </CardHeader>
            <CardContent>
              {showErrors && errors.tags && <p className="text-xs text-destructive mb-2">{errors.tags}</p>}
              <p className="text-xs text-muted-foreground mb-3">
                Selecciona hasta 3 etiquetas para categorizar tu publicación
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent hover:bg-muted',
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Campos obligatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      title.length >= 10 ? 'bg-green-500' : 'bg-destructive',
                    )}
                  />
                  <span>Título (mínimo 10 caracteres)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      content.length >= 50 ? 'bg-green-500' : 'bg-destructive',
                    )}
                  />
                  <span>Contenido (mínimo 50 caracteres)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      selectedTags.length > 0 ? 'bg-green-500' : 'bg-destructive',
                    )}
                  />
                  <span>Al menos 1 etiqueta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      images.length > 0 ? 'bg-green-500' : 'bg-destructive',
                    )}
                  />
                  <span>Al menos 1 imagen</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Formatting Help */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Formato de texto</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Bold className="w-3 h-3" />
                  <span>
                    <code className="bg-muted px-1 rounded">**texto**</code> = <strong>negrita</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Italic className="w-3 h-3" />
                  <span>
                    <code className="bg-muted px-1 rounded">_texto_</code> = <em>cursiva</em>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Underline className="w-3 h-3" />
                  <span>
                    <code className="bg-muted px-1 rounded">__texto__</code> = <u>subrayado</u>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <List className="w-3 h-3" />
                  <span>
                    <code className="bg-muted px-1 rounded">- item</code> = lista
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
