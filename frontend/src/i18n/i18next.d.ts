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
    }
  }
}
