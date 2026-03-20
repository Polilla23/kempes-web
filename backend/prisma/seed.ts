import { PrismaClient, CompetitionCategory, CompetitionFormat, CompetitionName, MovementType, CupPhase } from '@prisma/client'

const prisma = new PrismaClient()

interface CompetitionTypeData {
  name: CompetitionName
  format: CompetitionFormat
  category: CompetitionCategory
  hierarchy: number
}

const competitionTypes: CompetitionTypeData[] = [
  // LIGAS SENIOR (hierarchy 1-5 para ordenar)
  { name: CompetitionName.LEAGUE_A, format: CompetitionFormat.LEAGUE, category: CompetitionCategory.SENIOR, hierarchy: 1 },
  { name: CompetitionName.LEAGUE_B, format: CompetitionFormat.LEAGUE, category: CompetitionCategory.SENIOR, hierarchy: 2 },
  { name: CompetitionName.LEAGUE_C, format: CompetitionFormat.LEAGUE, category: CompetitionCategory.SENIOR, hierarchy: 3 },
  { name: CompetitionName.LEAGUE_D, format: CompetitionFormat.LEAGUE, category: CompetitionCategory.SENIOR, hierarchy: 4 },
  { name: CompetitionName.LEAGUE_E, format: CompetitionFormat.LEAGUE, category: CompetitionCategory.SENIOR, hierarchy: 5 },

  // COPAS SENIOR
  { name: CompetitionName.KEMPES_CUP, format: CompetitionFormat.CUP, category: CompetitionCategory.SENIOR, hierarchy: 1 },
  { name: CompetitionName.GOLD_CUP, format: CompetitionFormat.CUP, category: CompetitionCategory.SENIOR, hierarchy: 2 },
  { name: CompetitionName.SILVER_CUP, format: CompetitionFormat.CUP, category: CompetitionCategory.SENIOR, hierarchy: 3 },

  // COPA KEMPESITA
  { name: CompetitionName.CINDOR_CUP, format: CompetitionFormat.CUP, category: CompetitionCategory.KEMPESITA, hierarchy: 1 },

  // SUPERCOPA - Mixta (Mayores + Kempesitas juntos)
  { name: CompetitionName.SUPER_CUP, format: CompetitionFormat.CUP, category: CompetitionCategory.MIXED, hierarchy: 4 },
]

async function main() {
  console.log('Seeding competition types...')

  for (const type of competitionTypes) {
    const existing = await prisma.competitionType.findFirst({
      where: { name: type.name, category: type.category }
    })

    if (existing) {
      // Update if exists (upsert behavior)
      await prisma.competitionType.update({
        where: { id: existing.id },
        data: {
          format: type.format,
          hierarchy: type.hierarchy,
        }
      })
      console.log(`Updated: ${type.name} (${type.category}, ${type.format})`)
    } else {
      // Create if doesn't exist
      await prisma.competitionType.create({
        data: type
      })
      console.log(`Created: ${type.name} (${type.category}, ${type.format})`)
    }
  }

  // Also seed EventTypes if they don't exist
  const eventTypes = [
    { name: 'GOAL' as const, displayName: 'Gol', icon: '⚽' },
    { name: 'YELLOW_CARD' as const, displayName: 'Tarjeta Amarilla', icon: '🟨' },
    { name: 'RED_CARD' as const, displayName: 'Tarjeta Roja', icon: '🟥' },
    { name: 'INJURY' as const, displayName: 'Lesión', icon: '🤕' },
    { name: 'MVP' as const, displayName: 'MVP', icon: '🌟' },
  ]

  for (const eventType of eventTypes) {
    const existing = await prisma.eventType.findUnique({
      where: { name: eventType.name }
    })

    if (!existing) {
      await prisma.eventType.create({
        data: eventType
      })
      console.log(`Created EventType: ${eventType.name}`)
    }
  }

  // Seed TitlePointConfig
  console.log('Seeding title point configs...')

  const titlePointConfigs = [
    { competitionName: CompetitionName.LEAGUE_A, category: CompetitionCategory.SENIOR, points: 10 },
    { competitionName: CompetitionName.LEAGUE_A, category: CompetitionCategory.KEMPESITA, points: 7 },
    { competitionName: CompetitionName.GOLD_CUP, category: CompetitionCategory.SENIOR, points: 8 },
    { competitionName: CompetitionName.SILVER_CUP, category: CompetitionCategory.SENIOR, points: 5 },
    { competitionName: CompetitionName.CINDOR_CUP, category: CompetitionCategory.KEMPESITA, points: 4 },
    { competitionName: CompetitionName.SUPER_CUP, category: CompetitionCategory.MIXED, points: 6 },
  ]

  // Clean up old configs that are no longer valid (LEAGUE_B-E, KEMPES_CUP)
  const validKeys = titlePointConfigs.map((c) => `${c.competitionName}:${c.category}`)
  const allConfigs = await prisma.titlePointConfig.findMany()
  for (const existing of allConfigs) {
    const key = `${existing.competitionName}:${existing.category}`
    if (!validKeys.includes(key)) {
      await prisma.titlePointConfig.delete({ where: { id: existing.id } })
      console.log(`Deleted obsolete TitlePointConfig: ${existing.competitionName}/${existing.category}`)
    }
  }

  // Upsert valid configs
  for (const config of titlePointConfigs) {
    await prisma.titlePointConfig.upsert({
      where: {
        competitionName_category: {
          competitionName: config.competitionName,
          category: config.category,
        },
      },
      update: { points: config.points },
      create: config,
    })
    console.log(`Upserted TitlePointConfig: ${config.competitionName}/${config.category} = ${config.points} pts`)
  }

  // Backfill TitleHistory from existing SeasonTransition + CoefKempes
  console.log('Backfilling title history...')

  const existingTitles = await prisma.titleHistory.count()
  if (existingTitles > 0) {
    console.log(`TitleHistory already has ${existingTitles} records, skipping backfill`)
  } else {
    // League champions from SeasonTransition
    const leagueChampions = await prisma.seasonTransition.findMany({
      where: { movementType: MovementType.CHAMPION },
      include: {
        fromCompetition: {
          include: { competitionType: { select: { name: true, format: true, category: true } } },
        },
      },
    })

    // Cup champions from CoefKempes
    const cupChampions = await prisma.coefKempes.findMany({
      where: { cupPhase: CupPhase.CHAMPION },
    })

    // Build a lookup for cup competition categories
    const cupCompTypes = await prisma.competitionType.findMany({
      where: { format: CompetitionFormat.CUP },
      select: { name: true, category: true },
    })
    const cupCategoryMap = new Map(cupCompTypes.map((ct) => [ct.name, ct.category]))

    const titleRecords = [
      ...leagueChampions.map((lc) => ({
        clubId: lc.clubId,
        seasonId: lc.seasonId,
        competitionName: lc.fromCompetition.competitionType.name,
        type: lc.fromCompetition.competitionType.format,
        category: lc.fromCompetition.competitionType.category,
      })),
      ...cupChampions.map((cc) => ({
        clubId: cc.clubId,
        seasonId: cc.seasonId,
        competitionName: cc.cupName,
        type: CompetitionFormat.CUP,
        category: cupCategoryMap.get(cc.cupName) || CompetitionCategory.SENIOR,
      })),
    ]

    if (titleRecords.length > 0) {
      await prisma.titleHistory.createMany({
        data: titleRecords,
        skipDuplicates: true,
      })
      console.log(`Backfilled ${titleRecords.length} title history records`)
    } else {
      console.log('No existing champions found to backfill')
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
