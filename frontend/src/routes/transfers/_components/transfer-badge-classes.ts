import type { TransferType, TransferStatus } from '@/types'

export const TYPE_BADGE_CLASSES: Record<TransferType, string> = {
  PURCHASE: 'bg-green-100 text-green-700 border-green-300',
  SALE: 'bg-blue-100 text-blue-700 border-blue-300',
  LOAN_IN: 'bg-purple-100 text-purple-700 border-purple-300',
  LOAN_OUT: 'bg-amber-100 text-amber-700 border-amber-300',
  AUCTION: 'bg-red-100 text-red-700 border-red-300',
  FREE_AGENT: 'bg-teal-100 text-teal-700 border-teal-300',
  INACTIVE_STATUS: 'bg-gray-100 text-gray-700 border-gray-300',
  RETURN_FROM_LOAN: 'bg-slate-100 text-slate-700 border-slate-300',
}

export const STATUS_BADGE_CLASSES: Record<TransferStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  ACTIVE: 'bg-green-100 text-green-700 border-green-300',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-700 border-orange-300',
}

export const TYPE_LABELS: Record<TransferType, string> = {
  PURCHASE: 'Compra',
  SALE: 'Venta',
  LOAN_IN: 'Préstamo (entrada)',
  LOAN_OUT: 'Préstamo (salida)',
  AUCTION: 'Subasta',
  FREE_AGENT: 'Agente libre',
  INACTIVE_STATUS: 'Inactivo',
  RETURN_FROM_LOAN: 'Retorno de préstamo',
}

export const STATUS_LABELS: Record<TransferStatus, string> = {
  PENDING: 'Pendiente',
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  PARTIALLY_PAID: 'Pago parcial',
}
