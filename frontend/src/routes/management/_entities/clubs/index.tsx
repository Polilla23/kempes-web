function ClubManagement() {
  // Data management
  const { clubs, isLoading, deleteClub, refetch } = useClubs()
  const { availableUsers } = useUsers()

  // Action management
  const { selectedClub, isEditOpen, handleEdit, handleEditClose, handleDelete } = useClubActions(deleteClub)

  // Event handlers
  const handleSuccess = () => {
    refetch()
    refetchUsers()
  }

  // Pure composition - no complex logic here
  return (
    <>
      <DataTableContainer
        title="Clubs Management"
        data={clubs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {selectedClub && (
        <EditClubDialog
          club={selectedClub}
          isOpen={isEditOpen}
          onClose={handleEditClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
