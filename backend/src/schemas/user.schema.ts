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
        description: 'User registered successfully.',
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
