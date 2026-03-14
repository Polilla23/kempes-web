import { createFileRoute } from '@tanstack/react-router'
import PlayerRatingsPage from './_components/player-ratings-page'

export const Route = createFileRoute('/management/player-ratings/')({
  component: PlayerRatingsPage,
})
