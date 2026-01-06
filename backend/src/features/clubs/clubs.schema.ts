export const clubsSchemas = {
  create: {
    description: 'Create new club.',
    tags: ['Clubs'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        logo: { type: 'string' },
        userId: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
      },
      required: ['name'],
    },
    response: {
      201: {
        description: 'Club created successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Error while creating new club.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findAll: {
    description: 'Fetch all clubs.',
    tags: ['Clubs'],
    response: {
      200: {
        description: 'List of clubs',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                logo: { type: 'string' },
                isActive: { type: 'boolean' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching the clubs.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findOne: {
    description: 'Fetch a club by ID.',
    tags: ['Clubs'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the club to update.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: '',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              logo: { type: 'string' },
              userId: { type: 'string' },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching the club.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update a club by ID.',
    tags: ['Clubs'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        logo: { type: 'string' },
        userId: { type: 'string' },
        isActive: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the club to update.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'Club updated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Club not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating the club.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Soft delete a club by ID (sets isActive to false).',
    tags: ['Clubs'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the club to delete.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'Club deleted successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Club not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while registering new club.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
