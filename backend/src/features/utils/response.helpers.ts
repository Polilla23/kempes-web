// Helpers para responses estandarizadas

import { FastifyReply } from 'fastify'
import { SuccessResponseDTO, ErrorResponseDTO, PaginatedResponse } from '@/types'

export function sendSuccess<T>(reply: FastifyReply, data: T, message?: string, statusCode: number = 200) {
  const response: SuccessResponseDTO<T> = {
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
  }

  return reply.status(statusCode).send(response)
}

export function sendCreated<T>(
  reply: FastifyReply,
  data: T,
  message: string = 'Resource created successfully'
) {
  return sendSuccess(reply, data, message, 201)
}

export function sendError(
  reply: FastifyReply,
  error: string,
  message: string,
  statusCode: number = 400,
  details?: any,
  path?: string
) {
  const response: ErrorResponseDTO = {
    error,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(path && { path }),
  }

  return reply.status(statusCode).send(response)
}

export function sendNotFound(reply: FastifyReply, resource: string = 'Resource', id?: string) {
  const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
  return sendError(reply, 'NOT_FOUND', message, 404)
}

export function sendValidationError(
  reply: FastifyReply,
  details: any,
  message: string = 'Validation failed'
) {
  return sendError(reply, 'VALIDATION_ERROR', message, 400, details)
}

export function sendUnauthorized(reply: FastifyReply, message: string = 'Unauthorized access') {
  return sendError(reply, 'UNAUTHORIZED', message, 401)
}

export function sendInternalError(
  reply: FastifyReply,
  message: string = 'Internal server error',
  details?: any
) {
  return sendError(reply, 'INTERNAL_ERROR', message, 500, details)
}

export function sendNoContent(reply: FastifyReply) {
  return reply.status(204).send()
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string
) {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      currentPage: pagination.page,
      itemsPerPage: pagination.limit,
      totalItems: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPreviousPage: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
    ...(message && { message }),
  }

  return reply.status(200).send(response)
}

export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  return {
    skip,
    take: limit,
    totalPages,
    hasMore: page < totalPages,
  }
}

export function validatePaginationParams(page?: number, limit?: number) {
  const validatedPage = Math.max(1, page || 1)
  const validatedLimit = Math.min(100, Math.max(1, limit || 10))

  return {
    page: validatedPage,
    limit: validatedLimit,
  }
}

// Objeto encapsulado para imports más limpios
export const Response = {
  success: sendSuccess,
  created: sendCreated,
  error: sendError,
  notFound: sendNotFound,
  validation: sendValidationError,
  unauthorized: sendUnauthorized,
  internal: sendInternalError,
  noContent: sendNoContent,
  paginated: sendPaginated,
}

export const Pagination = {
  calculate: calculatePagination,
  validate: validatePaginationParams,
}
