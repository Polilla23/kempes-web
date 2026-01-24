interface BracketConnectorProps {
  matchHeight: number
  gapBetweenMatches: number
}

export function BracketConnector({ matchHeight, gapBetweenMatches }: BracketConnectorProps) {
  const halfMatch = matchHeight / 2
  const totalPairHeight = matchHeight * 2 + gapBetweenMatches
  const middlePoint = halfMatch + (matchHeight + gapBetweenMatches) / 2

  return (
    <div
      className="relative"
      style={{ height: totalPairHeight, marginBottom: gapBetweenMatches }}
    >
      {/* Top match horizontal line */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Vertical line connecting both matches */}
      <div
        className="absolute bg-border"
        style={{
          left: 15,
          top: halfMatch,
          width: 2,
          height: matchHeight + gapBetweenMatches,
        }}
      />
      {/* Bottom match horizontal line */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: matchHeight + gapBetweenMatches + halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Middle horizontal line going to next round */}
      <div
        className="absolute bg-border"
        style={{
          left: 16,
          top: middlePoint,
          width: 16,
          height: 2,
        }}
      />
    </div>
  )
}
