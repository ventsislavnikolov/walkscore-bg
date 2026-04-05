export function scoreColor(score: number): string {
  if (score >= 90) return '#059669'
  if (score >= 70) return '#34d399'
  if (score >= 50) return '#fbbf24'
  if (score >= 25) return '#f97316'
  return '#dc2626'
}

export function scoreColorClass(score: number): string {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 70) return 'text-emerald-500'
  if (score >= 50) return 'text-amber-500'
  if (score >= 25) return 'text-orange-500'
  return 'text-red-600'
}

export function scoreBgClass(score: number): string {
  if (score >= 90) return 'bg-emerald-600'
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  if (score >= 25) return 'bg-orange-500'
  return 'bg-red-600'
}
