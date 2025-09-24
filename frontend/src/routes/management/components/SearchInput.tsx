import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface SearchInputProps {
  search: string
  setSearch: (value: string) => void
}

export function SearchInput({ search, setSearch }: SearchInputProps) {
  return (
    <>
      <Label htmlFor="search" className="sr-only select-none">
        Search
      </Label>
      <Input
        id="search"
        type="text"
        placeholder="Search..."
        className="pl-8 max-w-md w-full select-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
    </>
  )
}
