import { cn } from '@/lib/utils'

interface BracketConnectorProps {
  matchHeight: number
  gapBetweenMatches: number
  isHighlighted?: boolean
}

export function BracketConnector({
  matchHeight,
  gapBetweenMatches,
  isHighlighted = false,
}: BracketConnectorProps) {
  const halfMatch = matchHeight / 2
  const totalPairHeight = matchHeight * 2 + gapBetweenMatches
  const middlePoint = halfMatch + (matchHeight + gapBetweenMatches) / 2

  const lineColor = isHighlighted ? 'bg-primary' : 'bg-border'
  const lineWidth = isHighlighted ? 3 : 2

  return (
    <div
      className={cn('relative transition-colors', isHighlighted && 'z-10')}
      style={{ height: totalPairHeight, marginBottom: gapBetweenMatches }}
    >
      {/* Top match horizontal line */}
      <div
        className={cn('absolute transition-colors', lineColor)}
        style={{
          left: 0,
          top: halfMatch,
          width: 16,
          height: lineWidth,
        }}
      />
      {/* Vertical line connecting both matches */}
      <div
        className={cn('absolute transition-colors', lineColor)}
        style={{
          left: 15,
          top: halfMatch,
          width: lineWidth,
          height: matchHeight + gapBetweenMatches,
        }}
      />
      {/* Bottom match horizontal line */}
      <div
        className={cn('absolute transition-colors', lineColor)}
        style={{
          left: 0,
          top: matchHeight + gapBetweenMatches + halfMatch,
          width: 16,
          height: lineWidth,
        }}
      />
      {/* Middle horizontal line going to next round */}
      <div
        className={cn('absolute transition-colors', lineColor)}
        style={{
          left: 16,
          top: middlePoint,
          width: 16,
          height: lineWidth,
        }}
      />

      {/* Glow effect when highlighted */}
      {isHighlighted && (
        <>
          <div
            className="absolute bg-primary/30 blur-sm"
            style={{
              left: -2,
              top: halfMatch - 2,
              width: 20,
              height: lineWidth + 4,
            }}
          />
          <div
            className="absolute bg-primary/30 blur-sm"
            style={{
              left: 13,
              top: halfMatch - 2,
              width: lineWidth + 4,
              height: matchHeight + gapBetweenMatches + 4,
            }}
          />
          <div
            className="absolute bg-primary/30 blur-sm"
            style={{
              left: 14,
              top: middlePoint - 2,
              width: 20,
              height: lineWidth + 4,
            }}
          />
        </>
      )}
    </div>
  )
}
