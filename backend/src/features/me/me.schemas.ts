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
    description: 'Get user profile data (id, role, email, username, avatar)',
    tags: ['Account'],
    response: {
      200: {
        description: 'User profile data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              role: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              avatar: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
  updateProfile: {
    description: 'Update authenticated user profile (username, avatar)',
    tags: ['Account'],
    consumes: ['multipart/form-data', 'application/json'],
    response: {
      200: {
        description: 'Profile updated successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              avatar: { type: 'string', nullable: true },
              role: { type: 'string' },
              createdAt: { type: 'string' },
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
              preferredFormation: { type: 'string' },
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
              seasonId: { type: 'string' },
              playedMatches: { type: 'number' },
              pendingMatches: { type: 'number' },
              cancelledMatches: { type: 'number' },
              totalTransfers: { type: 'number' },
              champions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    competitionType: { type: 'string' },
                    clubName: { type: 'string' },
                    clubLogo: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
  getDashboardData: {
    description: 'Get consolidated dashboard data for the authenticated user',
    tags: ['Account'],
    response: {
      200: {
        description: 'Dashboard data retrieved successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            nullable: true,
            properties: {
              club: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  logo: { type: 'string', nullable: true },
                  preferredFormation: { type: 'string' },
                  titles: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      titles: { type: 'array' },
                    },
                  },
                },
              },
              squad: {
                type: 'object',
                properties: {
                  squadValue: { type: 'number' },
                  players: { type: 'array' },
                },
              },
              upcomingMatches: { type: 'array' },
            },
          },
        },
      },
    },
    skipSanitization: true,
  },
  updatePreferredFormation: {
    description: 'Update preferred formation for the authenticated user club',
    tags: ['Account'],
    body: {
      type: 'object',
      required: ['formation'],
      properties: {
        formation: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Formation updated successfully',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              preferredFormation: { type: 'string', nullable: true },
            },
          },
        },
      },
      400: {
        description: 'Invalid formation',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
    skipSanitization: true,
  },
}
