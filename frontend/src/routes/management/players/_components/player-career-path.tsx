import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Transfer } from '@/types'

interface CareerNode {
  clubId: string
  clubName: string
  clubLogo?: string
  isLoan: boolean
}

function buildCareerPath(transfers: Transfer[]): CareerNode[] {
  const sorted = [...transfers].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const nodes: CareerNode[] = []
  const seenClubIds = new Set<string>()

  // Start: the first fromClub
  const firstTransfer = sorted[0]
  if (firstTransfer?.fromClub) {
    nodes.push({
      clubId: firstTransfer.fromClubId,
      clubName: firstTransfer.fromClub.name,
      clubLogo: firstTransfer.fromClub.logo,
      isLoan: false,
    })
    seenClubIds.add(firstTransfer.fromClubId)
  } else {
    nodes.push({ clubId: 'libre', clubName: 'Libre', isLoan: false })
  }

  for (const tr of sorted) {
    if (!tr.toClub) continue
    const isLoan = tr.type === 'LOAN_IN' || tr.type === 'LOAN_OUT'
    nodes.push({
      clubId: tr.toClubId,
      clubName: tr.toClub.name,
      clubLogo: tr.toClub.logo,
      isLoan,
    })
  }

  return nodes
}

interface PlayerCareerPathProps {
  transfers: Transfer[]
}

export function PlayerCareerPath({ transfers }: PlayerCareerPathProps) {
  const nodes = buildCareerPath(transfers)

  if (nodes.length === 0) return null

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {nodes.map((node, i) => (
        <div key={`${node.clubId}-${i}`} className="flex items-center gap-1 flex-shrink-0">
          {/* Club node */}
          <div className="flex flex-col items-center gap-1.5">
            <Avatar className="h-10 w-10">
              <AvatarImage src={node.clubLogo ?? undefined} />
              <AvatarFallback className="text-xs font-bold">
                {node.clubName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-medium text-center max-w-[80px] truncate">
                {node.clubName}
              </span>
              {node.isLoan && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0">
                  Préstamo
                </Badge>
              )}
            </div>
          </div>

          {/* Arrow to next node */}
          {i < nodes.length - 1 && (
            <span
              className={cn(
                'text-muted-foreground font-bold text-lg px-1',
                nodes[i + 1]?.isLoan ? 'opacity-40' : ''
              )}
            >
              →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
