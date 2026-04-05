import { ScoreGauge } from './ScoreGauge'

interface ScoreTripleProps {
  walkScore: number
  transitScore: number
  bikeScore: number
  size?: 'lg' | 'md' | 'sm'
}

export function ScoreTriple({
  walkScore,
  transitScore,
  bikeScore,
  size = 'lg',
}: ScoreTripleProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
      <ScoreGauge score={walkScore} type="walk" size={size} />
      <ScoreGauge score={transitScore} type="transit" size={size} />
      <ScoreGauge score={bikeScore} type="bike" size={size} />
    </div>
  )
}
