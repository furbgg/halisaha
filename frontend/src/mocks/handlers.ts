import { http, HttpResponse } from 'msw'
import {
  MOCK_FIELDS,
  MOCK_EQUIPMENT,
  MOCK_STAFF,
  MOCK_SETTINGS,
  MOCK_DASHBOARD,
  MOCK_NOTIFICATIONS,
  MOCK_CONTACT_MESSAGES,
  MOCK_AUDIT_LOGS,
  getReservationStore,
  addReservation,
  updateReservation,
  generateCode,
  generateSlots,
} from './data'

const ok = <T>(data: T, message = 'OK') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
})

const paginate = <T>(items: T[], page = 0, size = 20) => ({
  content: items.slice(page * size, page * size + size),
  totalElements: items.length,
  totalPages: Math.ceil(items.length / size),
  number: page,
  size,
})

let notificationStore = MOCK_NOTIFICATIONS.map(n => ({ ...n }))
let contactStore = MOCK_CONTACT_MESSAGES.map(m => ({ ...m }))
let settingsStore = MOCK_SETTINGS.map(s => ({ ...s }))
let equipmentStore = MOCK_EQUIPMENT.map(e => ({ ...e }))
let staffStore = MOCK_STAFF.map(s => ({ ...s }))
let equipmentIdCounter = 10
let staffIdCounter = 10

