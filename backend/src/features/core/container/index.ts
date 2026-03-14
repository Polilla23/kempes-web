// Dependency Injection Container Setup

//Imports
import { createContainer, asClass, asValue } from 'awilix'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { UserService } from '@/features/users/users.service'
import { UserRepository } from '@/features/users/users.repository'
import { UserController } from '@/features/users/users.controller'
import { EmailService } from '@/features/core/email/email.service'
import { MyAccountService } from '@/features/me/me.service'
import { MyAccountController } from '@/features/me/me.controller'
import { MyAccountRepository } from '@/features/me/me.repository'
import { PlayerRepository } from '@/features/players/players.repository'
import { PlayerController } from '@/features/players/players.controller'
import { PlayerService } from '@/features/players/players.service'
import { ClubRepository } from '@/features/clubs/clubs.repository'
import { ClubController } from '@/features/clubs/clubs.controller'
import { ClubService } from '@/features/clubs/clubs.service'
import { CompetitionTypeRepository } from '@/features/competition-types/competition-types.repository'
import { CompetitionTypeController } from '@/features/competition-types/competition-types.controller'
import { CompetitionTypeService } from '@/features/competition-types/competition-types.service'
import { CompetitionRepository } from '@/features/competitions/competitions.repository'
import { CompetitionController } from '@/features/competitions/competitions.controller'
import { CompetitionService } from '@/features/competitions/competitions.service'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { FixtureService } from '@/features/fixtures/fixtures.service'
import { FixtureController } from '@/features/fixtures/fixtures.controller'
import { EventRepository } from '@/features/events/events.repository'
import { EventController } from '@/features/events/events.controller'
import { EventService } from '@/features/events/events.service'
import { EventTypeRepository } from '@/features/event-types/event-types.repository'
import { EventTypeController } from '@/features/event-types/event-types.controller'
import { EventTypeService } from '@/features/event-types/event-types.service'
import { SeasonRepository } from '@/features/seasons/seasons.repository'
import { SeasonController } from '@/features/seasons/seasons.controller'
import { SeasonService } from '@/features/seasons/seasons.service'
import { StandingsService } from '@/features/seasons/standings.service'
import { StandingsController } from '@/features/seasons/standings.controller'
import { SalaryRateRepository } from '@/features/salary-rates/salary-rates.repository'
import { SalaryRateController } from '@/features/salary-rates/salary-rates.controller'
import { SalaryRateService } from '@/features/salary-rates/salary-rates.service'
import { StorageRepository } from '@/features/storage/storage.repository'
import { StorageService } from '@/features/storage/storage.service'
import { StorageController } from '@/features/storage/storage.controller'
import { SupabaseProvider } from '@/features/storage/providers/supabase.provider'
import { NewsRepository } from '@/features/news/news.repository'
import { NewsService } from '@/features/news/news.service'
import { NewsController } from '@/features/news/news.controller'
import { SeasonHalfRepository } from '@/features/season-halves/season-halves.repository'
import { SeasonHalfController } from '@/features/season-halves/season-halves.controller'
import { SeasonHalfService } from '@/features/season-halves/season-halves.service'
import { TransferWindowRepository } from '@/features/transfer-windows/transfer-windows.repository'
import { TransferWindowController } from '@/features/transfer-windows/transfer-windows.controller'
import { TransferWindowService } from '@/features/transfer-windows/transfer-windows.service'
import { TransferRepository } from '@/features/transfers/transfers.repository'
import { TransferController } from '@/features/transfers/transfers.controller'
import { TransferService } from '@/features/transfers/transfers.service'
import { FinanceRepository } from '@/features/finances/finances.repository'
import { FinanceController } from '@/features/finances/finances.controller'
import { FinanceService } from '@/features/finances/finances.service'
import { KempesitaConfigRepository } from '@/features/kempesita-config/kempesita-config.repository'
import { KempesitaConfigController } from '@/features/kempesita-config/kempesita-config.controller'
import { KempesitaConfigService } from '@/features/kempesita-config/kempesita-config.service'
import { CommentRepository } from '@/features/comments/comments.repository'
import { CommentService } from '@/features/comments/comments.service'
import { CommentController } from '@/features/comments/comments.controller'
import { SeasonDeadlineRepository } from '@/features/season-deadlines/season-deadlines.repository'
import { SeasonDeadlineService } from '@/features/season-deadlines/season-deadlines.service'
import { SeasonDeadlineController } from '@/features/season-deadlines/season-deadlines.controller'
import { PlazoRepository } from '@/features/plazos/plazos.repository'
import { PlazoService } from '@/features/plazos/plazos.service'
import { PlazoController } from '@/features/plazos/plazos.controller'

