const { PrismaClient } = require('@prisma/client')

function pickArg(name, argv = process.argv) {
  const idx = argv.findIndex((a) => a === `--${name}`)
  if (idx === -1) return undefined
  return argv[idx + 1]
}

function truthyArg(name, argv = process.argv) {
  return argv.includes(`--${name}`)
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const explicitSeasonId = pickArg('seasonId')
    const explicitCompetitionId = pickArg('competitionId')
    const take = Number(pickArg('take') ?? 25)

    const season = explicitSeasonId
      ? await prisma.season.findUnique({ where: { id: explicitSeasonId } })
      : await prisma.season.findFirst({ where: { isActive: true } })
    console.log('activeSeason:', season)

    const competitions = await prisma.competition.findMany({
      where: explicitCompetitionId ? { id: explicitCompetitionId } : season ? { seasonId: season.id } : {},
      include: {
        competitionType: true,
        _count: { select: { matches: true } },
      },
      orderBy: { name: 'asc' },
    })

    console.log(
      'competitions:',
      competitions.map((c) => ({
        id: c.id,
        name: c.name,
        system: c.system,
        type: c.competitionType?.name,
        format: c.competitionType?.format,
        matches: c._count.matches,
      }))
    )

    const wantFormat = (pickArg('format') ?? '').trim().toUpperCase()
    const cup = competitions.find((c) => {
      if (wantFormat) return (c.competitionType?.format ?? '').toUpperCase() === wantFormat

      // Default heuristic: find a competition with knockout system.
      // This avoids relying on CompetitionType.format for historical data.
      if ((c.system ?? '').toUpperCase() === 'KNOCKOUT') return true

      // Back-compat: if schema uses a CUP format, prefer it.
      return (c.competitionType?.format ?? '').toUpperCase() === 'CUP'
    })
    if (!cup) {
      console.log(wantFormat ? `No ${wantFormat} competition found with current filter` : 'No CUP competition found for active season')
      return
    }

    const cupMatches = await prisma.match.findMany({
      where: { competitionId: cup.id },
      orderBy: { matchdayOrder: 'desc' },
      take: Number.isFinite(take) ? take : 25,
    })

    console.log('cupMatchesCount:', cupMatches.length)
    console.log(
      'cupMatchesSample:',
      cupMatches.slice(0, 10).map((m) => ({
        id: m.id,
        stage: m.stage,
        status: m.status,
        matchdayOrder: m.matchdayOrder,
        homeClubId: m.homeClubId,
        awayClubId: m.awayClubId,
        homeSourceMatchId: m.homeSourceMatchId,
        awaySourceMatchId: m.awaySourceMatchId,
      }))
    )

    if (truthyArg('tree')) {
      const byId = new Map(cupMatches.map((m) => [m.id, m]))
      const roots = cupMatches.filter((m) => !m.homeSourceMatchId && !m.awaySourceMatchId)
      console.log('knockoutRoots:', roots.map((r) => r.id))
      for (const r of roots.slice(0, 8)) {
        const stack = [{ id: r.id, depth: 0 }]
        while (stack.length) {
          const { id, depth } = stack.pop()
          const cur = byId.get(id)
          if (!cur) continue
          const pad = '  '.repeat(depth)
          console.log(`${pad}- ${cur.id} (${cur.stage} / F${cur.matchdayOrder})`) 
          if (cur.homeSourceMatchId) stack.push({ id: cur.homeSourceMatchId, depth: depth + 1 })
          if (cur.awaySourceMatchId) stack.push({ id: cur.awaySourceMatchId, depth: depth + 1 })
        }
      }
    }
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
