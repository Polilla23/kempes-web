import z from 'zod'
class FormSchemas {
  static loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(4, { message: 'Password must be at least 4 characters.' }),
  })
  static createUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    role: z.enum(['USER', 'ADMIN'], { required_error: 'Please select a role.' }),
  })
  static editUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    role: z.enum(['USER', 'ADMIN'], { required_error: 'Please select a role.' }),
  })
  static forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
  })
}

export default FormSchemas
