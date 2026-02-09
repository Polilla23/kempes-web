export const newsSchemas = {
  create: {
    description: 'Create a new news article',
    tags: ['News'],
    body: {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: { type: 'string', minLength: 1 },
        content: { type: 'string', minLength: 1 },
        images: {
          type: 'array',
          items: { type: 'string' },
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        isPublished: { type: 'boolean', default: true },
      },
    },
    response: {
      201: {
        description: 'News created successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
        },
      },
    },
  },
  getById: {
    description: 'Get a news article by ID',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
  },
  getAll: {
    description: 'Get all news articles with filters and pagination',
    tags: ['News'],
    querystring: {
      type: 'object',
      properties: {
        authorId: { type: 'string' },
        tags: { type: 'string', description: 'Comma-separated tags' },
        isPublished: { type: 'string', enum: ['true', 'false'] },
        search: { type: 'string' },
        page: { type: 'number', minimum: 1, default: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      },
    },
  },
  update: {
    description: 'Update a news article',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string' },
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        isPublished: { type: 'boolean' },
      },
    },
  },
  delete: {
    description: 'Delete a news article',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
  },
  addImage: {
    description: 'Add an image to a news article',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      required: ['imageUrl'],
      properties: {
        imageUrl: { type: 'string' },
      },
    },
  },
  removeImage: {
    description: 'Remove an image from a news article',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      required: ['imageUrl'],
      properties: {
        imageUrl: { type: 'string' },
      },
    },
  },
  toggleLike: {
    description: 'Toggle like on a news article',
    tags: ['News'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Like toggled successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              liked: { type: 'boolean' },
              likesCount: { type: 'number' },
            },
          },
        },
      },
    },
  },
}
