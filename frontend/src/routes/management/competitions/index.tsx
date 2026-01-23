import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompetitionsTab } from './_components/competitions-tab'
import { CompetitionTypesTab } from './_components/competition-types-tab'
import CompetitionService, { type Competition } from '@/services/competition.service'
import { CompetitionTypeService, type CompetitionType } from '@/services/competition-type.service'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'

export const Route = createFileRoute('/management/competitions/')({
  component: CompetitionsManagement,
})

function CompetitionsManagement() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCompetitions = async () => {
    try {
      const response = await CompetitionService.getCompetitions()
      setCompetitions(response.data || [])
    } catch (error) {
      console.error('Error fetching competitions:', error)
      toast.error('Error loading competitions')
      setCompetitions([])
    }
  }

  const fetchCompetitionTypes = async () => {
    try {
      const response = await CompetitionTypeService.getCompetitionTypes()
      setCompetitionTypes(response.competitionTypes || [])
    } catch (error) {
      console.error('Error fetching competition types:', error)
      toast.error('Error loading competition types')
      setCompetitionTypes([])
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchCompetitions(), fetchCompetitionTypes()])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
        <h1 className="text-2xl font-bold mb-6 mt-8 select-none">Competitions Management</h1>

        <Tabs defaultValue="competitions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="types">Competition Types</TabsTrigger>
          </TabsList>

          <TabsContent value="competitions">
            <CompetitionsTab
              competitions={competitions}
              competitionTypes={competitionTypes}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="types">
            <CompetitionTypesTab
              competitionTypes={competitionTypes}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default CompetitionsManagement
