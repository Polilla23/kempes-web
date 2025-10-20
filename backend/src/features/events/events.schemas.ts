export const eventsSchemas = {
  create: {
    description: 'Create new event.',
    tags: ['Events'],
    body: {
      type: 'object',
      properties: {
        typeId: { type: 'string', format: 'uuid' },
        playerId: { type: 'string', format: 'uuid' },
        matchId: { type: 'string', format: 'uuid' },
      },
      required: ['typeId', 'playerId', 'matchId'],
    },
    response: {
      201: {
        description: 'Event created successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Error while creating new event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findAll: {
    description: 'Fetch all events.',
    tags: ['Events'],
    response: {
      200: {
        description: 'List of events',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
                player: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                match: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    homeTeam: { type: 'string' },
                    awayTeam: { type: 'string' },
                  },
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching events.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findOne: {
    description: 'Fetch an event by ID.',
    tags: ['Events'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the event.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Event details',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
              player: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              match: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  homeTeam: { type: 'string' },
                  awayTeam: { type: 'string' },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      404: {
        description: 'Event not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findByMatchId: {
    description: 'Fetch events by match ID.',
    tags: ['Events'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the match.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Event details',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
      400: {
        description: 'Error while fetching event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      404: {
        description: 'Events not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findByPlayerId: {
    description: 'Fetch events by player ID.',
    tags: ['Events'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the player.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Event details',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
      400: {
        description: 'Error while fetching event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      404: {
        description: 'Events not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  update: {
    description: 'Update an event by ID.',
    tags: ['Events'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the event to update.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        typeId: { type: 'string', format: 'uuid' },
        playerId: { type: 'string', format: 'uuid' },
        matchId: { type: 'string', format: 'uuid' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: 'Event updated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Event not found.',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating the event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  delete: {
    description: 'Delete an event by ID.',
    tags: ['Events'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the event to delete.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      204: {
        description: 'Event deleted successfully.',
      },
      404: {
        description: 'Event not found.',
        properties: {
          message: { type: 'string' },
        },
      },
      400: {
        description: 'Error while deleting the event.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
