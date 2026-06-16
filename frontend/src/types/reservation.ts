export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED' | 'NO_SHOW'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'ON_SITE'
export type PaymentMethod = 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'ON_SITE'

export interface Reservation {
  id: number
  confirmationCode: string
  fieldId: number
  fieldName: string
  fieldType: string
  customerName: string
  customerPhone: string
  customerEmail: string
  manageToken?: string | null
  startTime: string
  endTime: string
  durationMinutes: number
  totalPrice: number
  status: ReservationStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  createdAt: string
  equipmentRentals?: EquipmentRental[]
}

export interface CreateReservationRequest {
  fieldId: number
  startTime: string
  durationMinutes: number
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  privacyAccepted: boolean
  notificationConsent?: boolean
  equipmentRentals?: { equipmentId: number; quantity: number; size?: string }[]
  sessionId?: string
}

export interface ModifyReservationRequest {
  startTime: string
  durationMinutes: number
}

export interface EquipmentRental {
  equipmentName: string
  quantity: number
  size?: string
  price: number
}

export interface SlotHoldRequest {
  fieldId: number
  startTime: string
  durationMinutes: number
  sessionId: string
}
