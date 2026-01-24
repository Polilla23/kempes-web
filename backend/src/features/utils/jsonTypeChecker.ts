import { CompetitionRules, KempesCupRules, LeaguesRules, CindorCupRules, SuperCupRules } from '@/types'

/**
 * Type guard for LeaguesRules
 */
export function isLeaguesRules(config: CompetitionRules): config is LeaguesRules {
  return config.type === 'LEAGUES'
}

/**
 * Type guard for KempesCupRules (Copa Kempes - fase de grupos)
 */
export function isKempesCupRules(config: CompetitionRules): config is KempesCupRules {
  // Support both old 'CUP' type and new 'KEMPES_CUP' type for backward compatibility
  return config.type === 'KEMPES_CUP' || config.type === 'CUP'
}

/**
 * Type guard for CindorCupRules (Copa Cindor - eliminación directa Kempesitas)
 */
export function isCindorCupRules(config: CompetitionRules): config is CindorCupRules {
  return config.type === 'CINDOR_CUP'
}

/**
 * Type guard for SuperCupRules (Supercopa - eliminación directa 6 equipos)
 */
export function isSuperCupRules(config: CompetitionRules): config is SuperCupRules {
  return config.type === 'SUPER_CUP'
}

/**
 * Validates and ensures the provided JSON has the correct structure for competition rules
 */
export function validateCompetitionRules(json: unknown): CompetitionRules {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid competition rules: must be an object')
  }

  const config = json as Record<string, any>

  if (!config.type) {
    throw new Error('Invalid competition rules: missing "type" field')
  }

  if (config.type === 'LEAGUES') {
    // Validate leagues-specific fields
    if (!config.competitionCategory || !Array.isArray(config.leagues)) {
      throw new Error('Invalid leagues rules: missing required fields')
    }
    return config as LeaguesRules
  }

  // Support both old 'CUP' type and new 'KEMPES_CUP' type
  if (config.type === 'CUP' || config.type === 'KEMPES_CUP') {
    // Validate kempesCup-specific fields
    if (
      typeof config.numGroups !== 'number' ||
      typeof config.teamsPerGroup !== 'number' ||
      typeof config.qualifyToGold !== 'number' ||
      typeof config.qualifyToSilver !== 'number'
    ) {
      throw new Error('Invalid kempesCup rules: missing required fields')
    }
    return config as KempesCupRules
  }

  if (config.type === 'CINDOR_CUP') {
    // Validate CindorCup-specific fields
    if (!Array.isArray(config.teamIds)) {
      throw new Error('Invalid CindorCup rules: missing teamIds array')
    }
    if (config.competitionCategory !== 'KEMPESITA') {
      throw new Error('Invalid CindorCup rules: category must be KEMPESITA')
    }
    return config as CindorCupRules
  }

  if (config.type === 'SUPER_CUP') {
    // Validate SuperCup-specific fields
    if (!Array.isArray(config.teamIds)) {
      throw new Error('Invalid SuperCup rules: missing teamIds array')
    }
    if (config.teamIds.length !== 6) {
      throw new Error('Invalid SuperCup rules: must have exactly 6 teams')
    }
    // No validar categoría - Supercopa es mixta (Mayores + Kempesitas)
    return config as SuperCupRules
  }

  throw new Error(`Unknown competition rules type: ${config.type}`)
}
