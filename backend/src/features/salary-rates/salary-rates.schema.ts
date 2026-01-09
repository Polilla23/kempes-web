export const salaryRatesSchemas = {
  create: {
    description: 'Create new salary rate.',
    tags: ['Salary Rates'],
    body: {
      type: 'object',
      properties: {
        minOverall: { type: 'number' },
        maxOverall: { type: 'number' },
        salary: { type: 'number' },
      },
      required: ['minOverall', 'maxOverall', 'salary'],
    },
    response: {
      201: {
        description: 'Salary rate created successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Error while creating new salary rate.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findAll: {
    description: 'Fetch all salary rates.',
    tags: ['Salary Rates'],
    response: {
      200: {
        description: 'List of salary rates',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                minOverall: { type: 'number' },
                maxOverall: { type: 'number' },
                salary: { type: 'number' },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
  findOne: {
    description: 'Fetch one salary rate by ID.',
    tags: ['Salary Rates'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Salary rate fetched successfully.',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              minOverall: { type: 'number' },
              maxOverall: { type: 'number' },
              salary: { type: 'number' },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
      404: {
        description: 'Salary rate not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update salary rate.',
    tags: ['Salary Rates'],
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
        minOverall: { type: 'number' },
        maxOverall: { type: 'number' },
        salary: { type: 'number' },
      },
    },
    response: {
      200: {
        description: 'Salary rate updated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Salary rate not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete salary rate.',
    tags: ['Salary Rates'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Salary rate deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Salary rate not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
