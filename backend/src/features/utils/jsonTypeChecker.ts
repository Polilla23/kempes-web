import { CompetitionRules, KempesCupRules, LeaguesRules } from '@/types'

/**
 * Type guard for LeaguesRules
 */
export function isLeaguesRules(config: CompetitionRules): config is LeaguesRules {
  return config.type === 'LEAGUES'
}

/**
 * Type guard for KempesCupRules
 */
export function isKempesCupRules(config: CompetitionRules): config is KempesCupRules {
  return config.type === 'CUP'
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

  if (config.type === 'leagues') {
    // Validate leagues-specific fields
    if (!config.competitionCategory || !config.howManyLeagues || !Array.isArray(config.leagues)) {
      throw new Error('Invalid leagues rules: missing required fields')
    }
    return config as LeaguesRules
  }

  if (config.type === 'kempesCup') {
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

  throw new Error(`Unknown competition rules type: ${config.type}`)
}
