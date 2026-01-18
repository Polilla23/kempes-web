import { FastifyInstance } from 'fastify'

export const standingsRoutes = async (fastify: FastifyInstance) => {
  const standingsController = (fastify as any).container.resolve('standingsController')

  // GET /standings/competitions/:competitionId
  fastify.get('/competitions/:competitionId', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get standings for a specific competition',
      tags: ['standings'],
      params: {
        type: 'object',
        properties: {
          competitionId: { type: 'string', format: 'uuid' },
        },
        required: ['competitionId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                competitionId: { type: 'string' },
                competitionName: { type: 'string' },
                seasonNumber: { type: 'number' },
                isComplete: { type: 'boolean' },
                matchesPlayed: { type: 'number' },
                matchesTotal: { type: 'number' },
                standings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      position: { type: 'number' },
                      clubId: { type: 'string' },
                      clubName: { type: 'string' },
                      clubLogo: { type: 'string', nullable: true },
                      played: { type: 'number' },
                      won: { type: 'number' },
                      drawn: { type: 'number' },
                      lost: { type: 'number' },
                      goalsFor: { type: 'number' },
                      goalsAgainst: { type: 'number' },
                      goalDifference: { type: 'number' },
                      points: { type: 'number' },
                      zone: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
            message: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: standingsController.getCompetitionStandings.bind(standingsController),
  })

  // GET /standings/seasons/:seasonId
  fastify.get('/seasons/:seasonId', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get all standings for a season (all leagues)',
      tags: ['standings'],
      params: {
        type: 'object',
        properties: {
          seasonId: { type: 'string', format: 'uuid' },
        },
        required: ['seasonId'],
      },
    },
    handler: standingsController.getSeasonStandings.bind(standingsController),
  })
}
