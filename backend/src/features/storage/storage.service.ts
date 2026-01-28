import { IStorageRepository } from './interfaces/IStorageRepository'
import { SupabaseProvider } from './providers/supabase.provider'
import { UploadFileInput, FileMetadata, ALLOWED_IMAGE_TYPES, ENTITY_TYPE_BUCKET_MAP } from '@/types'
import { FileNotFoundError, InvalidFileTypeError, FileSizeExceededError } from './storage.errors'
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

    // Determinar bucket según el tipo de entidad
    const bucket = ENTITY_TYPE_BUCKET_MAP[input.entityType]

    // Generar nombre único para el archivo
    const fileExtension = path.extname(input.fileName)
    const uniqueFileName = `${randomUUID()}${fileExtension}`
    const filePath = input.entityId
      ? `${input.entityType.toLowerCase()}/${input.entityId}/${uniqueFileName}`
      : `${input.entityType.toLowerCase()}/${uniqueFileName}`

    // Subir a Supabase
    const uploadResult = await this.supabaseProvider.uploadFile(bucket, filePath, input.file, input.mimeType)

    // Guardar metadata en BD
    const fileRecord = await this.storageRepository.save({
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
      id: fileRecord.id,
      fileName: fileRecord.fileName,
      originalName: fileRecord.originalName,
      fileSize: fileRecord.fileSize,
      mimeType: fileRecord.mimeType,
      bucket: fileRecord.bucket,
      path: fileRecord.path,
      publicUrl: fileRecord.publicUrl,
      entityType: fileRecord.entityType,
      entityId: fileRecord.entityId ?? undefined,
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

    if (!file) {
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
      entityId: file.entityId ?? undefined,
    }
  }

  async replaceImage(oldFileId: string, newFileInput: UploadFileInput): Promise<FileMetadata> {
    // Subir nuevo archivo
    const newFile = await this.uploadImage(newFileInput)

    // Eliminar archivo antiguo
    try {
      await this.deleteImage(oldFileId)
    } catch (error) {
      // Si falla al eliminar el antiguo, no es crítico
      console.error('Failed to delete old file:', error)
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
