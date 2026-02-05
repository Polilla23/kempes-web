import { FastifySchema } from 'fastify'

const transferResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    type: { type: 'string', enum: ['PURCHASE', 'SALE', 'LOAN_IN', 'LOAN_OUT', 'AUCTION', 'FREE_AGENT', 'INACTIVE_STATUS', 'RETURN_FROM_LOAN'] },
    status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID'] },
    playerId: { type: 'string', format: 'uuid' },
    fromClubId: { type: 'string', format: 'uuid' },
    toClubId: { type: 'string', format: 'uuid' },
    initiatorClubId: { type: 'string', format: 'uuid', nullable: true },
    transferWindowId: { type: 'string', format: 'uuid', nullable: true },
    seasonHalfId: { type: 'string', format: 'uuid' },
    totalAmount: { type: 'number' },
    numberOfInstallments: { type: 'number' },
    loanDurationHalves: { type: 'number', nullable: true },
    returnSeasonHalfId: { type: 'string', format: 'uuid', nullable: true },
    loanFee: { type: 'number', nullable: true },
    loanSalaryPercentage: { type: 'number', nullable: true },
    notes: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    completedAt: { type: 'string', format: 'date-time', nullable: true },
    player: { type: 'object', nullable: true },
    fromClub: { type: 'object', nullable: true },
    toClub: { type: 'object', nullable: true },
    initiatorClub: { type: 'object', nullable: true },
    installments: { type: 'array', items: { type: 'object' } },
    playersAsPayment: { type: 'array', items: { type: 'object' } },
  },
}

const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: transferResponse,
    message: { type: 'string' },
  },
}

const arraySuccessResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: { type: 'array', items: transferResponse },
    message: { type: 'string' },
  },
}

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'string' },
      },
    },
  },
}

