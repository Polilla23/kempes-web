// A page for managing clubs, including listing, searching, creating, editing, and deleting clubs.

import type { Club } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { useEffect, useMemo } from 'react'
import { EditClubDialog } from './components/EditClubDialog'
import { useClubsServices } from './hooks/useClubsServices'
import { createClubColumns } from '../../utils/createColumns'
import { SearchInput } from '../../components/SearchInput'
import { useSearch } from '../../hooks/useSearch'
import { useClubActions } from './hooks/useClubActions'
import { CreateClubButton } from './components/CreateClubButton'
import { DataTableContainer } from '../../components/DataTableContainer'
import { useFormDialog } from '../../hooks/useFormDialog'
import { useManagementEvents } from '../../hooks/useManagementEvents'

export const Route = createFileRoute('/management/_entities/clubs/')({
  component: ClubManagement,
})

function ClubManagement() {
  const { handleDelete, handleEdit } = useClubActions()
  const { selectedItem: selectedClub } = useFormDialog<Club>()
  const { subscribe } = useManagementEvents()
  const { refetch } = useClubsServices()
  const { handleEditClose } = useClubActions()

  useEffect(() => {
    console.log('🎧 ClubManagement: Setting up event listener') // Debug

    const unsubscribe = subscribe((event) => {
      console.log('🎧 ClubManagement received event:', event) // Debug

      if (event.entity !== 'club') return

      switch (event.action) {
        case 'created':
          console.log('✅ Club created, refreshing data...')
          refetch()
          break

        case 'updated':
          console.log('✅ Club updated, refreshing data...')
          refetch()
          handleEditClose()
          break

        case 'deleted':
          console.log('✅ Club deleted, refreshing data...')
          refetch()
          break

        case 'dialog-close':
          console.log('❌ Dialog closed')
          // Let the dialog components handle their own closing
          break
      }
    })

    return () => {
      console.log('🔕 ClubManagement: Cleaning up event listener') // Debug
      unsubscribe()
    }
  }, [subscribe, refetch, handleEditClose])

  const columns = useMemo(
    () =>
      createClubColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  )

  const { clubs, availableUsers, isLoading } = useClubsServices()
  const { filteredData, search, setSearch } = useSearch({ data: clubs, columns })

  return (
    <DataTableContainer
      title="Clubs Management"
      isLoading={isLoading}
      searchBar={<SearchInput search={search} setSearch={setSearch} />}
      newEntityButton={<CreateClubButton availableUsers={availableUsers} />}
      dataTable={<DataTable<Club, any> columns={columns} data={filteredData} />}
      editForm={
        selectedClub && (
          <EditClubDialog
            key={selectedClub.id}
            club={selectedClub}
            availableUsers={availableUsers}
            isOpen={!!selectedClub}
          />
        )
      }
    />
  )
}

export default ClubManagement
