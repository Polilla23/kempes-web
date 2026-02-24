import { Prisma, Player } from '@prisma/client'

export interface PlayerCareerByClub {
  club: { id: string; name: string; logo: string | null }
  fromSeason: number
  toSeason: number
  totalAppearances: number
  totalGoals: number
  totalAssists: number
  totalYellowCards: number
  totalRedCards: number
  totalMvps: number
}

export interface PlayerCareerTotals {
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  mvps: number
}

export interface PlayerSeasonStatsEntry {
  seasonNumber: number
  competitionName: string
  competitionFormat: string
  club: { id: string; name: string; logo: string | null }
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  mvps: number
}

export interface PlayerTitle {
  seasonNumber: number
  competitionName: string
  type: 'LEAGUE' | 'CUP'
  club: { id: string; name: string; logo: string | null }
}

export interface IPlayerRespository {
  findAll(): Promise<Player[] | null>
  findOneById(id: Prisma.PlayerWhereUniqueInput['id']): Promise<Player | null>
  updateOneById(id: Prisma.PlayerWhereUniqueInput['id'], data: Prisma.PlayerUpdateInput): Promise<Player>
  deleteOneById(id: Prisma.PlayerWhereUniqueInput['id']): Promise<Player>
  save(data: Prisma.PlayerCreateInput): Promise<Player>
  saveMany(data: Prisma.PlayerCreateInput[]): Promise<Prisma.BatchPayload>
  findCareer(playerId: string): Promise<{ careerByClub: PlayerCareerByClub[]; careerTotals: PlayerCareerTotals }>
  findSeasonStats(playerId: string): Promise<PlayerSeasonStatsEntry[]>
  findTitles(playerId: string): Promise<PlayerTitle[]>
  findTransferHistory(playerId: string): Promise<any[]>
}
