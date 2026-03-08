export type CreatePlayerInput = {
  fullName: string
  birthdate: Date
  actualClubId: string
  ownerClubId: string
  overall: number
  sofifaId: string
  transfermarktId: string
  isActive: boolean
}

export type CreateBasicPlayerInput = {
  fullName: string
  birthdate: Date
  actualClubId?: string
  ownerClubId?: string
  overall?: number
  sofifaId?: string
  transfermarktId?: string
}
