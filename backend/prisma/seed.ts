import { PrismaClient, CompetitionCategory, CompetitionFormat, CompetitionName } from '@prisma/client'

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
