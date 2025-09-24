// A reusable container component for Management Data Tables, create and edit forms.
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'

interface DataTableContainerProps {
  title: string
  isLoading?: boolean
  searchBar?: React.ReactNode
  newEntityButton?: React.ReactNode
  dataTable?: React.ReactNode
  editForm?: React.ReactNode
}

export function DataTableContainer({
  title,
  isLoading,
  searchBar,
  newEntityButton,
  dataTable,
  editForm,
}: DataTableContainerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
        <h1 className="text-2xl font-bold mb-10 mt-8">{title}</h1>
        <ClubAndUserTableSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
      <h1 className="text-2xl font-bold mb-10 mt-8">{title}</h1>

      <div className="flex justify-between gap-3 mb-4 w-full relative">
        {searchBar}
        {newEntityButton}
      </div>

      {dataTable}
      {editForm}
    </div>
  )
}
