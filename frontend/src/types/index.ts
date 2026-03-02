// Tipos de usuario
export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
  isVerified: boolean
  club?: Club | null
}

// Tipos de club
export interface Club {
  id: string
  name: string
  logo?: string
  userId?: string
  isActive: boolean
  user?: {
    id: string
    email: string
  }
}

// Tipos de jugador
export interface Player {
  id: string
  name: string
  birthdate: string
  actualClubId: string | null
  ownerClubId: string | null
  actualClub: Club | null
  ownerClub: Club | null
  overall: number | null
  salary: number
  sofifaId: string | null
  transfermarktId: string | null
  isKempesita: boolean
  isActive: boolean
}

// Tipos de configuración
export enum EventTypeName {
  GOAL = 'GOAL',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  INJURY = 'INJURY',
  MVP = 'MVP',
}

export interface EventType {
  id: string
  name: EventTypeName
  displayName: string
  icon: string | null
  isActive: boolean
}

export interface CompetitionType {
  id: string
  name: string
  category: string
  format: string
  hierarchy: number
}

export interface Season {
  id: string
  number: number
  isActive: boolean
}

export type DeadlineType = 'TRANSFER_MARKET' | 'COVID_REDRAW' | 'MATCH_SCHEDULE' | 'INSTALLMENT_DUE' | 'SEASON_CLOSE' | 'CUSTOM'

