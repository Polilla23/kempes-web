// Labels amigables para la UI
export const NAME_LABELS: Record<string, string> = {
  LEAGUE_A: 'Liga A',
  LEAGUE_B: 'Liga B',
  LEAGUE_C: 'Liga C',
  LEAGUE_D: 'Liga D',
  LEAGUE_E: 'Liga E',
  KEMPES_CUP: 'Copa Kempes',
  GOLD_CUP: 'Copa de Oro',
  SILVER_CUP: 'Copa de Plata',
  CINDOR_CUP: 'Copa Cindor',
  SUPER_CUP: 'Supercopa',
  PROMOTIONS: 'Promociones',
}

export const FORMAT_LABELS: Record<string, string> = {
  LEAGUE: 'Liga',
  CUP: 'Copa',
}

export const CATEGORY_LABELS: Record<string, string> = {
  SENIOR: 'Mayores',
  KEMPESITA: 'Kempesita',
  MIXED: 'Mixto',
}

export function formatCompetitionTypeLabel(name: string, category: string): string {
  const nameLabel = NAME_LABELS[name] || name
  const categoryLabel = CATEGORY_LABELS[category] || category
  return `${nameLabel} - ${categoryLabel}`
}
