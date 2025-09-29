export const competitionSchemas = {
  create: {
    description: 'Create new competition.',
    tags: ['Competition'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        seasonId: { type: 'string', format: 'uuid' },
        typeId: { type: 'string', format: 'uuid' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        rules: {
          type: 'object',
          oneOf: [
            // LEAGUES rules
            {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['LEAGUES'] },
                activeSeason: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                  },
                },
                competitionCategory: { type: 'string', enum: ['SENIOR', 'KEMPESITA'] },
                leagues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    oneOf: [
                      // TOP LEAGUE
                      {
                        type: 'object',
                        properties: {
                          active_league: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                            },
                          },
                          league_position: { type: 'string', enum: ['TOP'] },
                          firstIsChampion: { type: 'boolean' },
                          roundType: { type: 'string', enum: ['match', 'match_and_rematch'] },
                          topPlayoffs: {
                            type: 'object',
                            properties: {
                              type: { type: 'string', enum: ['TOP_3_FINALS', 'TOP_4_CROSS'] },
                              teams_index: { type: 'array', items: { type: 'integer' } },
                            },
                          },
                          playouts: {
                            type: 'object',
                            properties: {
                              type: { type: 'string', enum: ['5_VS_6', '4_VS_5'] },
                              teams_index: { type: 'array', items: { type: 'integer' } },
                            },
                          },
                          relegations: {
                            type: 'object',
                            properties: {
                              direct: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  teams_index: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['quantity', 'teams_index'],
                              },
                              playoffs: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  matches: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        a_team_rank_index: { type: 'integer' },
                                        b_team_rank_index: { type: 'integer' },
                                      },
                                      required: ['a_team_rank_index', 'b_team_rank_index'],
                                    },
                                  },
                                },
                                required: ['quantity', 'matches'],
                              },
                            },
                            required: ['direct'],
                          },
                        },
                        required: [
                          'active_league',
                          'league_position',
                          'firstIsChampion',
                          'roundType',
                          'relegations',
                        ],
                      },

                      // MIDDLE LEAGUE
                      {
                        type: 'object',
                        properties: {
                          active_league: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                            },
                          },
                          league_position: { type: 'string', enum: ['MIDDLE'] },
                          roundType: { type: 'string', enum: ['match', 'match_and_rematch'] },
                          playouts: {
                            type: 'object',
                            properties: {
                              type: { type: 'string', enum: ['5_VS_6', '4_VS_5'] },
                              teams_index: { type: 'array', items: { type: 'integer' } },
                            },
                          },
                          promotions: {
                            type: 'object',
                            properties: {
                              direct: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  teams_index: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['quantity', 'teams_index'],
                              },
                              playoffs: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  matches: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        a_team_rank_index: { type: 'integer' },
                                        b_team_rank_index: { type: 'integer' },
                                      },
                                      required: ['a_team_rank_index', 'b_team_rank_index'],
                                    },
                                  },
                                },
                                required: ['quantity', 'matches'],
                              },
                            },
                            required: ['direct'],
                          },
                          relegations: {
                            type: 'object',
                            properties: {
                              direct: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  teams_index: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['quantity', 'teams_index'],
                              },
                              playoffs: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  matches: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        a_team_rank_index: { type: 'integer' },
                                        b_team_rank_index: { type: 'integer' },
                                      },
                                      required: ['a_team_rank_index', 'b_team_rank_index'],
                                    },
                                  },
                                },
                                required: ['quantity', 'matches'],
                              },
                            },
                            required: ['direct'],
                          },
                        },
                        required: [
                          'active_league',
                          'league_position',
                          'roundType',
                          'promotions',
                          'relegations',
                        ],
                      },

                      // BOTTOM LEAGUE
                      {
                        type: 'object',
                        properties: {
                          active_league: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                            },
                          },
                          league_position: { type: 'string', enum: ['BOTTOM'] },
                          roundType: { type: 'string', enum: ['match', 'match_and_rematch'] },
                          promotions: {
                            type: 'object',
                            properties: {
                              direct: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  teams_index: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['quantity', 'teams_index'],
                              },
                              playoffs: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  matches: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        a_team_rank_index: { type: 'integer' },
                                        b_team_rank_index: { type: 'integer' },
                                      },
                                      required: ['a_team_rank_index', 'b_team_rank_index'],
                                    },
                                  },
                                },
                                required: ['quantity', 'matches'],
                              },
                            },
                            required: ['direct'],
                          },
                          playons: {
                            type: 'object',
                            properties: {
                              direct_to_final_team_index: { type: 'integer' },
                              direct_to_semifinal_team_index: { type: 'integer' },
                              quarterfinal_teams_index: { type: 'array', items: { type: 'integer' } },
                            },
                            required: [
                              'direct_to_final_team_index',
                              'direct_to_semifinal_team_index',
                              'quarterfinal_teams_index',
                            ],
                          },
                          relegations: {
                            type: 'object',
                            properties: {
                              direct: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  teams_index: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['quantity', 'teams_index'],
                              },
                              playoffs: {
                                type: 'object',
                                properties: {
                                  quantity: { type: 'integer' },
                                  matches: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        a_team_rank_index: { type: 'integer' },
                                        b_team_rank_index: { type: 'integer' },
                                      },
                                      required: ['a_team_rank_index', 'b_team_rank_index'],
                                    },
                                  },
                                },
                                required: ['quantity', 'matches'],
                              },
                            },
                            required: ['direct'],
                          },
                        },
                        required: [
                          'active_league',
                          'league_position',
                          'roundType',
                          'promotions',
                          'playons',
                          'relegations',
                        ],
                      },
                    ],
                  },
                },
              },
              required: ['type', 'activeSeason', 'competitionCategory', 'leagues'],
            },

            // CUP rules
            {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['CUP'] },
                activeSeason: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                  },
                },
                competitionCategory: { type: 'string', enum: ['SENIOR', 'KEMPESITA'] },
                competitionType: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                numGroups: { type: 'integer', minimum: 1 },
                teamsPerGroup: { type: 'integer', minimum: 2 },
                qualifyToGold: { type: 'integer', minimum: 1 },
                qualifyToSilver: { type: 'integer', minimum: 0 },
              },
              required: [
                'type',
                'activeSeason',
                'competitionCategory',
                'competitionType',
                'numGroups',
                'teamsPerGroup',
                'qualifyToGold',
              ],
            },
          ],
        },
      },
      required: ['name', 'seasonId', 'typeId', 'rules'],
    },
    response: {
      201: {
        description: 'Competition created successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          competition: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              seasonId: { type: 'string' },
              typeId: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      400: {
        description: 'Error while creating new competition.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findAll: {
    description: 'Fetch all competitions.',
    tags: ['Competition'],
    response: {
      200: {
        description: 'List of competitions',
        type: 'object',
        properties: {
          competitions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                seasonId: { type: 'string' },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                isActive: { type: 'boolean' },
                type: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    format: { type: 'string' },
                    category: { type: 'string' },
                  },
                },
                rules: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      400: {
        description: 'Error while fetching competitions.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  findOne: {
    description: 'Fetch a competition by ID.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Competition details',
        type: 'object',
        properties: {
          competition: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              seasonId: { type: 'string' },
              startDate: { type: 'string', format: 'date-time', nullable: true },
              endDate: { type: 'string', format: 'date-time', nullable: true },
              isActive: { type: 'boolean' },
              type: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  format: { type: 'string' },
                  category: { type: 'string' },
                },
              },
              rules: { type: 'object' },
              clubs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    logo: { type: 'string' },
                    group: { type: 'string', nullable: true },
                    division: { type: 'string', nullable: true },
                  },
                },
              },
              fixtures: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    homeTeamId: { type: 'string' },
                    awayTeamId: { type: 'string' },
                    homeTeamScore: { type: 'integer', nullable: true },
                    awayTeamScore: { type: 'integer', nullable: true },
                    round: { type: 'integer' },
                    date: { type: 'string', format: 'date-time', nullable: true },
                    status: { type: 'string' },
                  },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      404: {
        description: 'Competition not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while fetching competition.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  update: {
    description: 'Update a competition by ID.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition to update.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        seasonId: { type: 'string', format: 'uuid' },
        typeId: { type: 'string', format: 'uuid' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        rules: { type: 'object' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: 'Competition updated successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating competition.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  delete: {
    description: 'Delete a competition by ID.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition to delete.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    response: {
      200: {
        description: 'Competition deleted successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while deleting competition.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  addClub: {
    description: 'Add a club to a competition.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        clubId: { type: 'string', format: 'uuid' },
        group: { type: 'string' },
        division: { type: 'string' },
      },
      required: ['clubId'],
    },
    response: {
      200: {
        description: 'Club added to competition successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition or club not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while adding club to competition.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  generateFixtures: {
    description: 'Generate fixtures for a competition.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        stage: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        intervalDays: { type: 'integer', minimum: 1, default: 7 },
      },
    },
    response: {
      200: {
        description: 'Fixtures generated successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          fixturesCount: { type: 'integer' },
        },
      },
      404: {
        description: 'Competition not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while generating fixtures.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  getStandings: {
    description: 'Get standings for a competition.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition.',
          format: 'uuid',
        },
      },
      required: ['id'],
    },
    querystring: {
      type: 'object',
      properties: {
        group: { type: 'string' },
        division: { type: 'string' },
      },
    },
    response: {
      200: {
        description: 'Competition standings.',
        type: 'object',
        properties: {
          standings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                club: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    logo: { type: 'string' },
                  },
                },
                played: { type: 'integer' },
                won: { type: 'integer' },
                drawn: { type: 'integer' },
                lost: { type: 'integer' },
                goalsFor: { type: 'integer' },
                goalsAgainst: { type: 'integer' },
                goalDifference: { type: 'integer' },
                points: { type: 'integer' },
              },
            },
          },
        },
      },
      404: {
        description: 'Competition not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while fetching standings.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },

  updateFixture: {
    description: 'Update a fixture result.',
    tags: ['Competition'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the competition.',
          format: 'uuid',
        },
        fixtureId: {
          type: 'string',
          description: 'ID of the fixture.',
          format: 'uuid',
        },
      },
      required: ['id', 'fixtureId'],
    },
    body: {
      type: 'object',
      properties: {
        homeTeamScore: { type: 'integer', minimum: 0 },
        awayTeamScore: { type: 'integer', minimum: 0 },
        date: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['SCHEDULED', 'PLAYED', 'POSTPONED', 'CANCELLED'] },
      },
      required: ['homeTeamScore', 'awayTeamScore'],
    },
    response: {
      200: {
        description: 'Fixture updated successfully.',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      404: {
        description: 'Competition or fixture not found.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      400: {
        description: 'Error while updating fixture.',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
