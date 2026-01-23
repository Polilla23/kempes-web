import { PlayerPageContent } from "@/components/players/player-page-content"

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PlayerPageContent playerSlug={slug} />
}
