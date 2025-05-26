import Fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({
  logger: false,
})

export default app
