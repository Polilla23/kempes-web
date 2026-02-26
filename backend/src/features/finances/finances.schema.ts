import { FastifySchema } from 'fastify'

const transactionResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    clubId: { type: 'string', format: 'uuid' },
    type: {
      type: 'string',
      enum: [
        'TRANSFER_INCOME',
        'TRANSFER_EXPENSE',
        'LOAN_FEE_INCOME',
        'LOAN_FEE_EXPENSE',
        'PRIZE_INCOME',
        'FINE_EXPENSE',
        'SALARY_EXPENSE',
        'BONUS_INCOME',
        'AUCTION_INCOME',
        'AUCTION_EXPENSE',
        'PLAYER_SWAP_CREDIT',
        'PLAYER_SWAP_DEBIT',
      ],
    },
    amount: { type: 'number' },
    description: { type: 'string' },
    transferId: { type: 'string', format: 'uuid', nullable: true },
    installmentId: { type: 'string', format: 'uuid', nullable: true },
    seasonHalfId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    club: { type: 'object', nullable: true },
    seasonHalf: { type: 'object', nullable: true },
  },
}

const balanceResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    clubId: { type: 'string', format: 'uuid' },
    seasonHalfId: { type: 'string', format: 'uuid' },
    startingBalance: { type: 'number' },
    totalIncome: { type: 'number' },
    totalExpenses: { type: 'number' },
    endingBalance: { type: 'number' },
    totalSalaries: { type: 'number' },
    club: { type: 'object', nullable: true },
    seasonHalf: { type: 'object', nullable: true },
  },
}

const prizeResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    competitionTypeId: { type: 'string', format: 'uuid' },
    position: { type: 'number' },
    prizeAmount: { type: 'number' },
    description: { type: 'string', nullable: true },
    competitionType: { type: 'object', nullable: true },
  },
}

const successResponse = (data: any) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data,
    message: { type: 'string' },
  },
})

const arraySuccessResponse = (item: any) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: { type: 'array', items: item },
    message: { type: 'string' },
  },
})

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

