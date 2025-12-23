import { z } from 'zod'

/**
 * Schema de validación para variables de entorno
 *
 * ¿Por qué usamos Zod aquí?
 * 1. Validación temprana: Si falta algo crítico, la app falla al inicio
 * 2. Typing automático: TypeScript conoce los tipos exactos
 * 3. Documentación viva: Este esquema documenta qué variables necesitamos
 * 4. Transformaciones: Convierte strings a numbers, URLs, etc.
 */
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server
  PORT: z.coerce.number().int().min(1000).max(65535).default(3000),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres para ser seguro'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cookies
  FASTIFY_COOKIE_SECRET: z.string().min(16, 'FASTIFY_COOKIE_SECRET debe tener al menos 16 caracteres'),

  // URLs del Frontend y Backend
  FRONT_URL: z.string().url('FRONT_URL debe ser una URL válida').optional(),
  BACK_URL: z.string().url('BACK_URL debe ser una URL válida').optional(),

  // Email (si usas email, descomenta y configura)
  // SMTP_HOST: z.string().min(1),
  // SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  // SMTP_USER: z.string().email(),
  // SMTP_PASS: z.string().min(1),

  // Uploads (si manejas archivos)
  MAX_FILE_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024), // 5MB por defecto
})

/**
 * Tipo derivado del schema - tendrás autocompletado en todo el código
 */
export type Env = z.infer<typeof envSchema>

/**
 * Parsea y valida las variables de entorno
 *
 * Si algo falla aquí, la aplicación no arranca (que es lo que queremos)
 */
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Variables de entorno inválidas:')
    console.error(result.error.format())

    // Lista los errores de manera legible
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })

    process.exit(1)
  }

  return result.data
}

/**
 * Variables de entorno validadas y tipadas
 * Úsalo así: env.JWT_SECRET, env.PORT, etc.
 */
export const env = parseEnv()

/**
 * Helper para verificar si estamos en development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Helper para verificar si estamos en production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper para verificar si estamos en test
 */
export const isTest = env.NODE_ENV === 'test'
