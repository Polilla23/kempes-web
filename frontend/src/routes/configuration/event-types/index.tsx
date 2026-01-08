import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { EventType } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { EventTypeService } from '@/services/event-type.service'
import { toast } from 'sonner'
import { DefaultHeader } from '@/components/table/table-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import CreateEventTypeForm from './create-form'
import EditEventTypeForm from './edit-form'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/configuration/event-types/')({
  component: EventTypeManagement,
})

function EventTypeManagement() {
  const { t } = useTranslation('eventTypes')
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchEventTypes = async () => {
    try {
      setIsLoadingEventTypes(true)
      const response = await EventTypeService.getEventTypes()
      console.log('Event types response:', response)
      setEventTypes(response.eventTypes || [])
    } catch (error) {
      console.error('Error fetching event types:', error)
      toast.error(error instanceof Error ? error.message : t('create.error'))
      setEventTypes([])
    } finally {
      setIsLoadingEventTypes(false)
    }
  }

  useEffect(() => {
    fetchEventTypes()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredEventTypes = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return eventTypes.filter((eventType) => {
      return (
        eventType.name.toLowerCase().includes(lowerCaseSearch) ||
        eventType.displayName.toLowerCase().includes(lowerCaseSearch) ||
        (eventType.icon?.toLowerCase() || '').includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, eventTypes])

  const handleDeleteEventType = async (eventTypeId: string) => {
    try {
      await EventTypeService.deleteEventType(eventTypeId)
      toast.success(t('delete.success'))
      fetchEventTypes() // Refresh the list
    } catch (error) {
      console.error('Error deleting event type:', error)
      toast.error(t('delete.error'))
    }
  }

  const handleEditClick = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedEventType(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<EventType>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('displayName', {
        header: (info) => <DefaultHeader info={info} name={t('fields.displayName')} type="string" />,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name={t('fields.name')} type="string" />,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('icon', {
        header: (info) => <DefaultHeader info={info} name={t('fields.icon')} type="string" />,
        cell: (info) => <span className="text-2xl">{info.getValue()}</span>,
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name={t('fields.active')} type="string" />,
        cell: (info) => (
          <span className={info.getValue() ? 'text-green-600' : 'text-red-600'}>
            {info.getValue() ? t('table.yes') : t('table.no')}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">{t('table.actions')}</span>,
        cell: ({ row }) => {
          const eventType = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(eventType)}>
                  <Pencil className="size-4" /> {t('edit.action')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeleteEventType(eventType.id)}>
                  <Trash2 className="size-4 text-destructive" /> {t('delete.action')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [t, isEditModalOpen]
  )

  if (isLoadingEventTypes) {
    return <ClubAndUserTableSkeleton rows={5} />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-3xl font-bold mb-10 mt-8 select-none">{t('title')}</h1>
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search" className="sr-only">
          {t('table.search')}
        </Label>
        <Input
          id="search"
          type="text"
          placeholder={`${t('table.search')}...`}
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateEventTypeForm onSuccess={fetchEventTypes} />
      </div>
      <DataTable<EventType, any> columns={columns} data={filteredEventTypes} />
      {selectedEventType && (
        <EditEventTypeForm
          eventType={selectedEventType}
          onSuccess={() => {
            fetchEventTypes()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default EventTypeManagement