export const financesSchemas: Record<string, FastifySchema> = {
  // ==================== Transactions ====================
  findAllTransactions: {
    summary: 'Get all transactions',
    description: 'Retrieve all financial transactions with optional filters',
    tags: ['Finances'],
    querystring: {
      type: 'object',
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        seasonHalfId: { type: 'string', format: 'uuid' },
        type: { type: 'string' },
      },
    },
    response: {
      200: arraySuccessResponse(transactionResponse),
      500: errorResponse,
    },
  },

  findTransaction: {
    summary: 'Get transaction by ID',
    description: 'Retrieve a single financial transaction by its ID',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse(transactionResponse),
      404: errorResponse,
      500: errorResponse,
    },
  },

  findTransactionsByClub: {
    summary: 'Get transactions by club ID',
    description: 'Retrieve all financial transactions for a specific club',
    tags: ['Finances'],
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
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse(transactionResponse),
      500: errorResponse,
    },
  },

  createTransaction: {
    summary: 'Create a transaction',
    description: 'Create a new financial transaction',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['clubId', 'type', 'amount', 'description'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        type: {
          type: 'string',
          enum: [
            'TRANSFER_INCOME',
            'TRANSFER_EXPENSE',
            'LOAN_FEE_INCOME',
            'LOAN_FEE_EXPENSE',
            'PRIZE_INCOME',
            'FINE_EXPENSE',
            'SALARY_EXPENSE',
            'BONUS_INCOME',
            'AUCTION_INCOME',
            'AUCTION_EXPENSE',
            'PLAYER_SWAP_CREDIT',
            'PLAYER_SWAP_DEBIT',
          ],
        },
        amount: { type: 'number' },
        description: { type: 'string' },
        transferId: { type: 'string', format: 'uuid' },
        installmentId: { type: 'string', format: 'uuid' },
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      201: successResponse(transactionResponse),
      400: errorResponse,
      500: errorResponse,
    },
  },

  // ==================== Balances ====================
  getClubBalance: {
    summary: 'Get club balance',
    description: 'Get the current balance for a club',
    tags: ['Finances'],
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
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse(balanceResponse),
      500: errorResponse,
    },
  },

  getAllClubBalances: {
    summary: 'Get all club balances',
    description: 'Get all historical balances for a club',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['clubId'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse(balanceResponse),
      500: errorResponse,
    },
  },

  getSeasonHalfBalances: {
    summary: 'Get season half balances',
    description: 'Get all club balances for a specific season half',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['seasonHalfId'],
      properties: {
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse(balanceResponse),
      500: errorResponse,
    },
  },

  initializeClubBalance: {
    summary: 'Initialize club balance',
    description: 'Initialize a club balance for a season half',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['clubId', 'seasonHalfId'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        seasonHalfId: { type: 'string', format: 'uuid' },
        startingBalance: { type: 'number', default: 0 },
      },
    },
    response: {
      201: successResponse(balanceResponse),
      400: errorResponse,
      500: errorResponse,
    },
  },

  // ==================== Prizes ====================
  findAllPrizes: {
    summary: 'Get all prizes',
    description: 'Retrieve all competition prizes configuration',
    tags: ['Finances'],
    response: {
      200: arraySuccessResponse(prizeResponse),
      500: errorResponse,
    },
  },

  findPrizesByCompetitionType: {
    summary: 'Get prizes by competition type',
    description: 'Retrieve all prizes for a specific competition type',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['competitionTypeId'],
      properties: {
        competitionTypeId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: arraySuccessResponse(prizeResponse),
      500: errorResponse,
    },
  },

  findPrize: {
    summary: 'Get prize by ID',
    description: 'Retrieve a single prize by its ID',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      200: successResponse(prizeResponse),
      404: errorResponse,
      500: errorResponse,
    },
  },

  createPrize: {
    summary: 'Create a prize',
    description: 'Create a new competition prize configuration',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['competitionTypeId', 'position', 'prizeAmount'],
      properties: {
        competitionTypeId: { type: 'string', format: 'uuid' },
        position: { type: 'number', minimum: 1 },
        prizeAmount: { type: 'number', minimum: 0 },
        description: { type: 'string' },
      },
    },
    response: {
      201: successResponse(prizeResponse),
      400: errorResponse,
      500: errorResponse,
    },
  },

  updatePrize: {
    summary: 'Update a prize',
    description: 'Update an existing competition prize',
    tags: ['Finances'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    body: {
      type: 'object',
      properties: {
        prizeAmount: { type: 'number', minimum: 0 },
        description: { type: 'string' },
      },
    },
    response: {
      200: successResponse(prizeResponse),
      404: errorResponse,
      500: errorResponse,
    },
  },

  deletePrize: {
    summary: 'Delete a prize',
    description: 'Delete a competition prize configuration',
    tags: ['Finances'],
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

  awardPrize: {
    summary: 'Award a prize',
    description: 'Award a competition prize to a club',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['clubId', 'competitionTypeId', 'position'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        competitionTypeId: { type: 'string', format: 'uuid' },
        position: { type: 'number', minimum: 1 },
        seasonHalfId: { type: 'string', format: 'uuid' },
        description: { type: 'string' },
      },
    },
    response: {
      201: successResponse(transactionResponse),
      400: errorResponse,
      404: errorResponse,
      500: errorResponse,
    },
  },

  // ==================== Fines & Bonuses ====================
  recordFine: {
    summary: 'Record a fine',
    description: 'Record a fine for a club',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['clubId', 'amount', 'description'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        amount: { type: 'number', minimum: 0 },
        description: { type: 'string' },
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      201: successResponse(transactionResponse),
      400: errorResponse,
      500: errorResponse,
    },
  },

  recordBonus: {
    summary: 'Record a bonus',
    description: 'Record a bonus for a club',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['clubId', 'amount', 'description'],
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        amount: { type: 'number', minimum: 0 },
        description: { type: 'string' },
        seasonHalfId: { type: 'string', format: 'uuid' },
      },
    },
    response: {
      201: successResponse(transactionResponse),
      400: errorResponse,
      500: errorResponse,
    },
  },

  // ==================== Salary Processing ====================
  processSalaries: {
    summary: 'Process salaries',
    description: 'Process salary payments for all clubs in a season half',
    tags: ['Finances'],
    body: {
      type: 'object',
      required: ['seasonHalfId'],
      properties: {
        seasonHalfId: { type: 'string', format: 'uuid' },
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
              clubsProcessed: { type: 'number' },
              totalSalariesPaid: { type: 'number' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    clubId: { type: 'string' },
                    clubName: { type: 'string' },
                    totalSalary: { type: 'number' },
                    playerCount: { type: 'number' },
                  },
                },
              },
            },
          },
          message: { type: 'string' },
        },
      },
      400: errorResponse,
      500: errorResponse,
    },
  },

  // ==================== Financial Report ====================
  getClubFinancialReport: {
    summary: 'Get club financial report',
    description: 'Get a comprehensive financial report for a club',
    tags: ['Finances'],
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
        seasonHalfId: { type: 'string', format: 'uuid' },
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
              clubId: { type: 'string' },
              seasonHalfId: { type: 'string' },
              balance: {
                type: 'object',
                properties: {
                  starting: { type: 'number' },
                  income: { type: 'number' },
                  expenses: { type: 'number' },
                  salaries: { type: 'number' },
                  ending: { type: 'number' },
                },
              },
              transactionSummary: { type: 'object' },
              transactionCount: { type: 'number' },
            },
          },
          message: { type: 'string' },
        },
      },
      500: errorResponse,
    },
  },
}
