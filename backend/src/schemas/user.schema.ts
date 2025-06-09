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
  verifyEmail: {
    description: 'Verify user email',
    tags: ['Auth'],
    params: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      }
    },
    response: {
      200: {
        description: 'Email verified successfully',
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        description: 'Bad request',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' }
        }
      },
      500: {
        description: 'Failed to verify email',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  resendVerificationEmail: {
    description: 'Resend verification email',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email'}
      }
    },
    response: {
      200: {
        description: 'Verification email resent successfully',
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        description: 'Failed to resend verification email',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  requestPasswordReset: {
    description: 'Request password reset',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email'}
      }
    },
    response: {
    200: {
        description: 'Reset password email sent successfully',
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        description: 'Failed to send reset password email',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  resetPassword: {
    description: 'Reset password',
    tags: ['Auth'],
    params: {
      type: 'object',
      required: ['token'],
      properties: {
        email: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      required: ['password'],
      properties: {
        password: { type: 'string' }
      }
    },
    response: {
    200: {
        description: 'Password has been reset successfully',
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        description: 'Failed to reset password',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  update: {
    description: 'Update a user by ID.',
    tags: ['User'],
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        pasword: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'user']}
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
  login: {},
  logout: {},
}