export interface SeasonDeadline {
  id: string
  seasonId: string
  type: DeadlineType
  title: string
  description?: string | null
  date: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

// Season Advancement Wizard Types
export interface CompetitionVerification {
  id: string
  name: string
  format: string
  category: string
  totalMatches: number
  completedMatches: number
  pendingMatches: number
  regularComplete: boolean
  postSeasonComplete: boolean
  hasPostSeason: boolean
}

export interface VerifyCompetitionsResponse {
  season: { id: string; number: number }
  allCompleted: boolean
  competitions: CompetitionVerification[]
}

export interface TeamMovement {
  clubId: string
  clubName: string
  fromCompetitionId: string
  fromLeague: string
  toCompetitionId: string | null
  toLeague: string | null
  movementType: string
  reason: string
  finalPosition: number
}

export interface PreviewMovementsResponse {
  season: { id: string; number: number }
  movements: TeamMovement[]
  summary: {
    champions: number
    promotions: number
    relegations: number
    stayed: number
  }
}

export interface SaveHistoryResponse {
  season: { id: string; number: number }
  movementsSaved: number
  clubHistorySaved: number
  playerStatsSaved: number
  coefKempesSaved: number
  alreadyExisted: boolean
}

export interface CreateNextSeasonResponse {
  previousSeason: { id: string; number: number }
  newSeason: { id: string; number: number }
}

export interface SalaryRate {
  id: string
  minOverall: number
  maxOverall: number
  salary: number
  isActive: boolean
}

// Tipos para formularios
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterUserFormData {
  email: string
  password: string
  username: string
  clubId: string
}

export interface ResetPasswordFormData {
  email: string
}

export interface NewPasswordFormData {
  password: string
}

export interface RegisterClubFormData {
  name: string
  logo?: string
  userId?: string | null
  isActive?: boolean
}

export interface ClubFormData {
  name: string
  logo?: string
  user?: string
  isActive?: boolean
}

export interface RegisterPlayerFormData {
  name: string
  birthdate: string
  ownerClubId: string
  actualClubId?: string | null
  overall: number
  sofifaId?: string | null
  transfermarktId?: string | null
  isActive: boolean
}

export interface KempesitaConfig {
  id: string
  maxBirthYear: number
  isActive: boolean
}

export interface KempesitaConfigResponse {
  data: KempesitaConfig | null
  message?: string
}

export interface AuthResponse {
  message: string
}

export interface UserResponse {
  message: string
  user?: User
}

export interface UserRoleResponse {
  message: string
  role?: 'ADMIN' | 'USER'
}

export interface UsersResponse {
  users: User[]
}

export interface ClubResponse {
  message: string
  club?: Club
  logo?: string
  user?: string
}

export interface ClubsResponse {
  clubs: Club[]
}

export interface PlayerResponse {
  message: string
  player?: Player
}

export interface PlayersResponse {
  players: Player[]
}

export interface RegisterSalaryRateFormData {
  minOverall: number
  maxOverall: number
  salary: number
}

export interface SalaryRateResponse {
  message: string
  salaryRate?: SalaryRate
}

export interface SalaryRatesResponse {
  salaryRates: SalaryRate[]
}

export type UserRole = 'ADMIN' | 'USER'

// ==================== Transfer Types ====================

export type TransferType =
  | 'PURCHASE'
  | 'SALE'
  | 'LOAN_IN'
  | 'LOAN_OUT'
  | 'AUCTION'
  | 'FREE_AGENT'
  | 'INACTIVE_STATUS'
  | 'RETURN_FROM_LOAN'

export type TransferStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PARTIALLY_PAID'

export type InstallmentStatus = 'PENDING' | 'DUE' | 'PAID' | 'OVERDUE'

export type TransactionType =
  | 'TRANSFER_INCOME'
  | 'TRANSFER_EXPENSE'
  | 'LOAN_FEE_INCOME'
  | 'LOAN_FEE_EXPENSE'
  | 'PRIZE_INCOME'
  | 'FINE_EXPENSE'
  | 'SALARY_EXPENSE'
  | 'BONUS_INCOME'
  | 'AUCTION_INCOME'
  | 'AUCTION_EXPENSE'
  | 'PLAYER_SWAP_CREDIT'
  | 'PLAYER_SWAP_DEBIT'

export type SeasonHalfType = 'FIRST_HALF' | 'SECOND_HALF'

export type TransferWindowStatus = 'OPEN' | 'CLOSED'

export interface SeasonHalf {
  id: string
  seasonId: string
  seasonNumber?: number
  halfType: SeasonHalfType
  startDate?: string
  endDate?: string
  isActive: boolean
}

export interface TransferWindow {
  id: string
  seasonHalfId: string
  seasonHalf?: SeasonHalf
  name: string
  startDate: string
  endDate: string
  status: TransferWindowStatus
}

export interface TransferInstallment {
  id: string
  transferId: string
  installmentNumber: number
  amount: number
  dueSeasonHalfId: string
  status: InstallmentStatus
  paidAt?: string
  dueSeasonHalf?: {
    id: string
    halfType: SeasonHalfType
    seasonId: string
  }
}

export interface TransferPlayerPayment {
  id: string
  transferId: string
  playerId: string
  valuationAmount: number
  player?: {
    id: string
    name: string
    overall: number | null
    position?: string
  }
}

export interface Transfer {
  id: string
  type: TransferType
  status: TransferStatus
  playerId: string
  fromClubId: string
  toClubId: string
  initiatorClubId?: string
  transferWindowId?: string
  seasonHalfId: string
  totalAmount: number
  numberOfInstallments: number
  loanDurationHalves?: number
  returnSeasonHalfId?: string
  loanFee?: number
  loanSalaryPercentage?: number
  notes?: string
  createdAt: string
  completedAt?: string
  player?: {
    id: string
    name: string
    overall: number | null
    position?: string
    isKempesita?: boolean
  }
  fromClub?: {
    id: string
    name: string
    shortName?: string
    logo?: string
  }
  toClub?: {
    id: string
    name: string
    shortName?: string
    logo?: string
  }
  initiatorClub?: {
    id: string
    name: string
    shortName?: string
    logo?: string
  }
  seasonHalf?: {
    id: string
    halfType: SeasonHalfType
    seasonId: string
  }
  transferWindow?: {
    id: string
    name: string
    status: TransferWindowStatus
  }
  installments?: TransferInstallment[]
  playersAsPayment?: TransferPlayerPayment[]
}

// ==================== Finance Types ====================

export interface FinancialTransaction {
  id: string
  clubId: string
  type: TransactionType
  amount: number
  description: string
  transferId?: string
  installmentId?: string
  seasonHalfId: string
  createdAt: string
  club?: {
    id: string
    name: string
    shortName?: string
    logo?: string
  }
  seasonHalf?: {
    id: string
    halfType: SeasonHalfType
    seasonId: string
    seasonNumber?: number
  }
}

export interface ClubSeasonBalance {
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
    logo?: string
  }
  seasonHalf?: {
    id: string
    halfType: SeasonHalfType
    seasonId: string
    seasonNumber?: number
  }
}

