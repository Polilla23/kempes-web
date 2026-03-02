import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { TeamStanding } from '../_types/standings.types'

interface StandingsTableProps {
  standings: TeamStanding[]
}

function getZoneColor(zone?: string | null) {
  switch (zone) {
    case 'champion':
      return 'bg-yellow-500/10'
    case 'liguilla':
    case 'triangular':
      return 'bg-purple-500/10'
    case 'promotion':
      return 'bg-green-500/10'
    case 'playoff':
    case 'promotion_playoff':
      return 'bg-blue-500/10'
    case 'playout':
      return 'bg-orange-500/10'
    case 'relegation':
      return 'bg-red-500/10'
    case 'relegation_playoff':
      return 'bg-red-300/10'
    case 'reducido':
      return 'bg-cyan-500/10'
    case 'gold_cup':
      return 'bg-amber-500/10 dark:bg-amber-400/10'
    case 'silver_cup':
      return 'bg-slate-400/10 dark:bg-slate-300/10'
    default:
      return ''
  }
}

function getPositionBadge(position: number, zone?: string | null) {
  if (zone === 'champion') {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">{position}</Badge>
  }
  if (zone === 'liguilla' || zone === 'triangular') {
    return <Badge className="bg-purple-500 hover:bg-purple-600">{position}</Badge>
  }
  if (zone === 'promotion') {
    return <Badge className="bg-green-500 hover:bg-green-600">{position}</Badge>
  }
  if (zone === 'playoff' || zone === 'promotion_playoff') {
    return <Badge className="bg-blue-500 hover:bg-blue-600">{position}</Badge>
  }
  if (zone === 'playout') {
    return <Badge className="bg-orange-500 hover:bg-orange-600">{position}</Badge>
  }
  if (zone === 'relegation') {
    return <Badge className="bg-red-500 hover:bg-red-600">{position}</Badge>
  }
  if (zone === 'relegation_playoff') {
    return <Badge className="bg-red-400 hover:bg-red-500">{position}</Badge>
  }
  if (zone === 'reducido') {
    return <Badge className="bg-cyan-500 hover:bg-cyan-600">{position}</Badge>
  }
  if (zone === 'gold_cup') {
    return <Badge className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">{position}</Badge>
  }
  if (zone === 'silver_cup') {
    return <Badge className="bg-slate-400 hover:bg-slate-500 dark:bg-slate-400 dark:hover:bg-slate-500">{position}</Badge>
  }
  return <Badge variant="outline">{position}</Badge>
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead className="text-center w-12">PJ</TableHead>
          <TableHead className="text-center w-12">G</TableHead>
          <TableHead className="text-center w-12">E</TableHead>
          <TableHead className="text-center w-12">P</TableHead>
          <TableHead className="text-center w-16">GF</TableHead>
          <TableHead className="text-center w-16">GC</TableHead>
          <TableHead className="text-center w-16">DG</TableHead>
          <TableHead className="text-center w-16 font-bold">PTS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((team) => (
          <TableRow key={team.clubId} className={getZoneColor(team.zone)}>
            <TableCell className="text-center">
              {getPositionBadge(team.position, team.zone)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {team.clubLogo && <AvatarImage src={team.clubLogo} alt={team.clubName} />}
                  <AvatarFallback>{team.clubName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{team.clubName}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">{team.played}</TableCell>
            <TableCell className="text-center text-green-600">{team.won}</TableCell>
            <TableCell className="text-center text-yellow-600">{team.drawn}</TableCell>
            <TableCell className="text-center text-red-600">{team.lost}</TableCell>
            <TableCell className="text-center">{team.goalsFor}</TableCell>
            <TableCell className="text-center">{team.goalsAgainst}</TableCell>
            <TableCell className="text-center">
              <span
                className={
                  team.goalDifference > 0
                    ? 'text-green-600'
                    : team.goalDifference < 0
                      ? 'text-red-600'
                      : ''
                }
              >
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </span>
            </TableCell>
            <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
