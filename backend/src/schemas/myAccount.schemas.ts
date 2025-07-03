export const myAccountSchemas = {
    getUserData: {
        description: 'get user data',
        tags: ['User data'],
        response: {
            200: {
                description: 'Successful login',
                type: 'object',
                properties: {
                    name:{ type: 'string'},
                    email: { type: 'string' },
                    role: { type: 'string' },
                    isEmailVerified: { type: 'boolean'},
                    emailVerificationExpires: { type: 'string', format: 'date-time' },
                }
            },
            400: {
                description: 'Bad request',
                properties: {
                    message: { type: 'string' },
                    error: { type: 'string' }
                }
            }
        },
        skipSanitization: true
    },
}