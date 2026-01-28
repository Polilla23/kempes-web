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
        return Response.badRequest(reply, 'No file provided')
      }

      const fileBuffer = await data.toBuffer()
      const { entityType, entityId } = req.body as {
        entityType: EntityType
        entityId?: string
      }

      if (!entityType) {
        return Response.badRequest(reply, 'Entity type is required')
      }

      const result = await this.storageService.uploadImage({
        file: fileBuffer,
        fileName: data.filename,
        mimeType: data.mimetype,
        entityType,
        entityId,
        uploadedBy: (req.user as any)?.id,
      })

      return Response.created(reply, result, 'File uploaded successfully')
    } catch (error: any) {
      if (error.name === 'InvalidFileTypeError') {
        return Response.badRequest(reply, error.message)
      }
      if (error.name === 'FileSizeExceededError') {
        return Response.badRequest(reply, error.message)
      }
      if (error.name === 'UploadFailedError') {
        return Response.internal(reply, error.message)
      }
      return Response.internal(reply, 'Failed to upload file')
    }
  }

  async delete(req: FastifyRequest<{ Params: { fileId: string } }>, reply: FastifyReply) {
    try {
      const { fileId } = req.params

      await this.storageService.deleteImage(fileId)

      return Response.success(reply, null, 'File deleted successfully')
    } catch (error: any) {
      if (error.name === 'FileNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      if (error.name === 'DeleteFailedError') {
        return Response.internal(reply, error.message)
      }
      return Response.internal(reply, 'Failed to delete file')
    }
  }

  async getMetadata(req: FastifyRequest<{ Params: { fileId: string } }>, reply: FastifyReply) {
    try {
      const { fileId } = req.params

      const metadata = await this.storageService.getFileMetadata(fileId)

      if (!metadata) {
        return Response.notFound(reply, 'File not found')
      }

      return Response.success(reply, metadata)
    } catch (error: any) {
      return Response.internal(reply, 'Failed to retrieve file metadata')
    }
  }
}
