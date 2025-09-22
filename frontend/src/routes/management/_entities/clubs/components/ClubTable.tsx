import { DataTable } from '@/components/table/data-table'
import { createClubColumns } from '@/routes/management/utils/createColumns'
import type { Club } from '@/types'
import { useMemo } from 'react'

interface ClubsTableProps {
  clubs: Club[]
  onEdit: () => void
  onDelete: () => void
  isLoading?: boolean
}

export function ClubsTable({ clubs, onEdit, onDelete, isLoading }: ClubsTableProps) {
  const columns = useMemo(() => createClubColumns({ onEdit, onDelete }), [onEdit, onDelete])

  return <DataTable columns={columns} data={clubs} />
}
