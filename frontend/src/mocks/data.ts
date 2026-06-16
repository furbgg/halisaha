/* ─── Static mock data for demo mode ─── */

export const MOCK_FIELDS = [
  {
    id: 1,
    name: 'Platz 1',
    supportedSports: ['FOOTBALL'],
    type: 'REGULAR',
    hourlyPrice: 80,
    allowedDurations: [60, 90, 120],
    active: true,
    openingTime: '08:00',
    closingTime: '23:00',
  },
  {
    id: 2,
    name: 'Platz 2',
    supportedSports: ['FOOTBALL'],
    type: 'REGULAR',
    hourlyPrice: 80,
    allowedDurations: [60, 90, 120],
    active: true,
    openingTime: '08:00',
    closingTime: '23:00',
  },
  {
    id: 3,
    name: 'Platz 3',
    supportedSports: ['FOOTBALL'],
    type: 'REGULAR',
    hourlyPrice: 100,
    allowedDurations: [60, 90, 120],
    active: true,
    openingTime: '08:00',
    closingTime: '23:00',
  },
  {
    id: 4,
    name: 'Platz 4',
    supportedSports: ['FOOTBALL'],
    type: 'REGULAR',
    hourlyPrice: 100,
    allowedDurations: [60, 90, 120],
    active: true,
    openingTime: '08:00',
    closingTime: '23:00',
  },
  {
    id: 5,
    name: 'Bubble Arena',
    supportedSports: ['BUBBLE_SOCCER'],
    type: 'BUBBLE',
    hourlyPrice: 160,
    allowedDurations: [60, 90],
    active: true,
    openingTime: '10:00',
    closingTime: '22:00',
  },
]

export const MOCK_EQUIPMENT = [
  {
    id: 1,
    name: 'Krampon',
    category: 'FOOTWEAR',
    quantity: 20,
    condition: 'GOOD',
    rentable: true,
    rentalPricePerHour: 3,
    availableSizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
  },
  {
    id: 2,
    name: 'Leibchen Set (10 Stk.)',
    category: 'APPAREL',
    quantity: 10,
    condition: 'GOOD',
    rentable: true,
    rentalPricePerHour: 5,
    availableSizes: [],
  },
  {
    id: 3,
    name: 'Fußball (Match)',
    category: 'BALL',
    quantity: 8,
    condition: 'GOOD',
    rentable: true,
    rentalPricePerHour: 2,
    availableSizes: [],
  },
  {
    id: 4,
    name: 'Hütchen Set',
    category: 'TRAINING',
    quantity: 6,
    condition: 'GOOD',
    rentable: true,
    rentalPricePerHour: 1,
    availableSizes: [],
  },
  {
    id: 5,
    name: 'Torpfosten (Mini)',
    category: 'EQUIPMENT',
    quantity: 4,
    condition: 'GOOD',
    rentable: false,
    rentalPricePerHour: 0,
    availableSizes: [],
  },
]

export const MOCK_STAFF = [
  {
    id: 1,
    name: 'Mustafa Demir',
    email: 'mustafa@demo.com',
    phone: '+43 660 111 2222',
    role: 'MANAGER',
    active: true,
    createdAt: '2025-01-15T09:00:00',
  },
  {
    id: 2,
    name: 'Emre Yılmaz',
    email: 'emre@demo.com',
    phone: '+43 660 333 4444',
    role: 'STAFF',
    active: true,
    createdAt: '2025-03-01T09:00:00',
  },
]

export const MOCK_SETTINGS = [
  { key: 'happy_hour_enabled', value: 'true', description: 'Happy Hour aktiv/inaktiv', updatedAt: '2025-01-01T00:00:00' },
  { key: 'happy_hour_start', value: '14:00', description: 'Happy Hour Startzeit', updatedAt: '2025-01-01T00:00:00' },
  { key: 'happy_hour_end', value: '16:00', description: 'Happy Hour Endzeit', updatedAt: '2025-01-01T00:00:00' },
  { key: 'happy_hour_discount', value: '20', description: 'Rabatt in %', updatedAt: '2025-01-01T00:00:00' },
  { key: 'slot_hold_minutes', value: '5', description: 'Slot-Reservierungsdauer (Minuten)', updatedAt: '2025-01-01T00:00:00' },
  { key: 'price_football', value: '80', description: 'Preis Fußball pro Stunde (EUR)', updatedAt: '2025-01-01T00:00:00' },
  { key: 'price_bubble_soccer', value: '160', description: 'Preis Bubble Soccer pro Stunde (EUR)', updatedAt: '2025-01-01T00:00:00' },
  { key: 'cancellation_deadline_hours', value: '2', description: 'Stornierungsfrist (Stunden)', updatedAt: '2025-01-01T00:00:00' },
  { key: 'max_booking_days_ahead', value: '90', description: 'Max. Vorlaufzeit für Buchungen (Tage)', updatedAt: '2025-01-01T00:00:00' },
  { key: 'maintenance_mode', value: 'false', description: 'Wartungsmodus', updatedAt: '2025-01-01T00:00:00' },
]

