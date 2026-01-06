export const seasonsSchemas = {
  create: {
    description: 'Create new season.',
    tags: ['Seasons'],
    body: {
      type: 'object',
      properties: {
        number: { type: 'integer', minimum: 1 },
        isActive: { type: 'boolean' },
      },
      required: ['number'],
    },
    response: {
      201: {
        description: 'Season created successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      400: {
        description: 'Validation error.',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      409: {
        description: 'Season already exists.',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  findAll: {
    description: 'Fetch all seasons.',
    tags: ['Seasons'],
    response: {
      200: {
        description: 'List of seasons',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                number: { type: 'integer' },
                isActive: { type: 'boolean' },
              },
            },
          },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  findActive: {
    description: 'Fetch the active season.',
    tags: ['Seasons'],
    response: {
      200: {
        description: 'Active season details',
        type: 'object',
        properties: {
          data: { type: 'object' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      404: {
        description: 'No active season found',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  findOne: {
    description: 'Fetch a season by ID.',
    tags: ['Seasons'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Season details',
        type: 'object',
        properties: {
          data: { type: 'object' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      404: {
        description: 'Season not found',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  update: {
    description: 'Update a season by ID.',
    tags: ['Seasons'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        number: { type: 'integer', minimum: 1 },
        isActive: { type: 'boolean' },
      },
    },
    response: {
      200: {
        description: 'Season updated successfully',
        type: 'object',
        properties: {
          data: { type: 'object' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      404: {
        description: 'Season not found',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      409: {
        description: 'Conflict error',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  delete: {
    description: 'Delete a season by ID.',
    tags: ['Seasons'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
      required: ['id'],
    },
    response: {
      204: {
        description: 'Season deleted successfully (no content)',
        type: 'null',
      },
      404: {
        description: 'Season not found',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
}
