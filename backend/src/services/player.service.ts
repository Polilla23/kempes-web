import { IPlayerRespository } from "../interfaces/IPlayerRepository";
import { Player } from "@prisma/client";
import { parseDateFromDDMMYYYY } from "../utils/date";
import { CreatePlayerInput } from "../utils/types";

export class PlayerService {
    private playerRepository: IPlayerRespository
    
    constructor({ playerRepository}: { playerRepository: IPlayerRespository }) {
        this.playerRepository = playerRepository
    }

    async createPlayer({ name, lastName, birthdate, actualClubId, ownerClubId, overall, salary, sofifaId, transfermarktId, isKempesita, isActive}: CreatePlayerInput) {
        const birthdateAsDate = parseDateFromDDMMYYYY(birthdate)
        
        const newPlayer = await this.playerRepository.save({
            name,
            lastName,
            birthdate: birthdateAsDate,
            overall,
            salary,
            sofifaId,
            transfermarktId,
            isKempesita,
            isActive,
            actualClub: { connect: { id: actualClubId }},
            ownerClub: { connect: { id: actualClubId }}
        })

        return newPlayer;
    }

    async findAllPlayers() {
        return this.playerRepository.findAll()
    }

    async updatePlayer(id: string, data: Partial<Player>) {
        const player = await this.playerRepository.findOneById(id)

        if (!player) throw new Error('Player not found')

        if (data.actualClubId) {
            
        }
    }

    async deletePlayer(id: string) {
        return this.playerRepository.deleteOneById(id)
    }

    async findPlayerById(id: string) {
        return this.playerRepository.findOneById(id)
    }
}