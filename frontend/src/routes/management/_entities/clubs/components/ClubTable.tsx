import { DataTable } from '@/components/table/data-table'
import { createClubColumns } from '@/routes/management/utils/createColumns'
import type { Club } from '@/types'
import { useMemo } from 'react'

interface ClubsTableProps {
  clubs: Club[]
  onEdit: () => void
  onDelete: () => void
  columns?: any
}

export function ClubsTable({ clubs, onEdit, onDelete, columns }: ClubsTableProps) {
  const memoizedColumns = useMemo(() => createClubColumns({ onEdit, onDelete }), [onEdit, onDelete])

  return <DataTable columns={columns || memoizedColumns} data={clubs} />
}
