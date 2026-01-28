import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/features/core/config/env'
import { SupabaseUploadResult } from '@/types'
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
    contentType: string,
  ): Promise<SupabaseUploadResult> {
    const { data, error } = await this.client.storage.from(bucket).upload(path, file, {
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
      throw new Error(error.message)
    }

    return data
  }
}
