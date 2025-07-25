import { FastifyInstance } from 'fastify'
import { userSchemas } from '../schemas/user.schema'
import { authorize } from '../middleware/authorize'

export const userRoutes = async (fastify: FastifyInstance) => {
  const userController = fastify.container.resolve('userController')
  fastify.post('/register', {
    // preHandler: [fastify.authenticate, authorize(['ADMIN'])],
    schema: userSchemas.register,
    handler: userController.register.bind(userController),
  })

  fastify.post('/login', {
    schema: userSchemas.login,
    handler: userController.logIn.bind(userController),
  })

  fastify.get('/logout', {
    preHandler: [fastify.authenticate],
    schema: userSchemas.logout,
    handler: userController.logOut.bind(userController),
  })

  fastify.get('/findAll', {
    schema: userSchemas.findAll,
    handler: userController.findAll.bind(userController),
  })

  fastify.get('/verify-email/:token', {
    schema: userSchemas.verifyEmail,
    handler: userController.verifyEmail.bind(userController),
  })

  fastify.post('/resend-verification-email', {
    schema: userSchemas.resendVerificationEmail,
    handler: userController.resendVerifyEmail.bind(userController),
  })

  fastify.post('/request-reset-password', {
    schema: userSchemas.requestPasswordReset,
    handler: userController.requestPasswordReset.bind(userController),
  })

  fastify.get('/verify-reset-password-token/:token', {
    schema: userSchemas.verifyResetPasswordToken,
    handler: userController.findOneByResetPasswordToken.bind(userController),
  })

  fastify.post('/reset-password/:token', {
    schema: userSchemas.resetPassword,
    handler: userController.resetPassword.bind(userController),
  })

  fastify.patch('/update/:id', {
    schema: userSchemas.update,
    handler: userController.update.bind(userController),
  })

  fastify.delete('/delete/:id', {
    schema: userSchemas.delete,
    handler: userController.delete.bind(userController),
  })
}
