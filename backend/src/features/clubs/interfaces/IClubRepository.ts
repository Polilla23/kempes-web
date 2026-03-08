import { Prisma, Club } from '@prisma/client'

export interface ClubTitle {
  seasonNumber: number
  competitionName: string
  type: 'LEAGUE' | 'CUP'
}

export interface ClubHistoryEntry {
  seasonNumber: number
  competitionName: string
  competitionFormat: string
  finalPosition: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  movement: string | null
}

export interface ClubFinanceEntry {
  seasonNumber: number
  halfType: string
  startingBalance: number
  endingBalance: number
  totalIncome: number
  totalExpenses: number
  totalSalaries: number
}

export interface IClubRepository {
  findAll(): Promise<Club[] | null>
  findOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club | null>
  findOneByName(name: Prisma.ClubWhereUniqueInput['name']): Promise<Club | null>
  findOneByUserId(id: Prisma.ClubWhereUniqueInput['userId']): Promise<Club | null>
  save(data: Prisma.ClubCreateInput): Promise<Club>
  saveMany(data: Prisma.ClubCreateManyInput[]): Promise<Prisma.BatchPayload>
  updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput): Promise<Club>
  deleteOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club> // TODO: change to promise<void>
  getActivePlayers(clubId: string): Promise<{ id: string; fullName: string; overall: number | null }[]>
  findAvailableClubs(): Promise<{ id: string; name: string; logo: string | null }[]>
  findTitles(clubId: string): Promise<{ total: number; titles: ClubTitle[] }>
  findSquad(clubId: string): Promise<{ squadValue: number; players: any[]; bestXI: any[] }>
  findHistory(clubId: string): Promise<ClubHistoryEntry[]>
  findFinances(clubId: string): Promise<ClubFinanceEntry[]>
}
