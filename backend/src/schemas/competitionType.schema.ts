export const competitionTypeSchemas = {
  create: {
    description: 'Create new competition type.',
    tags: ['Competition Type'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        format: { type: 'string' },
        hierarchy: { type: 'number' },
        category: { type: 'string' },
      },
      required: ['name'],
    },
    response: {
      200: {
        description: 'Competition Type created successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Error while creating new competition type.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findAll: {
    description: 'Fetch all competition types.',
    tags: ['Competition Type'],
    response: {
      200: {
        description: 'List of competition types.',
        type: 'object',
        properties: {
          competitionTypes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                format: { type: 'string' },
                hierarchy: { type: 'number' },
                category: { type: 'string' },
              },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching the competition types.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findOne: {
    description: 'Fetch a competition type by ID.',
    tags: ['Competition Type'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition type to fetch.',
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
          id: { type: 'string' },
          name: { type: 'string' },
          logo: { type: 'string' },
          userId: { type: 'string' },
        },
      },
      400: {
        description: 'Error while fetching the competition type.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update a competition type by ID.',
    tags: ['Competition Type'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        logo: { type: 'string' },
        userId: { type: 'string' },
      },
      additionalProperties: false,
    },
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition type to update.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'Competition type updated successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition type not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating the competition type.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete a competition type by ID.',
    tags: ['Competition Type'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition type to delete.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'Competition type deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition type not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while registering new competition type.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
