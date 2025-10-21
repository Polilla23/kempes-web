export const myAccountSchemas = {
  getUserData: {
    description: 'Get authenticated user data',
    tags: ['Account'],
    response: {
      200: {
        description: 'User data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              isEmailVerified: { type: 'boolean' },
              emailVerificationExpires: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      400: {
        description: 'Bad request',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
    skipSanitization: true,
  },
  getBasicUserData: {
    description: 'Get basic user ID and role',
    tags: ['Account'],
    response: {
      200: {
        description: 'Basic user data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
}
