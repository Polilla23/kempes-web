export interface IUserRepository {
  findOneByEmail(email: string): Promise<any | null>
  save(data: Partial<any>): Promise<any>
}