export const MOCK_DASHBOARD = {
  todayReservations: 7,
  yesterdayReservations: 9,
  todayRevenue: 620,
  lastBookingAgo: 'vor 23 Minuten',
  weekReservations: 42,
  weekRevenue: 3840,
  monthReservations: 168,
  monthRevenue: 15360,
  utilizationPercent: 71,
  refundedAmount: 240,
  refundedCount: 3,
  failedPaymentCount: 1,
  fieldStats: [
    { fieldId: 1, fieldName: 'Platz 1', reservationCount: 38, revenue: 3040 },
    { fieldId: 2, fieldName: 'Platz 2', reservationCount: 35, revenue: 2800 },
    { fieldId: 3, fieldName: 'Platz 3', reservationCount: 45, revenue: 4500 },
    { fieldId: 4, fieldName: 'Platz 4', reservationCount: 31, revenue: 3100 },
    { fieldId: 5, fieldName: 'Bubble Arena', reservationCount: 19, revenue: 1920 },
  ],
  upcomingReservations: [
    { id: 101, confirmationCode: 'XK7M9P', fieldName: 'Platz 1', customerName: 'Max Mustermann', startTime: todayAt('18:00'), endTime: todayAt('19:00'), durationMinutes: 60 },
    { id: 102, confirmationCode: 'AB3CD5', fieldName: 'Platz 3', customerName: 'Jonas Weber', startTime: todayAt('19:00'), endTime: todayAt('20:30'), durationMinutes: 90 },
    { id: 103, confirmationCode: 'PQ2RS8', fieldName: 'Platz 2', customerName: 'Ali Öztürk', startTime: todayAt('20:00'), endTime: todayAt('21:00'), durationMinutes: 60 },
    { id: 104, confirmationCode: 'LM6NO1', fieldName: 'Bubble Arena', customerName: 'Team Spaß GmbH', startTime: todayAt('21:00'), endTime: todayAt('22:00'), durationMinutes: 60 },
  ],
  todayTimeline: [
    { fieldName: 'Platz 1', customerName: 'S. Kaya', startTime: todayAt('08:00'), endTime: todayAt('09:00'), status: 'COMPLETED' },
    { fieldName: 'Platz 2', customerName: 'FC Rapid Wien', startTime: todayAt('10:00'), endTime: todayAt('12:00'), status: 'COMPLETED' },
    { fieldName: 'Platz 3', customerName: 'T. Maier', startTime: todayAt('12:00'), endTime: todayAt('13:00'), status: 'COMPLETED' },
    { fieldName: 'Platz 1', customerName: 'Max Mustermann', startTime: todayAt('18:00'), endTime: todayAt('19:00'), status: 'CONFIRMED' },
    { fieldName: 'Platz 3', customerName: 'Jonas Weber', startTime: todayAt('19:00'), endTime: todayAt('20:30'), status: 'CONFIRMED' },
    { fieldName: 'Platz 2', customerName: 'Ali Öztürk', startTime: todayAt('20:00'), endTime: todayAt('21:00'), status: 'CONFIRMED' },
    { fieldName: 'Bubble Arena', customerName: 'Team Spaß GmbH', startTime: todayAt('21:00'), endTime: todayAt('22:00'), status: 'CONFIRMED' },
  ],
  weeklyRevenue: buildWeeklyRevenue(),
  paymentMethodStats: [
    { method: 'CARD', count: 28, percentage: 67 },
    { method: 'ON_SITE', count: 10, percentage: 24 },
    { method: 'GOOGLE_PAY', count: 3, percentage: 7 },
    { method: 'APPLE_PAY', count: 1, percentage: 2 },
  ],
  topMaterials: [
    { name: 'Krampon', rentalCount: 44, maxRentals: 80 },
    { name: 'Leibchen Set', rentalCount: 31, maxRentals: 40 },
    { name: 'Fußball (Match)', rentalCount: 18, maxRentals: 32 },
    { name: 'Hütchen Set', rentalCount: 9, maxRentals: 24 },
  ],
  monthlyTrend: buildMonthlyTrend(),
  hourlyHeatmap: buildHeatmap(),
  insights: {
    analyzedMonth: 'Mai 2026',
    totalReservations: 168,
    fieldInsights: [
      {
        fieldId: 1,
        fieldName: 'Platz 1',
        totalBookings: 38,
        weakestDays: [{ dayName: 'Dienstag', bookingCount: 3, avgOtherDays: 7 }],
        weakestSlots: [{ dayName: 'Dienstag', timeRange: '10:00–12:00', bookingCount: 1 }],
      },
    ],
  },
}

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'NEW_RESERVATION',
    title: 'Neue Buchung',
    message: 'Max Mustermann hat Platz 1 für heute 18:00 Uhr gebucht.',
    read: false,
    createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
  },
  {
    id: 2,
    type: 'PAYMENT_RECEIVED',
    title: 'Zahlung eingegangen',
    message: 'Zahlung von 80 € für Buchung XK7M9P bestätigt.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 3,
    type: 'CANCELLATION',
    title: 'Stornierung',
    message: 'Jonas Weber hat seine Buchung AB3CD5 storniert.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
]

