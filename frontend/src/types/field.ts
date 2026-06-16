export type FieldType = 'REGULAR' | 'BUBBLE'

export interface Field {
  id: number
  name: string
  type: FieldType
  hourlyPrice: number
  allowedDurations: number[]
  active: boolean
  openingTime: string
  closingTime: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  held: boolean
}

export interface FieldAvailability {
  fieldId: number
  fieldName: string
  date: string
  durationMinutes: number
  slots: TimeSlot[]
}
