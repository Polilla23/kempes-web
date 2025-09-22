interface ManagementLayoutProps {
  table: React.ReactNode
  search: React.ReactNode
  createEntity: React.ReactNode
}

export function ManagementLayout({ table, search, createEntity }: ManagementLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-2xl font-bold mb-10 mt-8 select-none">Clubs Management</h1>
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        {search}
        {createEntity}
      </div>
      {table}
    </div>
  )
}
