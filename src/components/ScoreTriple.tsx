import { ScoreGauge } from "./ScoreGauge";

interface ScoreTripleProps {
  bikeScore: number;
  size?: "lg" | "md" | "sm";
  transitScore: number;
  walkScore: number;
}

export function ScoreTriple({
  walkScore,
  transitScore,
  bikeScore,
  size = "lg",
}: ScoreTripleProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
      <ScoreGauge score={walkScore} size={size} type="walk" />
      <ScoreGauge score={transitScore} size={size} type="transit" />
      <ScoreGauge score={bikeScore} size={size} type="bike" />
    </div>
  );
}
