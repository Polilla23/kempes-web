export const fixtureSchemas = {
  createKnockout: {
    description: 'Create knockout bracket with match dependencies.',
    tags: ['Fixture'],
    body: {
      type: 'object',
      properties: {
        competitionId: { 
          type: 'string',
          format: 'uuid',
        },
        brackets: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              round: {
                type: 'string',
                enum: ['ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL']
              },
              position: {
                type: 'integer',
                minimum: 1
              },
              homeTeam: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['DIRECT', 'FROM_MATCH', 'FROM_GROUP']
                  },
                  clubId: { type: 'string', format: 'uuid', nullable: true },
                  sourceRound: {
                    type: 'string',
                    enum: ['ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'],
                    nullable: true
                  },
                  sourcePosition: { type: 'integer', minimum: 1, nullable: true },
                  sourceClubPosition: {
                    type: 'string',
                    enum: ['WINNER', 'LOSER'],
                    nullable: true
                  },
                  groupReference: { type: 'string', nullable: true }
                },
                required: ['type']
              },
              awayTeam: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['DIRECT', 'FROM_MATCH', 'FROM_GROUP']
                  },
                  clubId: { type: 'string', format: 'uuid', nullable: true },
                  sourceRound: {
                    type: 'string',
                    enum: ['ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'],
                    nullable: true
                  },
                  sourcePosition: { type: 'integer', minimum: 1, nullable: true },
                  sourceClubPosition: {
                    type: 'string',
                    enum: ['WINNER', 'LOSER'],
                    nullable: true
                  },
                  groupReference: { type: 'string', nullable: true }
                },
                required: ['type']
              }
            },
            required: ['round', 'position', 'homeTeam', 'awayTeam']
          }
        }
      },
      required: ['competitionId', 'brackets']
    },
    response: {
      201: {
        description: 'Knockout bracket created successfully.',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          matchesCreated: { type: 'integer' },
          competitionId: { type: 'string' }
        }
      },
      400: {
        description: 'Error while creating knockout bracket.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  createGroupStage: {
    description: 'Create group stage fixtures (round-robin within groups).',
    tags: ['Fixture'],
    body: {
      type: 'object',
      properties: {
        competitionId: {
          type: 'string',
          format: 'uuid',
          description: 'Competition ID'
        },
        groups: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              groupName: {
                type: 'string',
                minLength: 1
              },
              clubIds: {
                type: 'array',
                minItems: 4,
                items: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            },
            required: ['groupName', 'clubIds']
          }
        }
      },
      required: ['competitionId', 'groups']
    },
    response: {
      201: {
        description: 'Group stage fixtures created successfully.',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          matchesCreated: { type: 'integer' },
          competitionId: { type: 'string' }
        }
      },
      400: {
        description: 'Error while creating group stage fixtures.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  createLeague: {
    description: 'Create league fixtures (double round-robin).',
    tags: ['Fixture'],
    body: {
      type: 'object',
      properties: {
        competitionId: {
          type: 'string',
          format: 'uuid',
          description: 'Competition ID'
        },
        clubIds: {
          type: 'array',
          minItems: 8,
          items: {
            type: 'string',
            format: 'uuid'
          }
        }
      },
      required: ['competitionId', 'clubIds']
    },
    response: {
      201: {
        description: 'League fixtures created successfully.',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          matchesCreated: { type: 'integer' },
          competitionId: { type: 'string' }
        }
      },
      400: {
        description: 'Error while creating league fixtures.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  finishMatch: {
    description: 'Finish a match and auto-update dependent matches.',
    tags: ['Fixture'],
    params: {
      type: 'object',
      properties: {
        matchId: {
          type: 'string',
          format: 'uuid',
          description: 'Match ID'
        }
      },
      required: ['matchId']
    },
    body: {
      type: 'object',
      properties: {
        homeClubGoals: {
          type: 'integer',
          minimum: 0
        },
        awayClubGoals: {
          type: 'integer',
          minimum: 0
        }
      },
      required: ['homeClubGoals', 'awayClubGoals']
    },
    response: {
      200: {
        description: 'Match finished successfully.',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          match: { type: 'object' },
          dependentMatchesUpdated: { type: 'integer' },
          updatedMatches: { type: 'array' }
        }
      },
      400: {
        description: 'Error while finishing match.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  getCompetitionMatches: {
    description: 'Get all matches for a competition.',
    tags: ['Fixture'],
    params: {
      type: 'object',
      properties: {
        competitionId: {
          type: 'string',
          format: 'uuid',
          description: 'Competition ID'
        }
      },
      required: ['competitionId']
    },
    response: {
      200: {
        description: 'List of matches for the competition.',
        type: 'array',
        items: { type: 'object' }
      },
      404: {
        description: 'Competition not found.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  getKnockoutBracket: {
    description: 'Get knockout bracket structure with dependencies.',
    tags: ['Fixture'],
    params: {
      type: 'object',
      properties: {
        competitionId: {
          type: 'string',
          format: 'uuid',
          description: 'Competition ID'
        }
      },
      required: ['competitionId']
    },
    response: {
      200: {
        description: 'Knockout bracket structure.',
        type: 'array',
        items: { type: 'object' }
      },
      404: {
        description: 'Knockout bracket not found.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },

  getMatchById: {
    description: 'Get single match details.',
    tags: ['Fixture'],
    params: {
      type: 'object',
      properties: {
        matchId: {
          type: 'string',
          format: 'uuid',
          description: 'Match ID'
        }
      },
      required: ['matchId']
    },
    response: {
      200: {
        description: 'Match details.',
        type: 'object'
      },
      404: {
        description: 'Match not found.',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}