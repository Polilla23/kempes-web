export const eventTypesSchemas = {
    create: {
        description: 'Create a new event type',
        tags: ['Event Types'],
        body: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                displayName: { type: 'string' },
                icon: { type: 'string' },
                isActive: { type: 'boolean' },
            },
            required: ['name', 'displayName'],
        },
        response: {
            201: {
                description: 'Event type created successfully',
                type: 'object',
                properties: {
                    data: { type: 'object' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
            400: {
                description: 'Validation error',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
        },
    },

    findAll: {
        description: 'Fetch all event types',
        tags: ['Event Types'],
        response: {
            200: {
                description: 'List of event types',
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: { 
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                displayName: { type: 'string' },
                                icon: { type: 'string' },
                                isActive: { type: 'boolean' },
                            },
                        },
                    },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
        },
    },

    findOne: {
        description: 'Fetch a single event type by ID',
        tags: ['Event Types'],
        params: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
            },
            required: ['id'],
        },
        response: {
            200: {
                description: 'Event type details',
                type: 'object',
                properties: {
                    data: { type: 'object' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
            404: {
                description: 'Event type not found',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
        },
    },

    update: {
        description: 'Update an event type by ID.',
        tags: ['Event Types'],
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
                name: { type: 'string' },
                displayName: { type: 'string' },
                icon: { type: 'string' },
                isActive: { type: 'boolean' },
            },
        },
        response: {
            200: {
                description: 'Event type updated successfully',
                type: 'object',
                properties: {
                    data: { type: 'object' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
            404: {
                description: 'Event type not found',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
        },
    },

    delete: {
        description: 'Delete an event type by ID.',
        tags: ['Event Types'],
        params: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
            },
            required: ['id'],
        },
        response: {
            204: {
                description: 'Event type deleted successfully',
                type: 'null',
            },
            404: {
                description: 'Event type not found',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                },
            },
        },
    },
}