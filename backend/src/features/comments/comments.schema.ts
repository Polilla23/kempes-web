export const commentSchemas = {
  getByNewsId: {
    description: 'Get comments for a news article',
    tags: ['Comments'],
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1, default: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
      },
    },
  },
  create: {
    description: 'Create a comment on a news article',
    tags: ['Comments'],
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    body: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', minLength: 1 },
      },
    },
  },
  delete: {
    description: 'Delete a comment',
    tags: ['Comments'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        commentId: { type: 'string' },
      },
      required: ['id', 'commentId'],
    },
  },
}
