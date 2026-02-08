export type CreatePlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId: string
  ownerClubId: string
  overall: number
  sofifaId: string
  transfermarktId: string
  isActive: boolean
}

export type CreateBasicPlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId?: string
  ownerClubId?: string
  overall?: number
  sofifaId?: string
  transfermarktId?: string
}
