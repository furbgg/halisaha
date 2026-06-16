export interface Equipment {
  id: number
  name: string
  category: string
  quantity: number
  condition: string
  rentable: boolean
  rentalPricePerHour: number
  availableSizes?: string[]
}