export const MOCK_CONTACT_MESSAGES = [
  {
    id: 1,
    name: 'Sabine Huber',
    email: 'sabine.huber@example.com',
    phone: '+43 699 1234567',
    subject: 'Gruppenrabatt anfragen',
    message: 'Hallo, wir sind eine Gruppe von 20 Personen und würden gerne wissen, ob es Gruppenrabatte für regelmäßige Buchungen gibt.',
    status: 'NEW',
    adminNotes: null,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    readAt: null,
    repliedAt: null,
  },
  {
    id: 2,
    name: 'Kemal Arslan',
    email: 'kemal@example.com',
    phone: null,
    subject: 'Turnierorganisation',
    message: 'Ich möchte ein kleines Turnier für 8 Teams organisieren. Wäre das möglich?',
    status: 'REPLIED',
    adminNotes: 'Angeboten: Alle 4 Plätze + Bubble Arena für ganzen Tag. Angebot gesendet.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    readAt: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    repliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
]

/* ─── Helper functions ─── */

function todayAt(time: string): string {
  const today = new Date().toISOString().split('T')[0]
  return `${today}T${time}:00`
}

function buildWeeklyRevenue() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const revenues = [480, 320, 560, 640, 720, 880, 240]
  return days.map((dayLabel, i) => ({ dayLabel, revenue: revenues[i] }))
}

function buildMonthlyTrend() {
  const months = ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
  const revenues = [8200, 7600, 9100, 10200, 11400, 9800, 8900, 10100, 11600, 13200, 14800, 15360]
  return months.map((monthLabel, i) => ({ monthLabel, revenue: revenues[i] }))
}

function buildHeatmap() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const cells = []
  for (const dayOfWeek of days) {
    for (const timeSlot of times) {
      const hour = parseInt(timeSlot)
      const isWeekend = dayOfWeek === 'Sa' || dayOfWeek === 'So'
      const isEvening = hour >= 18
      let intensity = 0.2
      if (isEvening) intensity = isWeekend ? 1.0 : 0.85
      else if (hour >= 14) intensity = isWeekend ? 0.8 : 0.6
      else if (hour >= 10) intensity = isWeekend ? 0.7 : 0.4
      cells.push({ dayOfWeek, timeSlot, intensity: Math.min(1, intensity + (Math.random() * 0.1)) })
    }
  }
  return cells
}

