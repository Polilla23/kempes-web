export type CreatePlayerInput = {
  name: string
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
  birthdate: Date
  actualClubId?: string
  ownerClubId?: string
  overall?: number
  sofifaId?: string
  transfermarktId?: string
}
