export const storageSchemas = {
  upload: {
    description: 'Upload a file to Supabase Storage',
    tags: ['Storage'],
    consumes: ['multipart/form-data'],
    // Note: Body validation is skipped for multipart/form-data
    // Validation is done manually in the controller
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
              publicUrl: { type: 'string' },
            },
          },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
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
    },
  },
}
