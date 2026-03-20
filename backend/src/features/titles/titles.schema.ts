export const titlesSchemas = {
  ranking: {
    description: 'Get the global all-time ranking of clubs by title points',
    tags: ['Titles'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array' },
        },
      },
    },
  },
  bySeasonAll: {
    description: 'Get champions grouped by season',
    tags: ['Titles'],
    querystring: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['SENIOR', 'KEMPESITA', 'MIXED'] },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array' },
        },
      },
    },
  },
  bySeasonNumber: {
    description: 'Get champions for a specific season number',
    tags: ['Titles'],
    params: {
      type: 'object',
      properties: {
        seasonNumber: { type: 'string' },
      },
      required: ['seasonNumber'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
    },
  },
  byCompetition: {
    description: 'Get all-time champions list for a specific competition',
    tags: ['Titles'],
    params: {
      type: 'object',
      properties: {
        competitionName: { type: 'string' },
      },
      required: ['competitionName'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  pointConfigs: {
    description: 'Get all title point configurations',
    tags: ['Titles'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array' },
        },
      },
    },
  },
  updatePointConfig: {
    description: 'Update point value for a title point config by ID',
    tags: ['Titles'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        points: { type: 'number', minimum: 0 },
      },
      required: ['points'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
}
