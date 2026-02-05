export const transferWindowsSchemas = {
  findAll: {
    description: 'Fetch all transfer windows.',
    tags: ['Transfer Windows'],
    response: {
      200: {
        description: 'List of transfer windows',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                seasonHalfId: { type: 'string' },
                name: { type: 'string' },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                status: { type: 'string' },
                seasonHalf: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  findOne: {
    description: 'Fetch one transfer window by ID.',
    tags: ['Transfer Windows'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Transfer window fetched successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Transfer window not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  findActive: {
    description: 'Fetch the active transfer window.',
    tags: ['Transfer Windows'],
    response: {
      200: {
        description: 'Active transfer window fetched successfully.',
        type: 'object',
        properties: {
          data: { type: 'object', nullable: true },
        },
      },
    },
  },
  isOpen: {
    description: 'Check if transfer window is open.',
    tags: ['Transfer Windows'],
    response: {
      200: {
        description: 'Transfer window status.',
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              isOpen: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
  findBySeasonHalfId: {
    description: 'Fetch all transfer windows by season half ID.',
    tags: ['Transfer Windows'],
    params: {
      type: 'object',
      properties: {
        seasonHalfId: { type: 'string' },
      },
      required: ['seasonHalfId'],
    },
    response: {
      200: {
        description: 'Transfer windows for the season half.',
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  create: {
    description: 'Create a new transfer window.',
    tags: ['Transfer Windows'],
    body: {
      type: 'object',
      properties: {
        seasonHalfId: { type: 'string' },
        name: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
      required: ['seasonHalfId', 'name', 'startDate', 'endDate'],
    },
    response: {
      201: {
        description: 'Transfer window created successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Error while creating transfer window.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  open: {
    description: 'Open a transfer window.',
    tags: ['Transfer Windows'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Transfer window opened successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      400: {
        description: 'Cannot open transfer window.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  close: {
    description: 'Close a transfer window.',
    tags: ['Transfer Windows'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Transfer window closed successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Transfer window not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  update: {
    description: 'Update transfer window.',
    tags: ['Transfer Windows'],
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
        name: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Transfer window updated successfully.',
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
      404: {
        description: 'Transfer window not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  delete: {
    description: 'Delete a transfer window.',
    tags: ['Transfer Windows'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Transfer window deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Transfer window not found.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