export interface CompetitionPrize {
  id: string
  competitionTypeId: string
  position: number
  prizeAmount: number
  description?: string
  competitionType?: {
    id: string
    name: string
  }
}

export interface FinancialReport {
  clubId: string
  seasonHalfId: string
  balance: {
    starting: number
    income: number
    expenses: number
    salaries: number
    ending: number
  }
  transactionSummary: Record<string, { count: number; total: number }>
  transactionCount: number
}

// ==================== Transfer Form Inputs ====================

export interface TransferFilters {
  type?: TransferType
  status?: TransferStatus
  seasonHalfId?: string
  transferWindowId?: string
}

export interface CreateTransferInput {
  type: TransferType
  playerId: string
  fromClubId: string
  toClubId: string
  initiatorClubId: string
  totalAmount: number
  numberOfInstallments?: number
  transferWindowId?: string
  installments?: Array<{
    amount: number
    dueSeasonHalfId: string
  }>
  playersAsPayment?: Array<{
    playerId: string
    valuationAmount: number
  }>
  notes?: string
}

export interface CreateLoanInput {
  playerId: string
  fromClubId: string
  toClubId: string
  loanDurationHalves: number
  loanFee?: number
  numberOfInstallments?: number
  loanSalaryPercentage?: number
  transferWindowId?: string
  notes?: string
}

export interface CreateAuctionInput {
  playerId: string
  toClubId: string
  auctionPrice: number
  notes?: string
}

export interface SignFreeAgentInput {
  playerId: string
  toClubId: string
  signingFee: number
  freeClubId: string
  notes?: string
}

// ==================== Finance Form Inputs ====================

export interface TransactionFilters {
  clubId?: string
  seasonHalfId?: string
  type?: TransactionType
}

export interface CreatePrizeInput {
  competitionTypeId: string
  position: number
  prizeAmount: number
  description?: string
}

export interface AwardPrizeInput {
  clubId: string
  competitionTypeId: string
  position: number
  seasonHalfId?: string
  description?: string
}

export interface RecordFineInput {
  clubId: string
  amount: number
  description: string
  seasonHalfId?: string
}

export interface RecordBonusInput {
  clubId: string
  amount: number
  description: string
  seasonHalfId?: string
}

// ==================== Transfer Responses ====================

export interface TransfersResponse {
  transfers: Transfer[]
}

export interface TransferResponse {
  transfer?: Transfer
  message?: string
}

export interface RosterCountResponse {
  rosterCount: {
    senior: number
    kempesita: number
  }
}

// ==================== Finance Responses ====================

export interface TransactionsResponse {
  transactions: FinancialTransaction[]
}

export interface TransactionResponse {
  transaction?: FinancialTransaction
  message?: string
}

export interface BalanceResponse {
  balance?: ClubSeasonBalance
  message?: string
}

export interface BalancesResponse {
  balances: ClubSeasonBalance[]
}

export interface PrizeResponse {
  prize?: CompetitionPrize
  message?: string
}

export interface PrizesResponse {
  prizes: CompetitionPrize[]
}

export interface FinancialReportResponse {
  report?: FinancialReport
  message?: string
}

export interface ProcessSalariesResponse {
  clubsProcessed: number
  totalSalariesPaid: number
  details: Array<{
    clubId: string
    clubName: string
    totalSalary: number
    playerCount: number
  }>
}

export interface UpdateInstallmentStatusesResponse {
  markedDue: number
  markedOverdue: number
}

export interface InstallmentWithTransfer extends TransferInstallment {
  transfer: Transfer
}

// ==================== Season Half & Transfer Window Responses ====================

export interface SeasonHalvesResponse {
  seasonHalves: SeasonHalf[]
}

export interface SeasonHalfResponse {
  seasonHalf?: SeasonHalf
  message?: string
}

export interface TransferWindowsResponse {
  transferWindows: TransferWindow[]
}

export interface TransferWindowResponse {
  transferWindow?: TransferWindow
  message?: string
}
