import type { TransferType } from '.'

// Paso del wizard (0-2) - Reducido de 5 a 3 pasos
export type TransferWizardStep = 0 | 1 | 2

// Tipos de transferencia disponibles en el wizard
export type TransferTypeOption =
  | 'PURCHASE' // Compra - el usuario está comprando
  | 'SALE' // Venta - el usuario está vendiendo
  | 'LOAN_IN' // Préstamo recibido
  | 'LOAN_OUT' // Préstamo cedido
  | 'AUCTION' // Subasta
  | 'FREE_AGENT' // Pase libre
  | 'INACTIVE_STATUS' // Inactivo

// Período de la temporada
export type SeasonPeriod = 'START' | 'MID' | 'END'

// Rol del usuario en la transferencia
export type UserTransferRole = 'SELLER' | 'BUYER'

// Configuración de una cuota
export interface InstallmentConfig {
  id: string // ID temporal para UI
  installmentNumber: number
  amount: number
  period: SeasonPeriod
  seasonNumber: number
  dueSeasonHalfId?: string // Para compatibilidad con backend
  dueSeasonHalfLabel?: string // Para mostrar: "Final T30"
}

// Configuración de pago de un jugador
export interface PlayerPaymentConfig {
  playerId: string
  playerName: string
  playerPosition?: string
  overall: number | null
  salary: number
  isKempesita: boolean
  valuationAmount: number
  paymentType: 'SINGLE' | 'INSTALLMENTS'
  numberOfInstallments: number
  installments: InstallmentConfig[]
}

// Detalles de préstamo
export interface LoanDetails {
  durationHalves: number // 1-8 medias temporadas
  loanFee: number
  salaryPercentage: number // 0-100, qué porcentaje paga el club receptor
}

// Estado completo del wizard (3 pasos)
export interface TransferWizardState {
  currentStep: TransferWizardStep

  // Paso 1: Tipo de transferencia + Equipos
  transferType: TransferTypeOption | null
  userRole: UserTransferRole | null
  sellerClubId: string | null
  sellerClubName: string | null
  sellerClubLogo: string | null
  buyerClubId: string | null
  buyerClubName: string | null
  buyerClubLogo: string | null

  // Paso 2: Detalles (jugadores y pagos)
  selectedPeriod: SeasonPeriod
  activeSeasonNumber: number | null
  playersToSell: PlayerPaymentConfig[] // Jugadores del vendedor
  playersAsPayment: PlayerPaymentConfig[] // Jugadores del comprador como pago

  // Campos específicos de préstamo
  loanDetails: LoanDetails | null

  // Paso 3: Resumen y confirmación
  notes: string

  // Metadata
  isValid: boolean
}

// Estado del Centro de Transferencias
export interface TransferCenterState {
  activeTab: 'new' | 'pending' | 'history'
  userClubId: string | null
  userClubName: string | null
  userClubLogo: string | null
}

// Opciones de media temporada para vencimientos (compatibilidad)
export interface SeasonHalfOption {
  id: string
  label: string // Ej: "T7 - 1ra mitad"
  seasonNumber: number
  halfType: 'FIRST_HALF' | 'SECOND_HALF'
}

// Props comunes para componentes del wizard
export interface WizardStepProps {
  wizardState: TransferWizardState
  onUpdate: React.Dispatch<React.SetStateAction<TransferWizardState>>
  onNext: () => void
  onBack?: () => void
}

// Configuración de tipo de transferencia para UI
export interface TransferTypeConfig {
  type: TransferTypeOption
  titleKey: string
  descriptionKey: string
  icon: string
  color: string // Color para el card
  userRole: UserTransferRole // Rol del usuario según el tipo
  requiresOtherClub: boolean
  hasLoanDetails: boolean
}

