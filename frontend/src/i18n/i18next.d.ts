import 'i18next'

import common from './locales/en/common.json'
import navigation from './locales/en/navigation.json'
import auth from './locales/en/auth.json'
import users from './locales/en/users.json'
import clubs from './locales/en/clubs.json'
import players from './locales/en/players.json'
import eventTypes from './locales/en/event-types.json'
import competitionTypes from './locales/en/competition-types.json'
import seasons from './locales/en/seasons.json'
import salaryRates from './locales/en/salary-rates.json'
import fixtures from './locales/en/fixtures.json'
import home from './locales/en/home.json'
import bracketEditor from './locales/en/bracket-editor.json'
import news from './locales/en/news.json'
import submitResult from './locales/en/submit-result.json'
import transfers from './locales/en/transfers.json'
import finances from './locales/en/finances.json'
import standings from './locales/en/standings.json'
import seasonDeadlines from './locales/en/seasonDeadlines.json'
import dashboard from './locales/en/dashboard.json'
import editResults from './locales/en/edit-results.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      navigation: typeof navigation
      auth: typeof auth
      users: typeof users
      clubs: typeof clubs
      players: typeof players
      eventTypes: typeof eventTypes
      competitionTypes: typeof competitionTypes
      seasons: typeof seasons
      salaryRates: typeof salaryRates
      fixtures: typeof fixtures
      home: typeof home
      bracketEditor: typeof bracketEditor
      news: typeof news
      submitResult: typeof submitResult
      transfers: typeof transfers
      finances: typeof finances
      standings: typeof standings
      seasonDeadlines: typeof seasonDeadlines
      dashboard: typeof dashboard
      editResults: typeof editResults
    }
  }
}
