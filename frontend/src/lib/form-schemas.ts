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
  static resetPasswordSchema = z
    .object({
      password: z.string().min(4, { message: 'Password is required.' }),
      revalidatPassword: z.string().min(4, { message: 'Password confirmation is required.' }),
    })
    .refine((data) => data.password === data.revalidatPassword, {
      message: 'Passwords must be the same.',
      path: ['revalidatPassword'],
    })

  static PlayerSchema = z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    lastName: z.string().min(1, { message: 'Last name is required.' }),
    birthdate: z.date(),
    ownerClubId: z.string().min(1, { message: 'Owner club is required.' }),
    actualClubId: z.string().optional(),
    overall: z.coerce.number().min(0).max(99),
    salary: z.coerce.number().min(0),
    sofifaId: z.string().optional(),
    transfermarktId: z.string().optional(),
    isKempesita: z.boolean(),
    isActive: z.boolean(),
  })
  static ClubSchema = z.object({
    name: z.string().min(2, { message: 'Club name must be at least 2 characters.' }),
    logo: z.string().optional(),
    userId: z.string().optional(),
    isActive: z.boolean(),
  })
}

export default FormSchemas
