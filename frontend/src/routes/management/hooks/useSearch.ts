// Functional hook to manage search functionality in a data table

import { useEffect, useMemo, useState } from 'react'

interface UseSearchProps<T> {
  data: T[]
  searchFields: (keyof T)[]
}

export function useSearch<T>({ data, searchFields }: UseSearchProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

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
  return { search, setSearch, filteredData }
}
