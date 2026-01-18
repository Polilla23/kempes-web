import type { HeaderContext } from '@tanstack/react-table'
import { ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp10 } from 'lucide-react'
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent } from '../ui/context-menu'
import { ContextMenuTrigger } from '@radix-ui/react-context-menu'

interface DefaultHeaderProps<T, TValue = unknown> {
  info: HeaderContext<T, TValue>
  name: string
  type?: 'string' | 'number' | 'boolean'
}

export function DefaultHeader<T, TValue = unknown>({ info, name, type }: DefaultHeaderProps<T, TValue>) {
  const sorted = info.column.getIsSorted()
  const isSorted = sorted !== false // Check if the column is sorted
  const { table } = info

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onPointerDown={(e) => {
          if (e.button === 0) {
            // 0 -> left click
            e.preventDefault()
            info.column.toggleSorting(sorted === 'asc')
          }
        }}
        className="flex w-full h-full items-center justify-center cursor-pointer select-none"
      >
        {name}
        {isSorted &&
          type &&
          type === 'string' &&
          (sorted === 'asc' ? (
            <ArrowDownAZ className="size-4 ml-2" />
          ) : (
            <ArrowUpZA className="size-4 ml-2" />
          ))}
        {isSorted &&
          type &&
          type === 'number' &&
          (sorted === 'asc' ? (
            <ArrowUp10 className="size-4 ml-2" />
          ) : (
            <ArrowDown01 className="size-4 ml-2" />
          ))}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <ContextMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={column.toggleVisibility}
            >
              {column.id}
            </ContextMenuCheckboxItem>
          ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
