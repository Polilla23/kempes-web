// Contains functions to define:
// - Column configurations
// - Cell renderers
// - Action column setup

import type { Club, Player, User } from '@/types'
import { createColumnHelper } from '@tanstack/react-table'
import ActionsDropdown from '../components/ActionDropdown'
import { DefaultHeader } from '@/components/table/table-header'
import { Checkbox } from '@/components/ui/checkbox'

interface ColumnsProps {
  onEdit: (data: any) => void
  onDelete: (id: string) => void
}

// Shared cell renderers
export const CellRenderers = {
  checkbox: (checked: boolean) => (
    <div className="pl-5">
      <Checkbox className="cursor-default pointer-events-none" checked={checked} disabled />
    </div>
  ),

  clubName: (club: Club | null | undefined) => <span>{club?.name || 'No club'}</span>,

  logo: (logo: string | undefined) =>
    logo ? (
      <img src={logo} alt="Logo" className="size-5 rounded" />
    ) : (
      <span className="text-gray-500">No logo</span>
    ),

  currency: (amount: number) =>
    amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),

  date: (date: string) => new Date(date).toLocaleDateString('en-GB'),

  actions: (data: Club | Player | User, onEdit: () => void, onDelete: (id: string) => void) => (
    <ActionsDropdown data={data} onEdit={onEdit} onDelete={onDelete} />
  ),
}

// Club columns
export function createClubColumns({ onEdit, onDelete }: ColumnsProps) {
  const columnHelper = createColumnHelper<Club>()
  return [
    columnHelper.accessor('name', {
      header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('logo', {
      header: (info) => <DefaultHeader info={info} name="Logo" type="string" />,
      cell: (info) => CellRenderers.logo(info.getValue()),
    }),
    columnHelper.accessor('user', {
      header: (info) => <DefaultHeader info={info} name="Owner" type="string" />,
      cell: ({ row }) => {
        const user: User | null | undefined = row.getValue('user')
        const name = user?.email || 'No owner'
        return <span>{name}</span>
      },
    }),
    columnHelper.accessor('isActive', {
      header: (info) => <DefaultHeader info={info} name="Active" type="boolean" />,
      cell: ({ row }) => CellRenderers.checkbox(row.original.isActive),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-center">Actions</span>,
      cell: ({ row }) =>
        CellRenderers.actions(
          row.original,
          () => onEdit(row.original),
          () => onDelete(row.original.id)
        ),
    }),
  ]
}

// User columns
export function createUserColumns({ onEdit, onDelete }: ColumnsProps) {
  const columnHelper = createColumnHelper<User>()
  return [
    columnHelper.accessor('email', {
      header: (info) => <DefaultHeader info={info} name="Email" type="string" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: (info) => <DefaultHeader info={info} name="Role" type="string" />,
      cell: (info) => <span className="capitalize">{info.getValue().toLowerCase()}</span>,
    }),
    columnHelper.accessor('isVerified', {
      header: (info) => <DefaultHeader info={info} name="Verified" type="boolean" />,
      cell: ({ row }) => CellRenderers.checkbox(row.original.isVerified),
    }),
    columnHelper.accessor('club', {
      header: (info) => <DefaultHeader info={info} name="Club" type="string" />,
      cell: ({ row }) => CellRenderers.clubName(row.getValue('club')),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-center">Actions</span>,
      cell: ({ row }) =>
        CellRenderers.actions(
          row.original,
          () => onEdit(row.original),
          () => onDelete(row.original.id)
        ),
    }),
  ]
}

// Player columns
export function createPlayerColumns({ onEdit, onDelete }: ColumnsProps) {
  const columnHelper = createColumnHelper<Player>()
  return [
    columnHelper.accessor('name', {
      header: (info) => <DefaultHeader info={info} name="First Name" type="string" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('lastName', {
      header: (info) => <DefaultHeader info={info} name="Last Name" type="string" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('birthdate', {
      header: (info) => <DefaultHeader info={info} name="Birthdate" type="string" />,
      cell: (info) => CellRenderers.date(info.getValue()),
    }),
    columnHelper.accessor('overall', {
      header: (info) => <DefaultHeader info={info} name="Overall" type="number" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('salary', {
      header: (info) => <DefaultHeader info={info} name="Salary" type="number" />,
      cell: (info) => CellRenderers.currency(info.getValue()),
    }),
    columnHelper.accessor('ownerClub', {
      header: (info) => <DefaultHeader info={info} name="Owner Club" type="string" />,
      cell: ({ row }) => CellRenderers.clubName(row.getValue('ownerClub')),
    }),
    columnHelper.accessor('actualClub', {
      header: (info) => <DefaultHeader info={info} name="Actual Club" type="string" />,
      cell: ({ row }) => CellRenderers.clubName(row.getValue('actualClub')),
    }),
    columnHelper.accessor('sofifaId', {
      header: (info) => <DefaultHeader info={info} name="Sofifa ID" type="string" />,
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('transfermarktId', {
      header: (info) => <DefaultHeader info={info} name="Transfermarkt ID" type="string" />,
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-center">Actions</span>,
      cell: ({ row }) =>
        CellRenderers.actions(
          row.original,
          () => onEdit(row.original),
          () => onDelete(row.original.id)
        ),
    }),
  ]
}

export const ColumnCreators = {
  clubs: createClubColumns,
  users: createUserColumns,
  players: createPlayerColumns,
} as const
