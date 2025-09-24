// Functional hook to manage search functionality in a data table

import { useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

interface UseSearchProps<T> {
  data: T[]
  searchFields?: (keyof T)[] // Make optional
  columns?: ColumnDef<T, any>[] // Add columns option
}

export function useSearch<T>({ data, searchFields, columns }: UseSearchProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Extract searchable fields from columns if not provided
  const finalSearchFields = useMemo(() => {
    if (searchFields) return searchFields
    
    if (columns) {
      return columns
        .filter((col: any) => col.accessorKey && col.meta?.searchable !== false)
        .map((col: any) => col.accessorKey as keyof T)
    }
    
    return []
  }, [searchFields, columns])

  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return data

    const lowerSearch = debouncedSearch.toLowerCase()
    return data.filter((item) =>
      finalSearchFields.some((field) => {
        const value = item[field]
        return value?.toString().toLowerCase().includes(lowerSearch)
      })
    )
  }, [data, debouncedSearch, finalSearchFields])

  return { search, setSearch, filteredData, searchFields: finalSearchFields }
}
