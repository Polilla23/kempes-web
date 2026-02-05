export const seasonHalvesSchemas = {
  findAll: {
    description: 'Fetch all season halves.',
    tags: ['Season Halves'],
    response: {
      200: {
        description: 'List of season halves',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                seasonId: { type: 'string' },
                seasonNumber: { type: 'number' },
                halfType: { type: 'string' },
                startDate: { type: 'string', nullable: true },
                endDate: { type: 'string', nullable: true },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
  findOne: {
    description: 'Fetch one season half by ID.',
    tags: ['Season Halves'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Season half fetched successfully.',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              seasonId: { type: 'string' },
              seasonNumber: { type: 'number' },
              halfType: { type: 'string' },
              startDate: { type: 'string', nullable: true },
              endDate: { type: 'string', nullable: true },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
      404: {
        description: 'Season half not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findActive: {
    description: 'Fetch the active season half.',
    tags: ['Season Halves'],
    response: {
      200: {
        description: 'Active season half fetched successfully.',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              seasonId: { type: 'string' },
              seasonNumber: { type: 'number' },
              halfType: { type: 'string' },
              startDate: { type: 'string', nullable: true },
              endDate: { type: 'string', nullable: true },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
      404: {
        description: 'No active season half found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findBySeasonId: {
    description: 'Fetch all season halves by season ID.',
    tags: ['Season Halves'],
    params: {
      type: 'object',
      properties: {
        seasonId: { type: 'string' },
      },
      required: ['seasonId'],
    },
    response: {
      200: {
        description: 'Season halves for the season fetched successfully.',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                seasonId: { type: 'string' },
                seasonNumber: { type: 'number' },
                halfType: { type: 'string' },
                startDate: { type: 'string', nullable: true },
                endDate: { type: 'string', nullable: true },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
  create: {
    description: 'Create season halves for a season.',
    tags: ['Season Halves'],
    body: {
      type: 'object',
      properties: {
        seasonId: { type: 'string' },
      },
      required: ['seasonId'],
    },
    response: {
      201: {
        description: 'Season halves created successfully.',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      },
      400: {
        description: 'Error while creating season halves.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  activate: {
    description: 'Activate a season half.',
    tags: ['Season Halves'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Season half activated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Season half not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  advance: {
    description: 'Advance to the next season half.',
    tags: ['Season Halves'],
    response: {
      200: {
        description: 'Advanced to next season half successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Cannot advance to next season half.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update season half dates.',
    tags: ['Season Halves'],
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
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Season half updated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Season half not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete a season half.',
    tags: ['Season Halves'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Season half deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Season half not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
