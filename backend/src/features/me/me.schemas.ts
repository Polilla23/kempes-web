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
  getUserClub: {
    description: 'Get authenticated user club data',
    tags: ['Account'],
    response: {
      200: {
        description: 'Club data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              logo: { type: 'string', nullable: true },
              isActive: { type: 'boolean' },
              playersOwned: { type: 'number' },
              playersActive: { type: 'number' },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
  getUserLeague: {
    description: 'Get authenticated user current league with standings',
    tags: ['Account'],
    response: {
      200: {
        description: 'League data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            nullable: true,
          },
        },
      },
    },
    skipSanitization: true,
  },
  getUserRecentMatches: {
    description: 'Get authenticated user recent matches',
    tags: ['Account'],
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Recent matches retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'array',
          },
        },
      },
    },
    skipSanitization: true,
  },
  getUserUpcomingMatches: {
    description: 'Get authenticated user upcoming matches',
    tags: ['Account'],
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Upcoming matches retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'array',
          },
        },
      },
    },
    skipSanitization: true,
  },
  getRecentMatches: {
    description: 'Get global recent matches for carousel',
    tags: ['Account'],
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Recent matches retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'array',
          },
        },
      },
    },
    skipSanitization: true,
  },
  getSeasonStats: {
    description: 'Get current season statistics',
    tags: ['Account'],
    response: {
      200: {
        description: 'Season stats retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              seasonNumber: { type: 'number' },
              playedMatches: { type: 'number' },
              pendingMatches: { type: 'number' },
              cancelledMatches: { type: 'number' },
              totalTransfers: { type: 'number' },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
}
