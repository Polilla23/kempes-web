import { SeasonDeadlineRepository } from '@/features/season-deadlines/season-deadlines.repository'
import { SeasonDeadlineNotFoundError } from '@/features/season-deadlines/season-deadlines.errors'
import { Validator } from '@/features/utils/validation'
import { DeadlineType } from '@prisma/client'

interface CreateDeadlineInput {
  seasonId: string
  type: DeadlineType
  title: string
  description?: string
  date: string
}

interface BulkCreateDeadlineInput {
  type: DeadlineType
  title: string
  description?: string
  date: string
}

interface UpdateDeadlineInput {
  title?: string
  description?: string
  date?: string
  isCompleted?: boolean
}

export class SeasonDeadlineService {
  private seasonDeadlineRepository: SeasonDeadlineRepository

  constructor({ seasonDeadlineRepository }: { seasonDeadlineRepository: SeasonDeadlineRepository }) {
    this.seasonDeadlineRepository = seasonDeadlineRepository
  }

  async findBySeasonId(seasonId: string) {
    const validId = Validator.uuid(seasonId)
    return await this.seasonDeadlineRepository.findBySeasonId(validId)
  }

  async create(input: CreateDeadlineInput) {
    const validSeasonId = Validator.uuid(input.seasonId)
    const validTitle = Validator.string(input.title, 1, 200)
    const validDate = new Date(input.date)

    if (isNaN(validDate.getTime())) {
      throw new Error('Invalid date format')
    }

    return await this.seasonDeadlineRepository.save({
      seasonId: validSeasonId,
      type: input.type,
      title: validTitle,
      description: input.description || null,
      date: validDate,
    })
  }

  async bulkCreate(seasonId: string, deadlines: BulkCreateDeadlineInput[]) {
    const validSeasonId = Validator.uuid(seasonId)

    const data = deadlines.map((d) => ({
      seasonId: validSeasonId,
      type: d.type,
      title: d.title,
      description: d.description || null,
      date: new Date(d.date),
    }))

    return await this.seasonDeadlineRepository.saveMany(data)
  }

  async update(id: string, input: UpdateDeadlineInput) {
    const validId = Validator.uuid(id)

    const existing = await this.seasonDeadlineRepository.findOneById(validId)
    if (!existing) {
      throw new SeasonDeadlineNotFoundError()
    }

    const updateData: any = {}
    if (input.title !== undefined) updateData.title = Validator.string(input.title, 1, 200)
    if (input.description !== undefined) updateData.description = input.description
    if (input.date !== undefined) {
      const validDate = new Date(input.date)
      if (isNaN(validDate.getTime())) throw new Error('Invalid date format')
      updateData.date = validDate
    }
    if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted

    return await this.seasonDeadlineRepository.updateOneById(validId, updateData)
  }

  async delete(id: string) {
    const validId = Validator.uuid(id)

    const existing = await this.seasonDeadlineRepository.findOneById(validId)
    if (!existing) {
      throw new SeasonDeadlineNotFoundError()
    }

    return await this.seasonDeadlineRepository.deleteOneById(validId)
  }

  async toggleCompleted(id: string) {
    const validId = Validator.uuid(id)

    const existing = await this.seasonDeadlineRepository.findOneById(validId)
    if (!existing) {
      throw new SeasonDeadlineNotFoundError()
    }

    return await this.seasonDeadlineRepository.updateOneById(validId, {
      isCompleted: !existing.isCompleted,
    })
  }
}
