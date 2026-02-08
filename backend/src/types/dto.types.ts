// Data Transfer Objects - objetos limpios que van al frontend

export type UserPublicDTO = {
  id: string
  email: string
  name?: string
  role: string
  isVerified: boolean
  club: {
    id: string
    name: string
  } | null
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
  userId?: string
  user?: {
    id: string
    email: string
  }
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
    hierarchy: number
  }
  _count?: {
    matches: number
    clubs: number
  }
}

export type MatchDTO = {
  id: string
  competitionId: string
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
  knockoutRound: string | null
  homePlaceholder?: string | null
  awayPlaceholder?: string | null
  homeSource?: {
    type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'
    placeholder?: string
  }
  awaySource?: {
    type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'
    placeholder?: string
  }
}

// MatchDTO con información de competencia para filtrado en frontend
export type MatchDetailedDTO = MatchDTO & {
  competition: {
    id: string
    name: string
    competitionType: {
      id: string
      name: string
      category: string // 'SENIOR' | 'KEMPESITA' | 'MIXED'
      format: string // 'LEAGUE' | 'CUP'
      hierarchy: number
    }
  }
  events?: Array<{
    type: string
    player: string
    team: 'home' | 'away'
  }>
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
  actualClubId: string | null
  ownerClubId: string | null
  actualClub: {
    id: string
    name: string
  } | null
  ownerClub: {
    id: string
    name: string
  } | null
  overall: number
  salary: number | null
  sofifaId: string | null
  transfermarktId: string | null
  isKempesita: boolean
  isActive: boolean
}

export type PlayerStatsDTO = PlayerDTO & {
  stats: {
    totalMatches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    mvps: number
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

export type SeasonDTO = {
  id: string
  number: number
  isActive: boolean
}

export type EventTypeDTO = {
  id: string
  name: string
  displayName: string
  icon: string | null
  isActive: boolean
}

export type CompetitionTypeDTO = {
  id: string
  name: string
  category: string
  format: string
  hierarchy: number
}

export type SalaryRateDTO = {
  id: string
  minOverall: number
  maxOverall: number
  salary: number
  isActive: boolean
}

// ============================================
// TRANSFER AND FINANCE DTOs
// ============================================

export type SeasonHalfDTO = {
  id: string
  seasonId: string
  seasonNumber: number
  halfType: string
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export type TransferWindowDTO = {
  id: string
  seasonHalfId: string
  seasonHalf: SeasonHalfDTO
  name: string
  startDate: string
  endDate: string
  status: string
}

export type TransferDTO = {
  id: string
  type: string
  status: string
  playerId: string
  fromClubId: string
  toClubId: string
  initiatorClubId: string | null
  transferWindowId: string | null
  seasonHalfId: string
  totalAmount: number
  numberOfInstallments: number
  loanDurationHalves: number | null
  returnSeasonHalfId: string | null
  loanFee: number | null
  loanSalaryPercentage: number | null
  notes: string | null
  createdAt: Date
  completedAt: Date | null
  player?: {
    id: string
    name: string
    lastName: string
    overall: number | null
    position?: string
    isKempesita?: boolean
  }
  fromClub?: {
    id: string
    name: string
    shortName?: string
    logo: string | null
  }
  toClub?: {
    id: string
    name: string
    shortName?: string
    logo: string | null
  }
  initiatorClub?: {
    id: string
    name: string
    shortName?: string
    logo: string | null
  }
  seasonHalf?: {
    id: string
    halfType: string
    seasonId: string
  }
  transferWindow?: {
    id: string
    name: string
    status: string
  }
  installments?: TransferInstallmentDTO[]
  playersAsPayment?: TransferPlayerPaymentDTO[]
}

export type TransferPlayerPaymentDTO = {
  id: string
  transferId: string
  playerId: string
  valuationAmount: number
  player?: {
    id: string
    firstName?: string
    lastName: string
    overall: number | null
    position?: string
  }
}

export type TransferInstallmentDTO = {
  id: string
  transferId: string
  installmentNumber: number
  amount: number
  dueSeasonHalfId: string
  status: string
  paidAt: Date | null
  dueSeasonHalf?: {
    id: string
    halfType: string
    seasonId: string
  }
}

export type FinancialTransactionDTO = {
  id: string
  clubId: string
  type: string
  amount: number
  description: string
  transferId: string | null
  installmentId: string | null
  seasonHalfId: string
  createdAt: Date
  club?: {
    id: string
    name: string
    shortName?: string
    logo: string | null
  }
  seasonHalf?: {
    id: string
    halfType: string
    seasonId: string
    seasonNumber?: number
  }
}

export type ClubSeasonBalanceDTO = {
  id: string
  clubId: string
  seasonHalfId: string
  startingBalance: number
  totalIncome: number
  totalExpenses: number
  endingBalance: number
  totalSalaries: number
  club?: {
    id: string
    name: string
    shortName?: string
    logo: string | null
  }
  seasonHalf?: {
    id: string
    halfType: string
    seasonId: string
    seasonNumber?: number
  }
}

export type CompetitionPrizeDTO = {
  id: string
  competitionTypeId: string
  position: number
  prizeAmount: number
  description: string | null
  competitionType?: {
    id: string
    name: string
  }
}

export type FinancialReportDTO = {
  club: {
    id: string
    name: string
  }
  currentBalance: number
  seasonSummary: {
    totalIncome: number
    totalExpenses: number
    netChange: number
  }
  transferActivity: {
    playersBought: number
    playersSold: number
    playersLoanedIn: number
    playersLoanedOut: number
    totalSpentOnTransfers: number
    totalReceivedFromSales: number
  }
  salaryBill: number
  pendingInstallmentsAmount: number
  pendingInstallmentsCount: number
}