export const kempesitaConfigSchemas = {
  getActive: {
    description: 'Get active kempesita configuration.',
    tags: ['KempesitaConfig'],
    response: {
      200: {
        description: 'Active kempesita config',
        type: 'object',
        properties: {
          data: { type: 'object', nullable: true, additionalProperties: true },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
  upsert: {
    description: 'Create or update kempesita configuration.',
    tags: ['KempesitaConfig'],
    body: {
      type: 'object',
      properties: {
        maxBirthYear: { type: 'number' },
      },
      required: ['maxBirthYear'],
    },
    response: {
      200: {
        description: 'Kempesita config saved successfully.',
        type: 'object',
        properties: {
          data: { type: 'object', additionalProperties: true },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      400: {
        description: 'Validation error.',
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
}
