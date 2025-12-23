// Data Transfer Objects - objetos limpios que van al frontend

export type UserPublicDTO = {
  id: string
  email: string
  name?: string
  role: string
}

export type UserProfileDTO = {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
}

export type AuthResponseDTO = {
  user: UserPublicDTO
  token?: string
  message: string
}

export type ClubDTO = {
  id: string
  name: string
  logo: string | null
  isActive: boolean
}

export type CompetitionDTO = {
  id: string
  name: string
  seasonId: string
  competitionTypeId: string
  isActive: boolean
  competitionType: {
    id: string
    name: string
    category: string
    format: string
  }
  _count?: {
    matches: number
    clubs: number
  }
}

export type MatchDTO = {
  id: string
  homeClub: {
    id: string
    name: string
    logo: string | null
  }
  awayClub: {
    id: string
    name: string
    logo: string | null
  }
  homeClubGoals: number
  awayClubGoals: number
  status: string
  matchdayOrder: number
  stage: string | null
  homeSource?: {
    type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'
    placeholder?: string
  }
  awaySource?: {
    type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'
    placeholder?: string
  }
}

export type MatchListDTO = {
  id: string
  homeClubName: string
  awayClubName: string
  homeClubLogo: string | null
  awayClubLogo: string | null
  homeClubGoals: number
  awayClubGoals: number
  status: string
  matchdayOrder: number
}

export type PlayerDTO = {
  id: string
  name: string
  lastName: string
  birthdate: string
  actualClubId: string
  overall: number
}

export type PlayerStatsDTO = PlayerDTO & {
  stats: {
    totalMatches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
}

export type EventDTO = {
  id: string
  type: string
  player: {
    id: string
    name: string
    jerseyNumber: number | null
  }
  club: {
    id: string
    name: string
  }
  description: string | null
  minute: number
}
