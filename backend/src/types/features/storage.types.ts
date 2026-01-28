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
