// src/routes/management/components/DataTableContainer.tsx
import { useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/components/table/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'

interface DataTableContainerProps<T> {
  title: string
  data: T[]
  columns: ColumnDef<T, any>[]
  searchPlaceholder?: string
  searchFields: (keyof T)[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export function DataTableContainer<T>({
  title,
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchFields,
  isLoading,
  actions,
}: DataTableContainerProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return data

    const lowerSearch = debouncedSearch.toLowerCase()
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        return value?.toString().toLowerCase().includes(lowerSearch)
      })
    )
  }, [data, debouncedSearch, searchFields])

  {
    isLoading && <ClubAndUserTableSkeleton />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4">
      <h1 className="text-2xl font-bold mb-10 mt-8">{title}</h1>

      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder={searchPlaceholder}
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        {actions}
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