export const MOCK_AUDIT_LOGS = [
  { id: 1, action: 'RESERVATION_CREATED', entityType: 'Reservation', entityId: '101', performedBy: 'max@example.com', details: 'Platz 1, 18:00', createdAt: new Date(Date.now() - 23 * 60000).toISOString() },
  { id: 2, action: 'PAYMENT_RECEIVED', entityType: 'Payment', entityId: '201', performedBy: 'System', details: '80 EUR, CARD', createdAt: new Date(Date.now() - 24 * 60000).toISOString() },
  { id: 3, action: 'RESERVATION_CANCELLED', entityType: 'Reservation', entityId: '99', performedBy: 'admin@demo.com', details: 'Platz 2, storniert', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 4, action: 'REFUND_ISSUED', entityType: 'Payment', entityId: '199', performedBy: 'admin@demo.com', details: '80 EUR rückerstattet', createdAt: new Date(Date.now() - 2.1 * 3600000).toISOString() },
  { id: 5, action: 'SETTING_UPDATED', entityType: 'Setting', entityId: 'happy_hour_enabled', performedBy: 'admin@demo.com', details: 'false → true', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
]

let reservationIdCounter = 200
const reservationStore: any[] = [
  {
    id: 101, confirmationCode: 'XK7M9P', fieldId: 1, fieldName: 'Platz 1', gameType: 'FOOTBALL',
    customerName: 'Max Mustermann', customerPhone: '+43 660 1234567', customerEmail: 'max@example.com',
    manageToken: 'tok_XK7M9P',
    startTime: todayAt('18:00'), endTime: todayAt('19:00'), durationMinutes: 60,
    totalPrice: 80, status: 'CONFIRMED', paymentStatus: 'PAID', paymentMethod: 'CARD',
    createdAt: new Date(Date.now() - 23 * 60000).toISOString(), equipmentRentals: [],
  },
  {
    id: 102, confirmationCode: 'AB3CD5', fieldId: 3, fieldName: 'Platz 3', gameType: 'FOOTBALL',
    customerName: 'Jonas Weber', customerPhone: '+43 676 9876543', customerEmail: 'jonas@example.com',
    manageToken: 'tok_AB3CD5',
    startTime: todayAt('19:00'), endTime: todayAt('20:30'), durationMinutes: 90,
    totalPrice: 150, status: 'CONFIRMED', paymentStatus: 'ON_SITE', paymentMethod: 'ON_SITE',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), equipmentRentals: [],
  },
  {
    id: 103, confirmationCode: 'PQ2RS8', fieldId: 2, fieldName: 'Platz 2', gameType: 'FOOTBALL',
    customerName: 'Ali Öztürk', customerPhone: '+43 699 5556677', customerEmail: 'ali@example.com',
    manageToken: 'tok_PQ2RS8',
    startTime: todayAt('20:00'), endTime: todayAt('21:00'), durationMinutes: 60,
    totalPrice: 80, status: 'CONFIRMED', paymentStatus: 'PAID', paymentMethod: 'GOOGLE_PAY',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), equipmentRentals: [],
  },
  {
    id: 104, confirmationCode: 'LM6NO1', fieldId: 5, fieldName: 'Bubble Arena', gameType: 'BUBBLE_SOCCER',
    customerName: 'Team Spaß GmbH', customerPhone: '+43 1 234 56789', customerEmail: 'team@spass.at',
    manageToken: 'tok_LM6NO1',
    startTime: todayAt('21:00'), endTime: todayAt('22:00'), durationMinutes: 60,
    totalPrice: 160, status: 'CONFIRMED', paymentStatus: 'PAID', paymentMethod: 'CARD',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), equipmentRentals: [],
  },
]

export function getReservationStore() {
  return reservationStore
}

export function addReservation(r: any) {
  reservationIdCounter++
  const newR = { ...r, id: reservationIdCounter }
  reservationStore.push(newR)
  return newR
}

export function updateReservation(code: string, updates: any) {
  const idx = reservationStore.findIndex(r => r.confirmationCode === code || String(r.id) === String(code))
  if (idx === -1) return null
  reservationStore[idx] = { ...reservationStore[idx], ...updates }
  return reservationStore[idx]
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function generateSlots(fieldId: number, date: string, durationMinutes: number) {
  const field = MOCK_FIELDS.find(f => f.id === fieldId)
  if (!field) return []

  const [openH, openM] = field.openingTime.split(':').map(Number)
  const [closeH, closeM] = field.closingTime.split(':').map(Number)
  const openMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM

  const now = new Date()
  const nowDate = now.toISOString().split('T')[0]
  const isToday = date === nowDate
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const bookedTimes = reservationStore
    .filter(r => r.fieldId === fieldId && r.status !== 'CANCELLED' && r.startTime.startsWith(date))
    .map(r => r.startTime.substring(11, 16))

  const slots = []
  let startMin = openMin

  while (startMin + durationMinutes <= closeMin) {
    const endMin = startMin + durationMinutes
    const sH = String(Math.floor(startMin / 60)).padStart(2, '0')
    const sM = String(startMin % 60).padStart(2, '0')
    const eH = String(Math.floor(endMin / 60)).padStart(2, '0')
    const eM = String(endMin % 60).padStart(2, '0')

    const startTime = `${date}T${sH}:${sM}:00`
    const endTime = `${date}T${eH}:${eM}:00`
    const timeStr = `${sH}:${sM}`

    let available = true
    let held = false

    if (isToday && startMin <= nowMinutes + 30) {
      available = false
    } else if (bookedTimes.includes(timeStr)) {
      available = false
    } else {
      const seed = `${fieldId}-${date}-${sH}${sM}`
      const hash = Math.abs(seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 17))
      const hour = Math.floor(startMin / 60)
      const threshold = hour >= 18 ? 3 : hour >= 14 ? 2 : 1
      available = hash % 10 >= threshold
    }

    slots.push({ startTime, endTime, available, held })
    startMin += 30
  }

  return slots
}
