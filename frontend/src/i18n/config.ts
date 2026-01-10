import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import English translations
import enCommon from './locales/en/common.json'
import enNavigation from './locales/en/navigation.json'
import enAuth from './locales/en/auth.json'
import enUsers from './locales/en/users.json'
import enClubs from './locales/en/clubs.json'
import enPlayers from './locales/en/players.json'
import enEventTypes from './locales/en/event-types.json'
import enCompetitionTypes from './locales/en/competition-types.json'
import enSeasons from './locales/en/seasons.json'
import enSalaryRates from './locales/en/salary-rates.json'
import enFixtures from './locales/en/fixtures.json'

// Import Spanish translations
import esCommon from './locales/es/common.json'
import esNavigation from './locales/es/navigation.json'
import esAuth from './locales/es/auth.json'
import esUsers from './locales/es/users.json'
import esClubs from './locales/es/clubs.json'
import esPlayers from './locales/es/players.json'
import esEventTypes from './locales/es/event-types.json'
import esCompetitionTypes from './locales/es/competition-types.json'
import esSeasons from './locales/es/seasons.json'
import esSalaryRates from './locales/es/salary-rates.json'
import esFixtures from './locales/es/fixtures.json'

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Available languages
    resources: {
      en: {
        common: enCommon,
        navigation: enNavigation,
        auth: enAuth,
        users: enUsers,
        clubs: enClubs,
        players: enPlayers,
        eventTypes: enEventTypes,
        competitionTypes: enCompetitionTypes,
        seasons: enSeasons,
        salaryRates: enSalaryRates,
        fixtures: enFixtures,
      },
      es: {
        common: esCommon,
        navigation: esNavigation,
        auth: esAuth,
        users: esUsers,
        clubs: esClubs,
        players: esPlayers,
        eventTypes: esEventTypes,
        competitionTypes: esCompetitionTypes,
        seasons: esSeasons,
        salaryRates: esSalaryRates,
        fixtures: esFixtures,
      },
    },

    // Fallback language if translation is missing
    fallbackLng: 'en',

    // Supported languages
    supportedLngs: ['en', 'es'],

    // Default namespace
    defaultNS: 'common',

    // Namespaces to load
    ns: [
      'common',
      'navigation',
      'auth',
      'users',
      'clubs',
      'players',
      'eventTypes',
      'competitionTypes',
      'seasons',
      'salaryRates',
      'fixtures',
    ],

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Cache user language preference
      caches: ['localStorage'],

      // localStorage key name
      lookupLocalStorage: 'i18nextLng',
    },

    // Debug mode (set to false in production)
    debug: false,
  })

export default i18n
