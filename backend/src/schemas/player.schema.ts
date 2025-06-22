export const playerSchemas = {
  create: {
    description: 'Create a new player.',
    tags: ['Player'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        lastName: { type: 'string' },
        birthdate: { type: 'string', pattern: '^\\d{2}/\\d{2}/\\d{4}$' },
        actualClubId: { type: 'string', format: 'uuid' },
        ownerClubId: { type: 'string', format: 'uuid' },
        overall: { type: 'number', minimum: 0, maximum: 99 },
        salary: { type: 'number' },
        sofifaId: { type: 'string' },
        transfermarktId: { type: 'string' },
        isKempesita: { type: 'boolean' },
        isActive: { type: 'boolean' }
      },
      required: ['name', 'lastName', 'birthdate', 'actualClubId', 'overall'],
    },
    response: {
      200: {
        description: 'Player created successfully.',
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          lastName: { type: 'string' },
          birthdate: { type: 'string', format: 'date-time' },
          actualClubId: { type: 'string', format: 'uuid' },
          ownerClubId: { type: 'string', format: 'uuid' },
          overall: { type: 'number' },
          salary: { type: 'number' },
          sofifaId: { type: 'string' },
          tranfermarktId: { type: 'string' },
          isKempesita: { type: 'boolean' },
          isActive: { type: 'boolean' }
        },
      },
      400: {
        description: 'Error while creating new player.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findAll: {
    description: 'Fetch all players',
    tags: ['Player'],
    response: {
      200: {
        description: 'List of players',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            lastName: { type: 'string' },
            birthdate: { type: 'string', format: 'date-time' },
            actualClubId: { type: 'string', format: 'uuid' },
            ownerClubId: { type: 'string', format: 'uuid' },
            overall: { type: 'number' },
            salary: { type: 'number' },
            sofifaId: { type: 'string' },
            tranfermarktId: { type: 'string' },
            isKempesita: { type: 'boolean' },
            isActive: { type: 'boolean' }
          },
        },
      },
    },
  },

  findOne: {
    description: 'Get a single player by ID',
    tags: ['Player'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: {
        description: 'Player found',
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          lastName: { type: 'string' },
          birthdate: { type: 'string', format: 'date-time' },
          actualClubId: { type: 'string', format: 'uuid' },
          ownerClubId: { type: 'string', format: 'uuid' },
          overall: { type: 'number' },
          salary: { type: 'number' },
          sofifaId: { type: 'string' },
          tranfermarktId: { type: 'string' },
          isKempesita: { type: 'boolean' },
          isActive: { type: 'boolean' }
        },
      },
      404: {
        description: 'Player not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },

  update: {
    description: 'Update a player by ID.',
    tags: ['Player'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        lastName: { type: 'string' },
        birthdate: { type: 'string', format: 'date-time' },
        actualClubId: { type: 'string', format: 'uuid' },
        ownerClubId: { type: 'string', format: 'uuid' },
        overall: { type: 'number' },
        salary: { type: 'number' },
        sofifaId: { type: 'string' },
        tranfermarktId: { type: 'string' },
        isKempesita: { type: 'boolean' },
        isActive: { type: 'boolean' }
      },
      additionalProperties: false,
    },
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the player to update',
          format: 'uuid',
        },
      },
      required: ['id']
    },
    response: {
      200: {
        description: 'Player updated successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating player',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  delete: {
    description: 'Delete a player by ID.',
    tags: ['Player'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the player to delete',
          format: 'uuid',
        },
      },
      required: ['id',]
    },
    response: {
      204: {
        description: 'Player deleted successfully',
        type: 'null',
      },
      404: {
        description: 'Player not found',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }
  }
}