export const handlers = [
  /* ─── Auth ─── */
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as any
    if (!body?.email) {
      return HttpResponse.json({ success: false, message: 'E-Mail fehlt.', data: null, timestamp: new Date().toISOString() }, { status: 400 })
    }
    const isAdmin = body.email === 'admin@demo.com' || body.email?.includes('admin')
    return HttpResponse.json(ok({
      accessToken: 'demo_access_token_' + Date.now(),
      displayId: 'USR-001',
      name: isAdmin ? 'Demo Admin' : 'Demo Nutzer',
      email: body.email,
      role: isAdmin ? 'ADMIN' : 'USER',
      totpRequired: false,
    }))
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(ok({
      accessToken: 'demo_access_token_' + Date.now(),
      displayId: 'USR-002',
      name: body?.name || 'Neuer Nutzer',
      email: body?.email || '',
      role: 'USER',
      totpRequired: false,
    }))
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({ success: false, message: 'Session abgelaufen.', data: null, timestamp: new Date().toISOString() }, { status: 401 })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(ok(null, 'Abgemeldet.'))
  }),

  http.get('/api/auth/2fa/setup', () => {
    return HttpResponse.json(ok({
      secret: 'JBSWY3DPEHPK3PXP',
      qrCodeUri: 'otpauth://totp/HaliSaha:admin@demo.com?secret=JBSWY3DPEHPK3PXP&issuer=HaliSaha',
    }))
  }),

  http.post('/api/auth/2fa/verify', () => {
    return HttpResponse.json(ok(null, '2FA aktiviert.'))
  }),

  http.delete('/api/auth/2fa', () => {
    return HttpResponse.json(ok(null, '2FA deaktiviert.'))
  }),

  /* ─── Public Settings ─── */
  http.get('/api/settings/happy-hour', () => {
    const enabled = settingsStore.find(s => s.key === 'happy_hour_enabled')?.value === 'true'
    return HttpResponse.json(ok({
      enabled,
      startTime: settingsStore.find(s => s.key === 'happy_hour_start')?.value || '14:00',
      endTime: settingsStore.find(s => s.key === 'happy_hour_end')?.value || '16:00',
      discountPercent: Number(settingsStore.find(s => s.key === 'happy_hour_discount')?.value || 20),
    }))
  }),

  http.get('/api/settings/public', () => {
    const pub: Record<string, string> = {}
    for (const s of settingsStore) {
      if (s.key.startsWith('price_')) pub[s.key] = s.value
    }
    return HttpResponse.json(ok(pub))
  }),

  /* ─── Fields ─── */
  http.get('/api/fields', () => {
    return HttpResponse.json(ok(MOCK_FIELDS))
  }),

  http.get('/api/fields/:id', ({ params }) => {
    const field = MOCK_FIELDS.find(f => f.id === Number(params.id))
    if (!field) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    return HttpResponse.json(ok(field))
  }),

  http.get('/api/fields/:id/availability', ({ params, request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const duration = Number(url.searchParams.get('duration') || 60)
    const fieldId = Number(params.id)
    const field = MOCK_FIELDS.find(f => f.id === fieldId)
    if (!field) return HttpResponse.json({ success: false, message: 'Saha bulunamadı.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    return HttpResponse.json(ok({
      fieldId,
      fieldName: field.name,
      date,
      durationMinutes: duration,
      slots: generateSlots(fieldId, date, duration),
    }))
  }),

  /* ─── Equipment ─── */
  http.get('/api/equipment/rentable', () => {
    return HttpResponse.json(ok(equipmentStore.filter(e => e.rentable)))
  }),

  http.get('/api/equipment/:id/availability', () => {
    return HttpResponse.json(ok({ available: true, availableQuantity: 10 }))
  }),

  /* ─── Reservations ─── */
  http.post('/api/reservations/hold', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(ok({
      sessionId: body?.sessionId || 'sess_' + Date.now(),
      expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
    }))
  }),

  http.delete('/api/reservations/hold/:sessionId', () => {
    return HttpResponse.json(ok(null, 'Reservierung freigegeben.'))
  }),

  http.post('/api/reservations', async ({ request }) => {
    const body = (await request.json()) as any
    const field = MOCK_FIELDS.find(f => f.id === body?.fieldId) || MOCK_FIELDS[0]
    const code = generateCode()
    const startTime = body?.startTime || new Date().toISOString()
    const duration = body?.durationMinutes || 60
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString()
    const pricePerHour = field.hourlyPrice
    const totalPrice = Math.round((duration / 60) * pricePerHour * 100) / 100

    const reservation = addReservation({
      confirmationCode: code,
      fieldId: field.id,
      fieldName: field.name,
      gameType: body?.gameType || field.supportedSports[0] || 'FOOTBALL',
      customerName: body?.guestName || 'Gast',
      customerPhone: body?.guestPhone || '',
      customerEmail: body?.guestEmail || '',
      manageToken: 'tok_' + code,
      startTime,
      endTime,
      durationMinutes: duration,
      totalPrice,
      status: 'CONFIRMED',
      paymentStatus: body?.paymentMethod === 'ON_SITE' ? 'ON_SITE' : 'PENDING',
      paymentMethod: body?.paymentMethod || 'ON_SITE',
      createdAt: new Date().toISOString(),
      equipmentRentals: (body?.equipmentRentals || []).map((r: any) => {
        const eq = equipmentStore.find(e => e.id === r.equipmentId)
        return { equipmentName: eq?.name || 'Equipment', quantity: r.quantity, size: r.size || '', price: (eq?.rentalPricePerHour || 0) * (duration / 60) }
      }),
    })

    return HttpResponse.json(ok(reservation, 'Buchung erfolgreich erstellt.'), { status: 201 })
  }),

  http.get('/api/reservations/:code', ({ params }) => {
    const code = params.code as string
    const reservation = getReservationStore().find(r => r.confirmationCode === code || r.manageToken === code)
    if (!reservation) {
      return HttpResponse.json({ success: false, message: 'Buchung nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    }
    return HttpResponse.json(ok(reservation))
  }),

  http.put('/api/reservations/:code', async ({ params, request }) => {
    const code = params.code as string
    const body = (await request.json()) as any
    const reservation = getReservationStore().find(r => r.confirmationCode === code)
    if (!reservation) {
      return HttpResponse.json({ success: false, message: 'Buchung nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    }
    const duration = body?.durationMinutes || reservation.durationMinutes
    const startTime = body?.startTime || reservation.startTime
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString()
    const updated = updateReservation(code, { startTime, endTime, durationMinutes: duration, status: 'MODIFIED' })
    return HttpResponse.json(ok(updated, 'Buchung geändert.'))
  }),

  http.delete('/api/reservations/:code', ({ params }) => {
    const code = params.code as string
    const reservation = getReservationStore().find(r => r.confirmationCode === code)
    if (!reservation) {
      return HttpResponse.json({ success: false, message: 'Buchung nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    }
    const updated = updateReservation(code, { status: 'CANCELLED', paymentStatus: 'REFUNDED' })
    return HttpResponse.json(ok(updated, 'Buchung storniert.'))
  }),

  /* ─── Coupons ─── */
  http.post('/api/coupons/validate', async ({ request }) => {
    const body = (await request.json()) as any
    if (body?.code === 'DEMO10') {
      return HttpResponse.json(ok({ code: 'DEMO10', discountType: 'PERCENT', discountValue: 10, discountAmount: 8 }))
    }
    return HttpResponse.json({ success: false, message: 'Ungültiger Gutscheincode.', data: null, timestamp: new Date().toISOString() }, { status: 400 })
  }),

  /* ─── Payments ─── */
  http.post('/api/payments/create-intent', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(ok({
      clientSecret: 'demo_pi_secret_' + Date.now(),
      reservationId: body?.reservationId || 999,
      amount: 8000,
    }))
  }),

  http.post('/api/payments/admin/:id/refund', ({ params, request }) => {
    const url = new URL(request.url)
    const amount = url.searchParams.get('amount') || '0'
    return HttpResponse.json(ok({ refundedAmount: Number(amount) }, 'Rückerstattung erfolgreich.'))
  }),

  /* ─── Contact ─── */
  http.post('/api/contact', async () => {
    return HttpResponse.json(ok({ id: Date.now(), status: 'NEW' }, 'Nachricht gesendet.'), { status: 201 })
  }),

  http.get('/api/admin/contact/count', () => {
    return HttpResponse.json(ok(contactStore.filter(m => m.status === 'NEW').length))
  }),

  http.get('/api/admin/contact', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const filtered = status ? contactStore.filter(m => m.status === status) : contactStore
    return HttpResponse.json(ok(filtered))
  }),

  http.get('/api/admin/contact/:id', ({ params }) => {
    const msg = contactStore.find(m => m.id === Number(params.id))
    if (!msg) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    return HttpResponse.json(ok(msg))
  }),

  http.patch('/api/admin/contact/:id/replied', ({ params }) => {
    const idx = contactStore.findIndex(m => m.id === Number(params.id))
    if (idx !== -1) { contactStore[idx] = { ...contactStore[idx], status: 'REPLIED', repliedAt: new Date().toISOString() } }
    return HttpResponse.json(ok(contactStore[idx]))
  }),

  http.patch('/api/admin/contact/:id/archive', ({ params }) => {
    const idx = contactStore.findIndex(m => m.id === Number(params.id))
    if (idx !== -1) { contactStore[idx] = { ...contactStore[idx], status: 'ARCHIVED' } }
    return HttpResponse.json(ok(contactStore[idx]))
  }),

  http.patch('/api/admin/contact/:id/notes', async ({ params, request }) => {
    const body = (await request.json()) as any
    const idx = contactStore.findIndex(m => m.id === Number(params.id))
    if (idx !== -1) { contactStore[idx] = { ...contactStore[idx], adminNotes: body?.notes || '' } }
    return HttpResponse.json(ok(contactStore[idx]))
  }),

  /* ─── Admin Dashboard ─── */
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json(ok(MOCK_DASHBOARD))
  }),

  /* ─── Admin Reservations ─── */
  http.get('/api/admin/reservations/stats', () => {
    const store = getReservationStore()
    return HttpResponse.json(ok({
      totalReservations: 168,
      prevMonthTotal: 142,
      changePercent: 18.3,
      cancelledCount: 8,
      cancelRate: 4.8,
      prevCancelRate: 6.1,
      popularTimeSlot: '19:00–20:00',
      monthRevenue: 15360,
      revenueProjection: 17200,
      revenueChangePercent: 11.9,
      weeklyBookings: [
        { label: 'Mo', count: 6 }, { label: 'Di', count: 4 }, { label: 'Mi', count: 7 },
        { label: 'Do', count: 8 }, { label: 'Fr', count: 9 }, { label: 'Sa', count: 11 }, { label: 'So', count: 3 },
      ],
      monthlyBookings: Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), count: Math.floor(Math.random() * 8) + 2 })),
      fieldUtilization: [
        { fieldId: 1, fieldName: 'Platz 1', bookedHours: 114, totalHours: 168, percent: 68, prevPercent: 61 },
        { fieldId: 2, fieldName: 'Platz 2', bookedHours: 105, totalHours: 168, percent: 63, prevPercent: 58 },
        { fieldId: 3, fieldName: 'Platz 3', bookedHours: 135, totalHours: 168, percent: 80, prevPercent: 72 },
        { fieldId: 4, fieldName: 'Platz 4', bookedHours: 93, totalHours: 168, percent: 55, prevPercent: 51 },
        { fieldId: 5, fieldName: 'Bubble Arena', bookedHours: 48, totalHours: 120, percent: 40, prevPercent: 35 },
      ],
    }))
  }),

  http.get('/api/admin/reservations/today', () => {
    const today = new Date().toISOString().split('T')[0]
    const todays = getReservationStore().filter(r => r.startTime?.startsWith(today))
    return HttpResponse.json(ok(todays))
  }),

  http.get('/api/admin/reservations/:id', ({ params }) => {
    const reservation = getReservationStore().find(r => r.id === Number(params.id))
    if (!reservation) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    return HttpResponse.json(ok(reservation))
  }),

  http.get('/api/admin/reservations', ({ request }) => {
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    let store = getReservationStore()
    if (from) store = store.filter(r => r.startTime >= from)
    if (to) store = store.filter(r => r.startTime <= to)
    return HttpResponse.json(ok(store))
  }),

  http.put('/api/admin/reservations/:id', async ({ params, request }) => {
    const body = (await request.json()) as any
    const reservation = getReservationStore().find(r => r.id === Number(params.id))
    if (!reservation) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    const duration = body?.durationMinutes || reservation.durationMinutes
    const startTime = body?.startTime || reservation.startTime
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString()
    const updated = updateReservation(reservation.confirmationCode, { startTime, endTime, durationMinutes: duration, status: 'MODIFIED' })
    return HttpResponse.json(ok(updated))
  }),

  http.delete('/api/admin/reservations/:id', ({ params }) => {
    const reservation = getReservationStore().find(r => r.id === Number(params.id))
    if (!reservation) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    const updated = updateReservation(reservation.confirmationCode, { status: 'CANCELLED', paymentStatus: 'REFUNDED' })
    return HttpResponse.json(ok(updated))
  }),

  /* ─── Admin Equipment ─── */
  http.get('/api/admin/equipment', () => {
    return HttpResponse.json(ok(equipmentStore))
  }),

  http.post('/api/admin/equipment', async ({ request }) => {
    const body = (await request.json()) as any
    equipmentIdCounter++
    const newItem = { id: equipmentIdCounter, condition: 'GOOD', rentable: false, rentalPricePerHour: 0, availableSizes: [], ...body }
    equipmentStore.push(newItem)
    return HttpResponse.json(ok(newItem), { status: 201 })
  }),

  http.put('/api/admin/equipment/:id', async ({ params, request }) => {
    const body = (await request.json()) as any
    const idx = equipmentStore.findIndex(e => e.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    equipmentStore[idx] = { ...equipmentStore[idx], ...body }
    return HttpResponse.json(ok(equipmentStore[idx]))
  }),

  http.delete('/api/admin/equipment/:id', ({ params }) => {
    const idx = equipmentStore.findIndex(e => e.id === Number(params.id))
    if (idx !== -1) equipmentStore.splice(idx, 1)
    return HttpResponse.json(ok(null, 'Gelöscht.'))
  }),

  /* ─── Admin Staff ─── */
  http.get('/api/admin/staff', () => {
    return HttpResponse.json(ok(staffStore))
  }),

  http.post('/api/admin/staff', async ({ request }) => {
    const body = (await request.json()) as any
    staffIdCounter++
    const newStaff = { id: staffIdCounter, active: true, createdAt: new Date().toISOString(), role: 'STAFF', ...body }
    staffStore.push(newStaff)
    return HttpResponse.json(ok(newStaff), { status: 201 })
  }),

  http.put('/api/admin/staff/:id', async ({ params, request }) => {
    const body = (await request.json()) as any
    const idx = staffStore.findIndex(s => s.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ success: false, message: 'Nicht gefunden.', data: null, timestamp: new Date().toISOString() }, { status: 404 })
    staffStore[idx] = { ...staffStore[idx], ...body }
    return HttpResponse.json(ok(staffStore[idx]))
  }),

  http.delete('/api/admin/staff/:id', ({ params }) => {
    const idx = staffStore.findIndex(s => s.id === Number(params.id))
    if (idx !== -1) staffStore.splice(idx, 1)
    return HttpResponse.json(ok(null, 'Gelöscht.'))
  }),

  /* ─── Admin Settings ─── */
  http.get('/api/admin/settings', () => {
    return HttpResponse.json(ok(settingsStore))
  }),

  http.put('/api/admin/settings/:key', async ({ params, request }) => {
    const body = (await request.json()) as any
    const idx = settingsStore.findIndex(s => s.key === params.key)
    if (idx !== -1) {
      settingsStore[idx] = { ...settingsStore[idx], value: body?.value ?? '', updatedAt: new Date().toISOString() }
    } else {
      settingsStore.push({ key: params.key as string, value: body?.value ?? '', description: null, updatedAt: new Date().toISOString() })
    }
    return HttpResponse.json(ok(settingsStore.find(s => s.key === params.key)))
  }),

  /* ─── Admin Notifications ─── */
  http.get('/api/admin/notifications/stats', () => {
    return HttpResponse.json(ok({ unread: notificationStore.filter(n => !n.read).length, total: notificationStore.length }))
  }),

  http.get('/api/admin/notifications', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || 0)
    const size = Number(url.searchParams.get('size') || 20)
    return HttpResponse.json(ok(paginate(notificationStore, page, size)))
  }),

  http.put('/api/admin/notifications/read-all', () => {
    notificationStore = notificationStore.map(n => ({ ...n, read: true }))
    return HttpResponse.json(ok(null, 'Alle gelesen.'))
  }),

  http.put('/api/admin/notifications/:id/read', ({ params }) => {
    const idx = notificationStore.findIndex(n => n.id === Number(params.id))
    if (idx !== -1) notificationStore[idx] = { ...notificationStore[idx], read: true }
    return HttpResponse.json(ok(notificationStore[idx]))
  }),

  /* ─── Admin Audit Logs ─── */
  http.get('/api/admin/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || 0)
    const size = Number(url.searchParams.get('size') || 20)
    return HttpResponse.json(ok(paginate(MOCK_AUDIT_LOGS, page, size)))
  }),
]
