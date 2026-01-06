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

  static EventTypeSchema = z.object({
    name: z.enum(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'INJURY', 'MVP'], {
      errorMap: () => ({ message: 'Please select a valid event type' }),
    }),
    displayName: z.string().min(1, 'Display name is required'),
    icon: z.string().min(1, 'Icon is required'),
    isActive: z.boolean(),
  })

  static CompetitionTypeSchema = z.object({
    name: z.enum(
      [
        'LEAGUE_A',
        'LEAGUE_B',
        'LEAGUE_C',
        'LEAGUE_D',
        'LEAGUE_E',
        'KEMPES_CUP',
        'GOLD_CUP',
        'SILVER_CUP',
        'CINDOR_CUP',
        'SUPER_CUP',
      ],
      { required_error: 'Please select a competition name.' }
    ),
    category: z.enum(['SENIOR', 'KEMPESITA'], {
      required_error: 'Please select a category.',
    }),
    format: z.enum(['LEAGUE', 'CUP'], {
      required_error: 'Please select a format.',
    }),
    hierarchy: z.coerce.number().min(1, 'Hierarchy must be at least 1'),
  })

  static SeasonSchema = z.object({
    number: z.coerce.number().min(1, 'Season number must be at least 1'),
    isActive: z.boolean(),
  })
}

export default FormSchemas
