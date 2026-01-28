export type CreatePlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId: string
  ownerClubId: string
  overall: number
  salary: number
  sofifaId: string
  transfermarktId: string
  isKempesita: boolean
  isActive: boolean
}

export type CreateBasicPlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId?: string
  ownerClubId?: string
  overall?: number
  salary?: number
  sofifaId?: string
  transfermarktId?: string
}
