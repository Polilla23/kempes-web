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
  logoUrl?: string
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
  lastName: string
  birthdate: string
  photoUrl?: string
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

// Tipos para formularios
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterUserFormData {
  email: string
  password: string
  role?: 'ADMIN' | 'USER'
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
  lastName: string
  birthdate: string
  ownerClubId: string
  actualClubId?: string | null
  overall: number
  salary: number | 100000
  sofifaId?: string | null
  transfermarktId?: string | null
  isKempesita: boolean
  isActive: boolean
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

export type UserRole = 'ADMIN' | 'USER'
