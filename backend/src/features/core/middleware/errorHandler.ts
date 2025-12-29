import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { Response } from '@/features/utils/response.helpers'
import { HttpError, ValidationError } from '../errors/http-errors'
import { Prisma } from '@prisma/client'

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log del error (en producción esto iría a un servicio de logging)
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    },
  })

  if (error instanceof HttpError) {
    if (error instanceof ValidationError) {
      return Response.validation(reply, error.details, error.message)
    }

    if (error.statusCode === 404) {
      return Response.notFound(reply, error.message)
    }

    if (error.statusCode === 401) {
      return Response.unauthorized(reply, error.message)
    }

    // Para otros códigos HTTP, usar Response.error genérico
    return Response.error(reply, error.errorCode, error.message, error.statusCode)
  }

  // 2. Errores de validación de Fastify (schema validation)
  const fastifyError = error as FastifyError
  if (fastifyError.validation) {
    return Response.validation(reply, fastifyError.validation, 'Request validation failed')
  }

  // 3. Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, reply)
  }

  // 4. Errores de Prisma (validación)
  if (error instanceof Prisma.PrismaClientValidationError) {
    return Response.validation(reply, { prismaError: error.message }, 'Database validation error')
  }

  // 5. Error genérico (500)
  const statusCode = fastifyError.statusCode || 500

  if (statusCode >= 500) {
    return Response.internal(
      reply,
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    )
  }

  // Otros errores 4xx
  return Response.error(reply, 'REQUEST_ERROR', error.message, statusCode)
}

/**
 * Maneja errores específicos de Prisma usando el sistema Response
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, reply: FastifyReply) {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const field = (error.meta?.target as string[]) || ['field']
      return Response.error(
        reply,
        'DUPLICATE_RESOURCE',
        `A record with this ${field.join(', ')} already exists`,
        409,
        { field: field[0] }
      )
    }

    // Foreign key constraint violation
    case 'P2003': {
      const field = error.meta?.field_name as string
      return Response.error(reply, 'INVALID_REFERENCE', `Invalid reference: ${field} does not exist`, 400, {
        field,
      })
    }

    // Record not found
    case 'P2025': {
      return Response.notFound(reply, 'Resource not found')
    }

    // Record to delete does not exist
    case 'P2018': {
      return Response.notFound(reply, 'Resource to delete not found')
    }

    // Default para otros errores Prisma
    default: {
      return Response.internal(
        reply,
        'Database operation failed',
        process.env.NODE_ENV === 'development' ? { code: error.code, meta: error.meta } : undefined
      )
    }
  }
}
