import { Prisma, User } from '@prisma/client'

export interface IUserRepository {
  findOneByEmail(email: Prisma.UserWhereUniqueInput['email']): Promise<User | null> // Prisma.UserWhereUniqueInput extracts the type of the user field from the model of schema.prisma
  findAll(): Promise<User[] | null>
  findOneById(id: Prisma.UserWhereUniqueInput['id']): Promise<User | null>
  updateOneById(id: Prisma.UserWhereUniqueInput['id'], data: Prisma.UserUpdateInput): Promise<User>
  deleteOneById(id: Prisma.UserWhereUniqueInput['id']): Promise<User>
  save(data: Prisma.UserCreateInput): Promise<User>
}
