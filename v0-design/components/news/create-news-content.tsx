"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ImageIcon, 
  X, 
  Plus, 
  Send, 
  ArrowLeft,
  Eye,
  FileText,
  Tag,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

const availableTags = [
  "Anuncio Oficial",
  "Transferencia",
  "Resultado",
  "Copa Kempes",
  "Copa de Oro",
  "Copa de Plata",
  "Liga Mayores",
  "Liga Menores",
  "Recordatorio",
  "Debate",
  "Humor",
]

interface FormErrors {
  title?: string
  content?: string
  tags?: string
  images?: string
}

export function CreateNewsContent() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showErrors, setShowErrors] = useState(false)

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const addImagePlaceholder = () => {
    if (images.length < 4) {
      setImages([...images, `placeholder-${images.length + 1}`])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!title.trim()) {
      newErrors.title = "El título es obligatorio"
    } else if (title.length < 10) {
      newErrors.title = "El título debe tener al menos 10 caracteres"
    }

    if (!content.trim()) {
      newErrors.content = "El contenido es obligatorio"
    } else if (content.length < 50) {
      newErrors.content = "El contenido debe tener al menos 50 caracteres"
    }

    if (selectedTags.length === 0) {
      newErrors.tags = "Debes seleccionar al menos una etiqueta"
    }

    if (images.length === 0) {
      newErrors.images = "Debes agregar al menos una imagen"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    setShowErrors(true)
    if (validateForm()) {
      // Submit the form
      console.log("Form submitted:", { title, content, selectedTags, images })
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/news">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Crear Publicación</h1>
              <p className="text-sm text-muted-foreground">Comparte noticias con la comunidad KML</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-transparent"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Editar" : "Vista previa"}
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Publicar
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
                <Card className={cn("bg-card border-border", showErrors && errors.title && "border-destructive")}>
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
                      className={cn("text-lg font-semibold", showErrors && errors.title && "border-destructive")}
                    />
                  </CardContent>
                </Card>

                {/* Content */}
                <Card className={cn("bg-card border-border", showErrors && errors.content && "border-destructive")}>
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
                    <Textarea
                      placeholder="¿Qué está pasando en la KML? Comparte noticias, resultados, fichajes, análisis..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={cn("min-h-[200px] resize-none", showErrors && errors.content && "border-destructive")}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {content.length} / 2000 caracteres (mínimo 50)
                    </p>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card className={cn("bg-card border-border", showErrors && errors.images && "border-destructive")}>
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
                      {images.map((_, index) => (
                        <div 
                          key={index}
                          className="relative aspect-video bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center group"
                        >
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {images.length < 4 && (
                        <button
                          onClick={addImagePlaceholder}
                          className={cn(
                            "aspect-video bg-muted/50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer",
                            showErrors && errors.images ? "border-destructive" : "border-border"
                          )}
                        >
                          <Plus className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Agregar imagen</span>
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
                  
                  {title && (
                    <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
                  )}
                  
                  <p className="text-foreground whitespace-pre-wrap mb-4">
                    {content || "Tu contenido aparecerá aquí..."}
                  </p>

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag.replace(/\s+/g, "")}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="space-y-2">
                      <div className={cn(
                        "grid gap-2 rounded-lg overflow-hidden",
                        images.length === 1 && "grid-cols-1",
                        images.length >= 2 && "grid-cols-2"
                      )}>
                        {images.map((_, i) => (
                          <div
                            key={i}
                            className="aspect-video bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2"
                          >
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              Imagen {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        (Las imágenes se mostrarán al publicar)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card className={cn("bg-card border-border", showErrors && errors.tags && "border-destructive")}>
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
                {showErrors && errors.tags && (
                  <p className="text-xs text-destructive mb-2">{errors.tags}</p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  Selecciona hasta 3 etiquetas para categorizar tu publicación
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTags.includes(tag) 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-transparent hover:bg-muted"
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
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", title.length >= 10 ? "bg-success" : "bg-destructive")} />
                    <span>Título (mínimo 10 caracteres)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", content.length >= 50 ? "bg-success" : "bg-destructive")} />
                    <span>Contenido (mínimo 50 caracteres)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", selectedTags.length > 0 ? "bg-success" : "bg-destructive")} />
                    <span>Al menos 1 etiqueta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", images.length > 0 ? "bg-success" : "bg-destructive")} />
                    <span>Al menos 1 imagen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
