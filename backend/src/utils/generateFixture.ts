function generateFixture({
  seasonId,
  competitionId,
  clubs,
  rematchs,
}: {
  seasonId: number
  competitionId: number
  clubs: any[]
  rematchs: boolean
}) {
  const fixture = {
    season: seasonId,
    competition: competitionId,
    matchDays: [] as Array<{
      matchDay: number
      combinations: Array<[string, string]>
    }>,
  }

  let rotation = [...clubs]

  for (let i = 0; i < clubs.length - 1; i += 1) {
    const matchDay = {
      matchDay: i + 1,
      combinations: [] as Array<[string, string]>,
    }
    for (let j = 0; j < rotation.length - 1; j += 2) {
      const combination: [string, string] = [rotation[j], rotation[j + 1]]
      matchDay.combinations.push(combination)
    }
    fixture.matchDays.push(matchDay)
    rotation = [rotation[0], ...rotation.slice(2), rotation[1]]
  }

  if (rematchs) {
    const totalMatchDays = fixture.matchDays.length
    for (let i = 0; i < totalMatchDays; i++) {
      fixture.matchDays.push({
        matchDay: fixture.matchDays.length + 1,
        combinations: fixture.matchDays[i].combinations.map(([home, away]) => [away, home]),
      })
    }
  }
  return fixture
}
console.log(
  JSON.stringify(
    generateFixture({
      seasonId: 20,
      competitionId: 5,
      clubs: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10'],
      rematchs: true,
    })
  )
)