export const transfersSchemas: Record<string, FastifySchema> = {
  findAll: {
    summary: 'Get all transfers',
    description: 'Retrieve all transfers with optional filters',
    tags: ['Transfers'],
    querystring: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['PURCHASE', 'SALE', 'LOAN_IN', 'LOAN_OUT', 'AUCTION', 'FREE_AGENT', 'INACTIVE_STATUS', 'RETURN_FROM_LOAN'] },
        status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID'] },
        seasonHalfId: { type: 'string', format: 'uuid' },
        transferWindowId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse,
      500: errorResponse,
    },
  },

  findOne: {
    summary: 'Get transfer by ID',
    description: 'Retrieve a single transfer by its ID',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  findByPlayerId: {
    summary: 'Get transfers by player ID',
    description: 'Retrieve all transfers for a specific player',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['playerId'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse,
      500: errorResponse,
    },
  },

  findByClubId: {
    summary: 'Get transfers by club ID',
    description: 'Retrieve all transfers for a specific club',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['clubId'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
      },
    },
    querystring: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['from', 'to', 'both'] },
      },
    },
    response: {
      200: arraySuccessResponse,
      500: errorResponse,
    },
  },

  findActiveLoans: {
    summary: 'Get active loans',
    description: 'Retrieve all active loan transfers',
    tags: ['Transfers'],
    response: {
      200: arraySuccessResponse,
      500: errorResponse,
    },
  },

  getRosterCount: {
    summary: 'Get club roster count',
    description: 'Get the current roster count for a club',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['clubId'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              seniorCount: { type: 'number' },
              kempesitaCount: { type: 'number' },
            },
          },
          message: { type: 'string' },
        },
      },
      500: errorResponse,
    },
  },

  findPendingConfirmations: {
    summary: 'Get pending confirmations for a club',
    description: 'Retrieve transfers that require approval from the specified club',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['clubId'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse,
      500: errorResponse,
    },
  },

  approve: {
    summary: 'Approve a pending transfer',
    description: 'Approve a transfer that is waiting for confirmation. This will move the player and change status.',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      400: errorResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  reject: {
    summary: 'Reject a pending transfer',
    description: 'Reject a transfer that is waiting for confirmation. This will cancel the transfer.',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      400: errorResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  create: {
    summary: 'Create a transfer',
    description: 'Create a new transfer (purchase/sale). Transfer starts in PENDING status until the other club approves it.',
    tags: ['Transfers'],
    body: {
      type: 'object',
      required: ['type', 'playerId', 'fromClubId', 'toClubId', 'initiatorClubId', 'totalAmount'],
      properties: {
        type: { type: 'string', enum: ['PURCHASE', 'SALE'] },
        playerId: { type: 'string', format: 'uuid' },
        fromClubId: { type: 'string', format: 'uuid' },
        toClubId: { type: 'string', format: 'uuid' },
        initiatorClubId: { type: 'string', format: 'uuid' },
        totalAmount: { type: 'number', minimum: 0 },
        numberOfInstallments: { type: 'number', minimum: 1, default: 1 },
        transferWindowId: { type: 'string', format: 'uuid' },
        installments: {
          type: 'array',
          items: {
            type: 'object',
            required: ['amount', 'dueSeasonHalfId'],
            properties: {
              amount: { type: 'number', minimum: 0 },
              dueSeasonHalfId: { type: 'string', format: 'uuid' },
            },
          },
        },
        playersAsPayment: {
          type: 'array',
          items: {
            type: 'object',
            required: ['playerId', 'valuationAmount'],
            properties: {
              playerId: { type: 'string', format: 'uuid' },
              valuationAmount: { type: 'number', minimum: 0 },
            },
          },
        },
        notes: { type: 'string' },
      },
    },
    response: {
      201: successResponse,
      400: errorResponse,
      500: errorResponse,
    },
  },

  createLoan: {
    summary: 'Create a loan',
    description: 'Create a new loan transfer',
    tags: ['Transfers'],
    body: {
      type: 'object',
      required: ['playerId', 'fromClubId', 'toClubId', 'loanDurationHalves'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
        fromClubId: { type: 'string', format: 'uuid' },
        toClubId: { type: 'string', format: 'uuid' },
        loanDurationHalves: { type: 'number', minimum: 1, maximum: 8 },
        loanFee: { type: 'number', minimum: 0 },
        numberOfInstallments: { type: 'number', minimum: 1, default: 1 },
        loanSalaryPercentage: { type: 'number', minimum: 0, maximum: 100, default: 100 },
        transferWindowId: { type: 'string', format: 'uuid' },
        notes: { type: 'string' },
      },
    },
    response: {
      201: successResponse,
      400: errorResponse,
      500: errorResponse,
    },
  },

  createAuction: {
    summary: 'Create an auction',
    description: 'Create a new auction transfer',
    tags: ['Transfers'],
    body: {
      type: 'object',
      required: ['playerId', 'toClubId', 'auctionPrice'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
        toClubId: { type: 'string', format: 'uuid' },
        auctionPrice: { type: 'number', minimum: 0 },
        notes: { type: 'string' },
      },
    },
    response: {
      201: successResponse,
      400: errorResponse,
      500: errorResponse,
    },
  },

  signFreeAgent: {
    summary: 'Sign a free agent',
    description: 'Sign a player from the free agents club',
    tags: ['Transfers'],
    body: {
      type: 'object',
      required: ['playerId', 'toClubId', 'signingFee', 'freeClubId'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
        toClubId: { type: 'string', format: 'uuid' },
        signingFee: { type: 'number', minimum: 0 },
        freeClubId: { type: 'string', format: 'uuid' },
        notes: { type: 'string' },
      },
    },
    response: {
      201: successResponse,
      400: errorResponse,
      500: errorResponse,
    },
  },

  markInactive: {
    summary: 'Mark player as inactive',
    description: 'Create a transfer to mark a player as inactive',
    tags: ['Transfers'],
    body: {
      type: 'object',
      required: ['playerId', 'clubId'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
        clubId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      400: errorResponse,
      500: errorResponse,
    },
  },

  complete: {
    summary: 'Complete a transfer',
    description: 'Mark a transfer as completed',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  cancel: {
    summary: 'Cancel a transfer',
    description: 'Cancel a pending transfer',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  delete: {
    summary: 'Delete a transfer',
    description: 'Delete a transfer record',
    tags: ['Transfers'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'null' },
          message: { type: 'string' },
        },
      },
      404: errorResponse,
      500: errorResponse,
    },
  },
}
