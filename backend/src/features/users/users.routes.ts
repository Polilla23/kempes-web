import { FastifyInstance } from 'fastify'
import { usersSchemas } from '@/features/users/users.schemas'

export const userRoutes = async (fastify: FastifyInstance) => {
  const userController = fastify.container.resolve('userController')

  // Auth endpoints
  fastify.post('/register', {
    // preHandler: [fastify.authenticate, authorize(['ADMIN'])],
    schema: usersSchemas.register,
    handler: userController.register.bind(userController),
  })

  fastify.post('/login', {
    schema: usersSchemas.login,
    handler: userController.logIn.bind(userController),
  })

  fastify.get('/logout', {
    preHandler: [fastify.authenticate],
    schema: usersSchemas.logout,
    handler: userController.logOut.bind(userController),
  })

  // User management endpoints
  fastify.get('/', {
    schema: usersSchemas.findAll,
    handler: userController.findAll.bind(userController),
  })

  fastify.patch('/:id', {
    schema: usersSchemas.update,
    handler: userController.update.bind(userController),
  })

  fastify.delete('/:id', {
    schema: usersSchemas.delete,
    handler: userController.delete.bind(userController),
  })

  // Email verification endpoints
  fastify.get('/verify-email/:token', {
    schema: usersSchemas.verifyEmail,
    handler: userController.verifyEmail.bind(userController),
  })

  fastify.post('/resend-verification-email', {
    schema: usersSchemas.resendVerificationEmail,
    handler: userController.resendVerifyEmail.bind(userController),
  })

  // Password reset endpoints
  fastify.post('/request-reset-password', {
    schema: usersSchemas.requestPasswordReset,
    handler: userController.requestPasswordReset.bind(userController),
  })

  fastify.get('/verify-reset-password-token/:token', {
    schema: usersSchemas.verifyResetPasswordToken,
    handler: userController.findOneByResetPasswordToken.bind(userController),
  })

  fastify.post('/reset-password/:token', {
    schema: usersSchemas.resetPassword,
    handler: userController.resetPassword.bind(userController),
  })
}
