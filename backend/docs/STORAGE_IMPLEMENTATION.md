# 📦 Guía de Implementación - Supabase Storage

## 📋 Tabla de Contenidos
1. [Variables de Entorno](#1-variables-de-entorno)
2. [Instalación de Dependencias](#2-instalación-de-dependencias)
3. [Configuración de Supabase Dashboard](#3-configuración-de-supabase-dashboard)
4. [Migraciones de Base de Datos](#4-migraciones-de-base-de-datos)
5. [Implementación de Storage Feature](#5-implementación-de-storage-feature)
6. [Integración con Clubs](#6-integración-con-clubs)
7. [Integración con Players](#7-integración-con-players)
8. [Feature de News](#8-feature-de-news)
9. [Competition Types](#9-competition-types)
10. [Testing y Limpieza](#10-testing-y-limpieza)

---

## 1. Variables de Entorno

### 1.1 Actualizar `.env.example`

Agregar al final del archivo (antes de EMAIL):

```env
# ================================
# FILE UPLOADS
# ================================
# Tamaño máximo de archivo en bytes (5MB = 5242880)
MAX_FILE_SIZE=5242880

# ================================
# SUPABASE STORAGE
# ================================
# URL de tu proyecto Supabase (Settings → API → Project URL)
SUPABASE_URL="https://tu-proyecto-id.supabase.co"

# Anon key pública (Settings → API → anon public)
SUPABASE_ANON_KEY="tu-anon-key-aqui"

# Service role key para operaciones del backend (Settings → API → service_role)
# ⚠️ NUNCA expongas esta key al frontend - solo para backend
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# Nombres de los buckets de storage (deben crearse en Supabase Dashboard)
STORAGE_BUCKET_CLUBS="club-logos"
STORAGE_BUCKET_PLAYERS="player-avatars"
STORAGE_BUCKET_TROPHIES="trophy-images"
STORAGE_BUCKET_NEWS="news-images"
STORAGE_BUCKET_GENERAL="general-assets"
```

### 1.2 Actualizar `.env`

Agregar después de `BACK_URL`:

```env
# ================================
# FILE UPLOADS
# ================================
MAX_FILE_SIZE=5242880

# ================================
# SUPABASE STORAGE
# ================================
SUPABASE_URL="https://ueccxxenutmvbqfapjqk.supabase.co"
SUPABASE_ANON_KEY="OBTENER_DE_SUPABASE_DASHBOARD"
SUPABASE_SERVICE_ROLE_KEY="OBTENER_DE_SUPABASE_DASHBOARD"

STORAGE_BUCKET_CLUBS="club-logos"
STORAGE_BUCKET_PLAYERS="player-avatars"
STORAGE_BUCKET_TROPHIES="trophy-images"
STORAGE_BUCKET_NEWS="news-images"
STORAGE_BUCKET_GENERAL="general-assets"
```

**¿Dónde obtener las keys?**
1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto
3. Settings → API
4. Copiar:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Actualizar `src/features/core/config/env.ts`

Agregar al schema de Zod (después de `MAX_FILE_SIZE`):

```typescript
const envSchema = z.object({
  // ... variables existentes ...
  
  // Uploads
  MAX_FILE_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024), // 5MB por defecto

  // Supabase Storage
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerido'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerido'),

  // Storage buckets
  STORAGE_BUCKET_CLUBS: z.string().default('club-logos'),
  STORAGE_BUCKET_PLAYERS: z.string().default('player-avatars'),
  STORAGE_BUCKET_TROPHIES: z.string().default('trophy-images'),
  STORAGE_BUCKET_NEWS: z.string().default('news-images'),
  STORAGE_BUCKET_GENERAL: z.string().default('general-assets'),
})
```

---

## 2. Instalación de Dependencias

```bash
cd backend
npm install @supabase/supabase-js
```

---

## 3. Configuración de Supabase Dashboard

### 3.1 Crear Buckets

1. Ir a: https://supabase.com/dashboard
2. Storage → Create a new bucket
3. Crear los siguientes buckets (uno por uno):

| Bucket Name | Public | File Size Limit | Allowed MIME Types |
|-------------|--------|-----------------|-------------------|
| `club-logos` | ✅ Yes | 5 MB | image/png, image/jpeg, image/webp |
| `player-avatars` | ✅ Yes | 5 MB | image/png, image/jpeg, image/webp |
| `trophy-images` | ✅ Yes | 5 MB | image/png, image/jpeg, image/webp, image/svg+xml |
| `news-images` | ✅ Yes | 5 MB | image/png, image/jpeg, image/webp |
| `general-assets` | ✅ Yes | 5 MB | image/png, image/jpeg, image/webp, image/svg+xml |

### 3.2 Configurar Políticas de Seguridad (RLS)

Para cada bucket, ir a: Storage → Policies

**Política de Lectura Pública:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-logos');
```
Repetir cambiando `bucket_id` para cada bucket.

**Política de Escritura (Backend Only):**
```sql
CREATE POLICY "Backend Upload"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Backend Delete"
ON storage.objects FOR DELETE
USING (auth.role() = 'service_role');
```

---

## 4. Migraciones de Base de Datos

### 4.1 Actualizar `prisma/schema.prisma`

#### Agregar Enum `EntityType`:

```prisma
enum EntityType {
  CLUB
  PLAYER
  TROPHY
  NEWS
  GENERAL
}
```

#### Actualizar modelo `User`:

```prisma
model User {
  // ... campos existentes ...
  news        News[]
}
```

#### Actualizar modelo `Club`:

```prisma
model Club {
  // ... campos existentes ...
  logo   String?  // Mantener, ahora será URL de Supabase
}
```

#### Actualizar modelo `Player`:

```prisma
model Player {
  // ... campos existentes ...
  avatar      String?  @map("avatar_url")  // NUEVO CAMPO
}
```

#### Actualizar modelo `CompetitionType`:

```prisma
model CompetitionType {
  // ... campos existentes ...
  trophyImage String?  @map("trophy_image_url")  // NUEVO CAMPO
}
```

#### Agregar modelo `StorageFile`:

```prisma
model StorageFile {
  id           String     @id @default(uuid())
  fileName     String     @map("file_name")
  originalName String     @map("original_name")
  fileSize     Int        @map("file_size")
  mimeType     String     @map("mime_type")
  bucket       String
  path         String
  publicUrl    String     @map("public_url")
  entityType   EntityType @map("entity_type")
  entityId     String?    @map("entity_id")
  uploadedBy   String?    @map("uploaded_by")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  isActive     Boolean    @default(true) @map("is_active")
  
  @@index([entityType, entityId])
  @@index([bucket])
  @@map("storage_files")
}
```

#### Agregar modelo `News`:

```prisma
model News {
  id          String   @id @default(uuid())
  title       String
  content     String   @db.Text
  authorId    String   @map("author_id")
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  images      String[] // Array de URLs de Supabase
  tags        String[]
  isPublished Boolean  @default(true) @map("is_published")
  publishedAt DateTime @default(now()) @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([authorId])
  @@map("news")
}
```

### 4.2 Ejecutar Migración

```bash
npm run migrate
# Nombrar la migración: "add_storage_and_news_models"
```

---

## 5. Implementación de Storage Feature

### 5.1 Crear Estructura de Carpetas

```bash
mkdir src/features/storage
mkdir src/features/storage/interfaces
mkdir src/features/storage/providers
```

### 5.2 Crear `storage.types.ts`

```typescript
// src/features/storage/storage.types.ts

import { EntityType } from '@prisma/client'

export interface UploadFileInput {
  file: Buffer
  fileName: string
  mimeType: string
  entityType: EntityType
  entityId?: string
  uploadedBy?: string
}

export interface FileMetadata {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  bucket: string
  path: string
  publicUrl: string
  entityType: EntityType
  entityId?: string
}

export interface SupabaseUploadResult {
  path: string
  publicUrl: string
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const

export const ENTITY_TYPE_BUCKET_MAP: Record<EntityType, string> = {
  CLUB: 'club-logos',
  PLAYER: 'player-avatars',
  TROPHY: 'trophy-images',
  NEWS: 'news-images',
  GENERAL: 'general-assets',
}
```

### 5.3 Crear `storage.errors.ts`

```typescript
// src/features/storage/storage.errors.ts

export class FileNotFoundError extends Error {
  constructor() {
    super('File not found')
    this.name = 'FileNotFoundError'
  }
}

export class InvalidFileTypeError extends Error {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    this.name = 'InvalidFileTypeError'
  }
}

export class FileSizeExceededError extends Error {
  constructor(maxSize: number) {
    super(`File size exceeds maximum allowed (${maxSize} bytes)`)
    this.name = 'FileSizeExceededError'
  }
}

export class UploadFailedError extends Error {
  constructor(message: string) {
    super(`Upload failed: ${message}`)
    this.name = 'UploadFailedError'
  }
}

export class DeleteFailedError extends Error {
  constructor(message: string) {
    super(`Delete failed: ${message}`)
    this.name = 'DeleteFailedError'
  }
}
```

### 5.4 Crear `interfaces/IStorageRepository.ts`

```typescript
// src/features/storage/interfaces/IStorageRepository.ts

import { StorageFile, Prisma } from '@prisma/client'

export interface IStorageRepository {
  save(data: Prisma.StorageFileCreateInput): Promise<StorageFile>
  findById(id: string): Promise<StorageFile | null>
  findByEntity(entityType: string, entityId: string): Promise<StorageFile[]>
  findByBucket(bucket: string): Promise<StorageFile[]>
  updateOneById(id: string, data: Prisma.StorageFileUpdateInput): Promise<StorageFile>
  deleteOneById(id: string): Promise<void>
}
```

### 5.5 Crear `providers/supabase.provider.ts`

```typescript
// src/features/storage/providers/supabase.provider.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/features/core/config/env'
import { SupabaseUploadResult } from '../storage.types'
import { UploadFailedError, DeleteFailedError } from '../storage.errors'

export class SupabaseProvider {
  private client: SupabaseClient

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string
  ): Promise<SupabaseUploadResult> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      throw new UploadFailedError(error.message)
    }

    const publicUrl = this.getPublicUrl(bucket, data.path)

    return {
      path: data.path,
      publicUrl,
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([path])

    if (error) {
      throw new DeleteFailedError(error.message)
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async listFiles(bucket: string, folder?: string) {
    const { data, error } = await this.client.storage.from(bucket).list(folder)

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`)
    }

    return data
  }
}
```

### 5.6 Crear `storage.repository.ts`

```typescript
// src/features/storage/storage.repository.ts

import { PrismaClient, StorageFile, Prisma } from '@prisma/client'
import { IStorageRepository } from './interfaces/IStorageRepository'

export class StorageRepository implements IStorageRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(data: Prisma.StorageFileCreateInput): Promise<StorageFile> {
    return await this.prisma.storageFile.create({ data })
  }

  async findById(id: string): Promise<StorageFile | null> {
    return await this.prisma.storageFile.findUnique({ where: { id } })
  }

  async findByEntity(entityType: string, entityId: string): Promise<StorageFile[]> {
    return await this.prisma.storageFile.findMany({
      where: {
        entityType: entityType as any,
        entityId,
        isActive: true,
      },
    })
  }

  async findByBucket(bucket: string): Promise<StorageFile[]> {
    return await this.prisma.storageFile.findMany({
      where: { bucket, isActive: true },
    })
  }

  async updateOneById(
    id: string,
    data: Prisma.StorageFileUpdateInput
  ): Promise<StorageFile> {
    return await this.prisma.storageFile.update({
      where: { id },
      data,
    })
  }

  async deleteOneById(id: string): Promise<void> {
    await this.prisma.storageFile.delete({ where: { id } })
  }
}
```

### 5.7 Crear `storage.service.ts`

```typescript
// src/features/storage/storage.service.ts

import { EntityType } from '@prisma/client'
import { IStorageRepository } from './interfaces/IStorageRepository'
import { SupabaseProvider } from './providers/supabase.provider'
import {
  UploadFileInput,
  FileMetadata,
  ALLOWED_IMAGE_TYPES,
  ENTITY_TYPE_BUCKET_MAP,
} from './storage.types'
import {
  FileNotFoundError,
  InvalidFileTypeError,
  FileSizeExceededError,
} from './storage.errors'
import { env } from '@/features/core/config/env'
import { randomUUID } from 'crypto'
import path from 'path'

export class StorageService {
  private storageRepository: IStorageRepository
  private supabaseProvider: SupabaseProvider

  constructor({
    storageRepository,
    supabaseProvider,
  }: {
    storageRepository: IStorageRepository
    supabaseProvider: SupabaseProvider
  }) {
    this.storageRepository = storageRepository
    this.supabaseProvider = supabaseProvider
  }

  async uploadImage(input: UploadFileInput): Promise<FileMetadata> {
    // Validar tipo de archivo
    this.validateFileType(input.mimeType)

    // Validar tamaño
    this.validateFileSize(input.file.length)

    // Obtener bucket según entityType
    const bucket = ENTITY_TYPE_BUCKET_MAP[input.entityType]

    // Generar nombre único
    const fileExtension = path.extname(input.fileName)
    const uniqueFileName = `${randomUUID()}${fileExtension}`

    // Construir path
    const filePath = input.entityId
      ? `${input.entityId}/${uniqueFileName}`
      : uniqueFileName

    // Subir a Supabase
    const uploadResult = await this.supabaseProvider.uploadFile(
      bucket,
      filePath,
      input.file,
      input.mimeType
    )

    // Guardar metadata en BD
    const storageFile = await this.storageRepository.save({
      fileName: uniqueFileName,
      originalName: input.fileName,
      fileSize: input.file.length,
      mimeType: input.mimeType,
      bucket,
      path: uploadResult.path,
      publicUrl: uploadResult.publicUrl,
      entityType: input.entityType,
      entityId: input.entityId,
      uploadedBy: input.uploadedBy,
    })

    return {
      id: storageFile.id,
      fileName: storageFile.fileName,
      originalName: storageFile.originalName,
      fileSize: storageFile.fileSize,
      mimeType: storageFile.mimeType,
      bucket: storageFile.bucket,
      path: storageFile.path,
      publicUrl: storageFile.publicUrl,
      entityType: storageFile.entityType,
      entityId: storageFile.entityId,
    }
  }

  async deleteImage(fileId: string): Promise<void> {
    const file = await this.storageRepository.findById(fileId)

    if (!file) {
      throw new FileNotFoundError()
    }

    // Eliminar de Supabase
    await this.supabaseProvider.deleteFile(file.bucket, file.path)

    // Marcar como inactivo en BD (soft delete)
    await this.storageRepository.updateOneById(fileId, { isActive: false })
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const file = await this.storageRepository.findById(fileId)

    if (!file || !file.isActive) {
      return null
    }

    return {
      id: file.id,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      bucket: file.bucket,
      path: file.path,
      publicUrl: file.publicUrl,
      entityType: file.entityType,
      entityId: file.entityId,
    }
  }

  async replaceImage(
    oldFileId: string,
    newFileInput: UploadFileInput
  ): Promise<FileMetadata> {
    // Subir nuevo archivo
    const newFile = await this.uploadImage(newFileInput)

    // Eliminar archivo anterior
    try {
      await this.deleteImage(oldFileId)
    } catch (error) {
      // Log error pero no fallar si el archivo viejo no existe
      console.error(`Failed to delete old file ${oldFileId}:`, error)
    }

    return newFile
  }

  private validateFileType(mimeType: string): void {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
      throw new InvalidFileTypeError([...ALLOWED_IMAGE_TYPES])
    }
  }

  private validateFileSize(size: number): void {
    if (size > env.MAX_FILE_SIZE) {
      throw new FileSizeExceededError(env.MAX_FILE_SIZE)
    }
  }
}
```

### 5.8 Crear `storage.controller.ts`

```typescript
// src/features/storage/storage.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { StorageService } from './storage.service'
import { Response } from '@/features/core'
import { EntityType } from '@prisma/client'
import { MultipartFile } from '@fastify/multipart'

export class StorageController {
  private storageService: StorageService

  constructor({ storageService }: { storageService: StorageService }) {
    this.storageService = storageService
  }

  async upload(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await req.file()

      if (!data) {
        return Response.validation(reply, 'No file provided', 'Upload failed')
      }

      const buffer = await data.toBuffer()
      const { entityType, entityId } = req.query as {
        entityType: EntityType
        entityId?: string
      }

      if (!entityType) {
        return Response.validation(
          reply,
          'entityType is required',
          'Upload failed'
        )
      }

      const fileMetadata = await this.storageService.uploadImage({
        file: buffer,
        fileName: data.filename,
        mimeType: data.mimetype,
        entityType,
        entityId,
        uploadedBy: (req.user as any)?.id,
      })

      return Response.created(
        reply,
        fileMetadata,
        'File uploaded successfully'
      )
    } catch (error: any) {
      return Response.error(
        reply,
        'UPLOAD_ERROR',
        'Error uploading file',
        500,
        error.message
      )
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { fileId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { fileId } = req.params

      await this.storageService.deleteImage(fileId)

      return Response.success(reply, null, 'File deleted successfully')
    } catch (error: any) {
      if (error.name === 'FileNotFoundError') {
        return Response.notFound(reply, 'File', req.params.fileId)
      }

      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error deleting file',
        500,
        error.message
      )
    }
  }

  async getMetadata(
    req: FastifyRequest<{ Params: { fileId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { fileId } = req.params

      const metadata = await this.storageService.getFileMetadata(fileId)

      if (!metadata) {
        return Response.notFound(reply, 'File', fileId)
      }

      return Response.success(reply, metadata, 'File metadata retrieved')
    } catch (error: any) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error fetching file metadata',
        500,
        error.message
      )
    }
  }
}
```

### 5.9 Crear `storage.schema.ts`

```typescript
// src/features/storage/storage.schema.ts

export const storageSchemas = {
  upload: {
    description: 'Upload a file to Supabase Storage',
    tags: ['Storage'],
    consumes: ['multipart/form-data'],
    querystring: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          enum: ['CLUB', 'PLAYER', 'TROPHY', 'NEWS', 'GENERAL'],
        },
        entityId: { type: 'string' },
      },
      required: ['entityType'],
    },
    response: {
      201: {
        description: 'File uploaded successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fileName: { type: 'string' },
              publicUrl: { type: 'string' },
              bucket: { type: 'string' },
              entityType: { type: 'string' },
            },
          },
        },
      },
    },
  },
  delete: {
    description: 'Delete a file from storage',
    tags: ['Storage'],
    params: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
      },
      required: ['fileId'],
    },
    response: {
      200: {
        description: 'File deleted successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
    },
  },
  getMetadata: {
    description: 'Get file metadata',
    tags: ['Storage'],
    params: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
      },
      required: ['fileId'],
    },
  },
}
```

### 5.10 Crear `storage.routes.ts`

```typescript
// src/features/storage/storage.routes.ts

import { FastifyInstance } from 'fastify'
import { storageSchemas } from './storage.schema'

export const storageRoutes = async (fastify: FastifyInstance) => {
  const storageController = (fastify as any).container.resolve(
    'storageController'
  )

  fastify.post('/upload', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.upload,
    handler: storageController.upload.bind(storageController),
  })

  fastify.delete('/:fileId', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.delete,
    handler: storageController.delete.bind(storageController),
  })

  fastify.get('/:fileId/metadata', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.getMetadata,
    handler: storageController.getMetadata.bind(storageController),
  })
}
```

### 5.11 Registrar en Container

Actualizar `src/features/core/container/index.ts`:

```typescript
// Importar
import { StorageRepository } from '@/features/storage/storage.repository'
import { StorageService } from '@/features/storage/storage.service'
import { StorageController } from '@/features/storage/storage.controller'
import { SupabaseProvider } from '@/features/storage/providers/supabase.provider'

// En createDepencyContainer, agregar:
container.register({
  // ... registros existentes ...

  // Storage
  supabaseProvider: asClass(SupabaseProvider).singleton(),
  storageRepository: asClass(StorageRepository).singleton(),
  storageService: asClass(StorageService).singleton(),
  storageController: asClass(StorageController).singleton(),
})
```

### 5.12 Registrar Rutas en `app.ts`

```typescript
// Importar
import { storageRoutes } from '@/features/storage/storage.routes'

// Después del registro de multipart, agregar:
app.register(storageRoutes, { prefix: '/api/storage' })
```

---

## 6. Integración con Clubs

### 6.1 Actualizar `types/input.types.ts`

```typescript
export type CreateClubInput = {
  name: string
  logo?: string // URL de Supabase o ID de archivo
  logoFile?: Buffer // Archivo directo
  userId?: string | null
  isActive?: boolean
}
```

### 6.2 Actualizar `clubs.service.ts`

```typescript
import { StorageService } from '@/features/storage/storage.service'

export class ClubService {
  private clubRepository: IClubRepository
  private storageService: StorageService

  constructor({
    clubRepository,
    storageService,
  }: {
    clubRepository: IClubRepository
    storageService: StorageService
  }) {
    this.clubRepository = clubRepository
    this.storageService = storageService
  }

  async createClub({
    name,
    logo,
    logoFile,
    userId,
    isActive,
  }: CreateClubInput & { logoFile?: { buffer: Buffer; filename: string; mimetype: string } }) {
    const clubFound = await this.clubRepository.findOneByName(name)

    if (clubFound) {
      throw new ClubAlreadyExistsError()
    }

    let logoUrl = logo

    // Si viene un archivo, subirlo a Supabase
    if (logoFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: logoFile.buffer,
        fileName: logoFile.filename,
        mimeType: logoFile.mimetype,
        entityType: 'CLUB',
      })
      logoUrl = uploadResult.publicUrl
    }

    const clubData: Prisma.ClubCreateInput = {
      name,
      logo: logoUrl,
      isActive: isActive ?? true,
    }

    if (userId) {
      clubData.user = { connect: { id: userId } }
    }

    const newClub = await this.clubRepository.save(clubData)

    // Actualizar entityId del archivo
    if (logoFile) {
      // Aquí podrías actualizar el StorageFile con el entityId del club creado
    }

    return newClub
  }

  async updateClub(
    id: string,
    data: Prisma.ClubUpdateInput & { logoFile?: { buffer: Buffer; filename: string; mimetype: string } }
  ) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    let updateData = { ...data }

    // Si viene un nuevo logo, reemplazar el anterior
    if (data.logoFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: data.logoFile.buffer,
        fileName: data.logoFile.filename,
        mimeType: data.logoFile.mimetype,
        entityType: 'CLUB',
        entityId: id,
      })
      updateData.logo = uploadResult.publicUrl
      delete updateData.logoFile
    }

    const result = await this.clubRepository.updateOneById(id, updateData)

    return result
  }
}
```

### 6.3 Actualizar `clubs.controller.ts`

```typescript
async create(req: FastifyRequest, reply: FastifyReply) {
  try {
    // Manejar multipart/form-data
    const data = await req.file()
    
    const body = req.body as any
    const { name, userId, isActive } = body

    let logoFile = undefined
    if (data) {
      logoFile = {
        buffer: await data.toBuffer(),
        filename: data.filename,
        mimetype: data.mimetype,
      }
    }

    const validatedData = {
      name: Validator.string(name, 1, 100),
      ...(userId && { userId }),
      ...(isActive !== undefined && { isActive: Validator.boolean(isActive) }),
    }

    const newClub = await this.clubService.createClub({
      ...validatedData,
      logoFile,
    })

    const clubDTO = ClubMapper.toDTO(newClub)

    return Response.created(reply, clubDTO, 'Club created successfully')
  } catch (error: any) {
    return Response.validation(
      reply,
      error instanceof Error ? error.message : 'Validation failed',
      'Error while creating new club'
    )
  }
}
```

---

## 7. Integración con Players

Similar a Clubs, actualizar:
- `types/input.types.ts` → Agregar `avatarFile`
- `players.service.ts` → Manejar upload de avatar
- `players.controller.ts` → Procesar multipart

---

## 8. Feature de News

Crear toda la feature siguiendo el mismo patrón de Clubs:
- `news.repository.ts`
- `news.service.ts`
- `news.controller.ts`
- `news.routes.ts`
- `news.schema.ts`
- `news.errors.ts`

**Particularidad:** News puede tener múltiples imágenes (array).

---

## 9. Competition Types

Agregar campo `trophyImage` y manejar upload de imágenes de trofeos.

---

## 10. Testing y Limpieza

### 10.1 Job de Limpieza

Crear un script que elimine archivos huérfanos (sin entityId después de X días).

### 10.2 Tests

Crear tests unitarios para:
- `StorageService.uploadImage()`
- `StorageService.deleteImage()`
- `SupabaseProvider`

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Supabase Storage keys agregadas
- [ ] Dependencias instaladas
- [ ] Buckets creados en Supabase
- [ ] Políticas de seguridad configuradas
- [ ] Migraciones ejecutadas
- [ ] Storage feature implementada
- [ ] Container actualizado
- [ ] Rutas registradas
- [ ] Clubs integrado
- [ ] Players integrado
- [ ] News feature creada
- [ ] Competition Types actualizado
- [ ] Tests escritos
- [ ] Documentación actualizada

---

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install @supabase/supabase-js

# Generar Prisma Client
npm run generate

# Crear migración
npm run migrate

# Ejecutar servidor
npm run dev

# Tests
npm test
```

---

## 📚 Referencias

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Fastify Multipart](https://github.com/fastify/fastify-multipart)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Última actualización:** Enero 27, 2026
