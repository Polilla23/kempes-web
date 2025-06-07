export const userSchemas = {
  register: {
    description: 'Register new user.',
    tags: ['Auth'],
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'user'] },
      },
      required: ['email', 'password'],
    },
    response: {
      200: {
        description: 'User registered successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Error while registering new user.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete a user by ID.',
    tags: ['User'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the user to delete',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'User deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'User not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while registering new user.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findAll: {
    description: 'Fetch all users.',
    tags: ['User'],
    response: {
      200: {
        description: '',
        type: 'array',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
        },
      },
      400: {
        description: 'Error while fetching the users.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update a user by ID.',
    tags: ['User'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the user to delete',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    responses: {
      200: {
        description: 'User updated successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'User not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating the user.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  login: {},
  logout: {},
}