export function createDepencyContainer(fastify: FastifyInstance) {
  const prisma = new PrismaClient()
  const container = createContainer()

  container.register({
    prisma: asValue(prisma),

    userRepository: asClass(UserRepository).singleton(),
    playerRepository: asClass(PlayerRepository).singleton(),
    clubRepository: asClass(ClubRepository).singleton(),
    competitionTypeRepository: asClass(CompetitionTypeRepository).singleton(),
    competitionRepository: asClass(CompetitionRepository).singleton(),
    fixtureRepository: asClass(FixtureRepository).singleton(),
    eventRepository: asClass(EventRepository).singleton(),
    eventTypeRepository: asClass(EventTypeRepository).singleton(),
    seasonRepository: asClass(SeasonRepository).singleton(),
    salaryRateRepository: asClass(SalaryRateRepository).singleton(),
    seasonHalfRepository: asClass(SeasonHalfRepository).singleton(),
    transferWindowRepository: asClass(TransferWindowRepository).singleton(),
    transferRepository: asClass(TransferRepository).singleton(),
    financeRepository: asClass(FinanceRepository).singleton(),
    myAccountRepository: asClass(MyAccountRepository).singleton(),
    storageRepository: asClass(StorageRepository).singleton(),
    newsRepository: asClass(NewsRepository).singleton(),
    kempesitaConfigRepository: asClass(KempesitaConfigRepository).singleton(),
    commentRepository: asClass(CommentRepository).singleton(),
    seasonDeadlineRepository: asClass(SeasonDeadlineRepository).singleton(),
    plazoRepository: asClass(PlazoRepository).singleton(),

    userController: asClass(UserController).singleton(),
    myAccountController: asClass(MyAccountController).singleton(),
    playerController: asClass(PlayerController).singleton(),
    clubController: asClass(ClubController).singleton(),
    competitionTypeController: asClass(CompetitionTypeController).singleton(),
    competitionController: asClass(CompetitionController).singleton(),
    fixtureController: asClass(FixtureController).singleton(),
    eventController: asClass(EventController).singleton(),
    eventTypeController: asClass(EventTypeController).singleton(),
    seasonController: asClass(SeasonController).singleton(),
    standingsController: asClass(StandingsController).singleton(),
    salaryRateController: asClass(SalaryRateController).singleton(),
    storageController: asClass(StorageController).singleton(),
    newsController: asClass(NewsController).singleton(),
    seasonHalfController: asClass(SeasonHalfController).singleton(),
    transferWindowController: asClass(TransferWindowController).singleton(),
    transferController: asClass(TransferController).singleton(),
    financeController: asClass(FinanceController).singleton(),
    kempesitaConfigController: asClass(KempesitaConfigController).singleton(),
    commentController: asClass(CommentController).singleton(),
    seasonDeadlineController: asClass(SeasonDeadlineController).singleton(),
    plazoController: asClass(PlazoController).singleton(),

    userService: asClass(UserService).singleton(),
    myAccountService: asClass(MyAccountService).singleton(),
    playerService: asClass(PlayerService).singleton(),
    clubService: asClass(ClubService).singleton(),
    competitionTypeService: asClass(CompetitionTypeService).singleton(),
    competitionService: asClass(CompetitionService).singleton(),
    fixtureService: asClass(FixtureService).singleton(),
    eventService: asClass(EventService).singleton(),
    eventTypeService: asClass(EventTypeService).singleton(),
    seasonService: asClass(SeasonService).singleton(),
    standingsService: asClass(StandingsService).singleton(),
    salaryRateService: asClass(SalaryRateService).singleton(),
    storageService: asClass(StorageService).singleton(),
    newsService: asClass(NewsService).singleton(),
    seasonHalfService: asClass(SeasonHalfService).singleton(),
    transferWindowService: asClass(TransferWindowService).singleton(),
    transferService: asClass(TransferService).singleton(),
    financeService: asClass(FinanceService).singleton(),
    kempesitaConfigService: asClass(KempesitaConfigService).singleton(),
    commentService: asClass(CommentService).singleton(),
    seasonDeadlineService: asClass(SeasonDeadlineService).singleton(),
    plazoService: asClass(PlazoService).singleton(),

    emailService: asClass(EmailService).singleton(),
    supabaseProvider: asClass(SupabaseProvider).singleton(),

    jwtService: asValue(fastify.jwt),
    fastify: asValue(fastify),
  })

  prisma
    .$connect()
    .then(() => console.log('Connected to DB'))
    .catch((e: Error) => {
      console.error('Failed to connect to DB', e)
      process.exit(1)
    })

  return container
}
