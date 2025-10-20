export const usersSchemas = {
  register: {
    description: 'Register new user.',
    tags: ['Auth'],
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        role: { type: 'string', enum: ['ADMIN', 'USER'] },
      },
      required: ['email', 'password'],
    },
    response: {
      201: {
        description: 'User registered successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request while registering new user.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  login: {
    description: 'Login a user',
    tags: ['Auth'],
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
    response: {
      200: {
        description: 'Successful login',
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  logout: {
    description: 'Logout a user',
    tags: ['Auth'],
    response: {
      200: {
        description: 'Successful logout',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  findAll: {
    description: 'Fetch all users.',
    tags: ['Users'],
    response: {
      200: {
        description: 'Users retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                isVerified: { type: 'boolean' },
                club: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
              },
            },
          },
        },
      },
      400: {
        description: 'message while fetching the users.',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  verifyEmail: {
    description: 'Verify user email',
    tags: ['Auth'],
    params: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Email verified successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        properties: {
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Failed to verify email',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  resendVerificationEmail: {
    description: 'Resend verification email',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email' },
      },
    },
    response: {
      200: {
        description: 'Verification email resent successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Failed to resend verification email',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  requestPasswordReset: {
    description: 'Request password reset',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email' },
      },
    },
    response: {
      200: {
        description: 'Reset password email sent successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Failed to send reset password email',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  verifyResetPasswordToken: {
    description: 'Verify reset password token',
    tags: ['Auth'],
    params: {
      type: 'object',
      required: ['token'],
    },
    response: {
      200: {
        description: 'Reset password token verified',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  resetPassword: {
    description: 'Reset password',
    tags: ['Auth'],
    params: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['password'],
      properties: {
        password: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Password has been reset successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Failed to reset password',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update a user by ID.',
    tags: ['Users'],
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        pasword: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'USER'] },
      },
      additionalProperties: false,
    },
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the user to update',
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
          data: { type: 'object' },
        },
      },
      404: {
        description: 'User not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'message while updating the user.',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete a user by ID.',
    tags: ['Users'],
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
      204: {
        description: 'User deleted successfully.',
      },
      404: {
        description: 'User not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'message while registering new user.',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
}
