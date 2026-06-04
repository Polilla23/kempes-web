import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/finance-utils'
import type { SalaryProcessingPreviewClub } from '@/types'

interface SalaryClubRowProps {
  club: SalaryProcessingPreviewClub
  isExpanded: boolean
  onToggle: () => void
}

export function SalaryClubRow({ club, isExpanded, onToggle }: SalaryClubRowProps) {
  return (
    <>
      <tr
        className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium">{club.clubName}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <Badge variant="secondary">{club.playerCount}</Badge>
        </td>
        <td className="px-4 py-3 text-right font-mono text-muted-foreground">
          {formatCurrency(club.grossSalary)}
        </td>
        <td className="px-4 py-3 text-right font-mono text-blue-600">
          {club.loanAdjustments !== 0
            ? (club.loanAdjustments > 0 ? '+' : '') + formatCurrency(club.loanAdjustments)
            : '—'}
        </td>
        <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">
          -{formatCurrency(club.finalSalary)}
        </td>
      </tr>

      {isExpanded &&
        club.players.map((player) => (
          <tr key={player.playerId} className="border-b bg-muted/20">
            <td className="px-4 py-2 pl-12">
              <span className="text-sm">{player.playerName}</span>
            </td>
            <td className="px-4 py-2 text-center">
              {player.overall != null ? (
                <Badge variant="outline" className="text-xs font-mono">
                  {player.overall}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </td>
            <td className="px-4 py-2 text-right text-sm font-mono text-muted-foreground">
              {formatCurrency(player.salary)}
            </td>
            <td className="px-4 py-2 text-center">
              <Badge
                variant={player.salaryStatus === 'LOAN_PARTIAL' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {player.salaryStatus === 'LOAN_PARTIAL'
                  ? `Cedido ${player.loanPercentage ?? 0}%`
                  : 'Titular'}
              </Badge>
            </td>
            <td className="px-4 py-2 text-right text-sm font-mono font-semibold text-red-600">
              -{formatCurrency(player.amountToPay)}
            </td>
          </tr>
        ))}
    </>
  )
}
