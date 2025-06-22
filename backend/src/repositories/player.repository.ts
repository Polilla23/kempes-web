import { IPlayerRespository } from "../interfaces/IPlayerRepository";
import { Prisma, PrismaClient, Player } from "@prisma/client";

export class PlayerRepository implements IPlayerRespository {
    private prisma: PrismaClient

    constructor({ prisma }: { prisma: PrismaClient }) {
        this.prisma = prisma
    }

    async findAll() {
        return await this.prisma.player.findMany()
    }

    async findOneById(id: Prisma.PlayerWhereUniqueInput["id"]) {
        return await this.prisma.player.findUnique({
            where: { id }
        })
    }

    async updateOneById(id: Prisma.PlayerWhereUniqueInput["id"], data: Prisma.PlayerUpdateInput) {
        return await this.prisma.player.update({
            where: { id: id },
            data
        })
    }

    async deleteOneById(id: Prisma.PlayerWhereUniqueInput["id"]) {
        return await this.prisma.player.delete({
            where: { id: id }
        })
    }

    async save(data: Prisma.PlayerCreateInput) {
        return await this.prisma.player.create({ data })
    }
}