// Constantes de configuración de tipos
export const TRANSFER_TYPE_CONFIGS: Record<TransferTypeOption, TransferTypeConfig> = {
  PURCHASE: {
    type: 'PURCHASE',
    titleKey: 'typeCards.purchase.title',
    descriptionKey: 'typeCards.purchase.description',
    icon: 'ShoppingCart',
    color: 'green',
    userRole: 'BUYER',
    requiresOtherClub: true,
    hasLoanDetails: false,
  },
  SALE: {
    type: 'SALE',
    titleKey: 'typeCards.sale.title',
    descriptionKey: 'typeCards.sale.description',
    icon: 'DollarSign',
    color: 'blue',
    userRole: 'SELLER',
    requiresOtherClub: true,
    hasLoanDetails: false,
  },
  LOAN_IN: {
    type: 'LOAN_IN',
    titleKey: 'typeCards.loanIn.title',
    descriptionKey: 'typeCards.loanIn.description',
    icon: 'ArrowDownLeft',
    color: 'purple',
    userRole: 'BUYER',
    requiresOtherClub: true,
    hasLoanDetails: true,
  },
  LOAN_OUT: {
    type: 'LOAN_OUT',
    titleKey: 'typeCards.loanOut.title',
    descriptionKey: 'typeCards.loanOut.description',
    icon: 'ArrowUpRight',
    color: 'amber',
    userRole: 'SELLER',
    requiresOtherClub: true,
    hasLoanDetails: true,
  },
  AUCTION: {
    type: 'AUCTION',
    titleKey: 'typeCards.auction.title',
    descriptionKey: 'typeCards.auction.description',
    icon: 'Gavel',
    color: 'red',
    userRole: 'BUYER',
    requiresOtherClub: true,
    hasLoanDetails: false,
  },
  FREE_AGENT: {
    type: 'FREE_AGENT',
    titleKey: 'typeCards.freeAgent.title',
    descriptionKey: 'typeCards.freeAgent.description',
    icon: 'UserPlus',
    color: 'teal',
    userRole: 'BUYER',
    requiresOtherClub: false, // No hay otro club
    hasLoanDetails: false,
  },
  INACTIVE_STATUS: {
    type: 'INACTIVE_STATUS',
    titleKey: 'typeCards.inactive.title',
    descriptionKey: 'typeCards.inactive.description',
    icon: 'UserX',
    color: 'gray',
    userRole: 'SELLER',
    requiresOtherClub: false, // No hay otro club
    hasLoanDetails: false,
  },
}

// Colores por tipo de transferencia
export const TRANSFER_TYPE_COLORS: Record<string, string> = {
  green: 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200',
  blue: 'bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200',
  purple: 'bg-purple-100 border-purple-400 text-purple-700 hover:bg-purple-200',
  amber: 'bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-200',
  red: 'bg-red-100 border-red-400 text-red-700 hover:bg-red-200',
  teal: 'bg-teal-100 border-teal-400 text-teal-700 hover:bg-teal-200',
  gray: 'bg-gray-100 border-gray-400 text-gray-700 hover:bg-gray-200',
}

// Constantes
export const MAX_INSTALLMENTS = 6
export const MIN_INSTALLMENTS = 1
export const MAX_LOAN_DURATION_HALVES = 8

// Estado inicial del wizard
export const INITIAL_WIZARD_STATE: TransferWizardState = {
  currentStep: 0,
  transferType: null,
  userRole: null,
  sellerClubId: null,
  sellerClubName: null,
  sellerClubLogo: null,
  buyerClubId: null,
  buyerClubName: null,
  buyerClubLogo: null,
  selectedPeriod: 'END',
  activeSeasonNumber: null,
  playersToSell: [],
  playersAsPayment: [],
  loanDetails: null,
  notes: '',
  isValid: false,
}

// Helper para generar cuotas correlativas
export function generateCorrelativeInstallments(
  totalAmount: number,
  numberOfInstallments: number,
  startPeriod: SeasonPeriod,
  startSeasonNumber: number
): InstallmentConfig[] {
  const installments: InstallmentConfig[] = []
  const amountPerInstallment = Math.floor(totalAmount / numberOfInstallments)
  const remainder = totalAmount - amountPerInstallment * numberOfInstallments

  const periods: SeasonPeriod[] = ['START', 'MID', 'END']
  let currentPeriodIndex = periods.indexOf(startPeriod)
  let currentSeason = startSeasonNumber

  for (let i = 0; i < numberOfInstallments; i++) {
    installments.push({
      id: crypto.randomUUID(),
      installmentNumber: i + 1,
      amount: amountPerInstallment + (i === 0 ? remainder : 0),
      period: periods[currentPeriodIndex],
      seasonNumber: currentSeason,
      dueSeasonHalfLabel: `${periods[currentPeriodIndex] === 'START' ? 'Inicio' : periods[currentPeriodIndex] === 'MID' ? 'Mitad' : 'Final'} T${currentSeason}`,
    })

    // Avanzar al siguiente período
    currentPeriodIndex++
    if (currentPeriodIndex >= periods.length) {
      currentPeriodIndex = 0
      currentSeason++
    }
  }

  return installments
}

// Helper para calcular el balance
export function calculateBalance(
  playersToSell: PlayerPaymentConfig[],
  playersAsPayment: PlayerPaymentConfig[]
): { selling: number; receiving: number; balance: number } {
  const selling = playersToSell.reduce((sum, p) => sum + p.valuationAmount, 0)
  const receiving = playersAsPayment.reduce((sum, p) => sum + p.valuationAmount, 0)
  return {
    selling,
    receiving,
    balance: selling - receiving,
  }
}
