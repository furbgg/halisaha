const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminRes = {
  title: 'Reservierungen',
  errorTitle: 'Reservierungen — Fehler',
  loadError: 'Fehler beim Laden',
  retry: 'Erneut versuchen',
  headerTitle: 'Alle Reservierungen',
  headerDesc: 'Verwalten Sie alle Buchungen, Stornierungen und Anfragen an einem Ort.',
  export: 'Exportieren',
  newBooking: 'Neue Buchung',

  filters: { all: 'Alle', today: 'Heute', tomorrow: 'Morgen', week: 'Diese Woche', cancelled: 'Storniert' },
  status: { confirmed: 'Bestätigt', modified: 'Geändert', completed: 'Abgeschlossen', cancelled: 'Storniert', noShow: 'No-Show' },
  payment: { pending: 'Ausstehend', paid: 'Bezahlt', failed: 'Fehlgeschlagen', refunded: 'Erstattet', onSite: 'Vor Ort' },
  duration: { m60: '1 Stunde', m90: '1,5 Stunden', m120: '2 Stunden', m150: '2,5 Stunden', m180: '3 Stunden', min: 'Min.' },
  
  csvHeader: 'Buchungs-ID;Datum;Uhrzeit;Kunde;Telefon;Platz;Dauer (Min.);Status;Preis',

  stats: {
    total: 'Gesamt Reservierungen',
    vsPrevMonth: 'vs. Vormonat',
    cancelRate: 'Stornierungsrate',
    popularTime: 'Beliebteste Zeit',
    primetime: 'Primetime Auslastung',
    revenueProg: 'Umsatz Prognose',
    target: 'Ziel'
  },
  charts: {
    bookingTrends: 'Buchungstrends',
    resPeriod: 'Reservierungen im laufenden Zeitraum',
    week: 'Woche',
    month: 'Monat',
    occCompare: 'Auslastungs-Vergleich',
    bookedHours: 'Std. gebucht',
    vsPrevWeek: 'vs. Vorwoche',
    noFields: 'Keine Felder'
  },
  search: {
    placeholder: 'Nach ID, Name oder Telefon suchen...',
    foundText: 'gefunden',
    booking: 'Buchung',
    bookings: 'Buchungen'
  },
  table: {
    id: 'Buchungs-ID',
    date: 'Datum & Zeit',
    customer: 'Kunde',
    field: 'Platz',
    duration: 'Dauer',
    status: 'Status',
    payment: 'Zahlung',
    price: 'Preis',
    actions: 'Aktionen',
    noResults: 'Keine Reservierungen gefunden',
    showing: 'Zeige',
    of: 'von',
    page: 'Seite'
  },
  modals: {
    cancelTitle: 'Reservierung stornieren?',
    cancelDesc: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    booking: 'Buchung:',
    customer: 'Kunde:',
    period: 'Zeitraum:',
    field: 'Platz:',
    cancelBtn: 'Abbrechen',
    cancelAction: 'Stornieren',
    
    refundTitle: 'Betrag erstatten?',
    refundDesc: 'Der Betrag wird über Stripe zurückerstattet.',
    paymentLabel: 'Zahlung:',
    refundAmount: 'Erstattungsbetrag:',
    refundAction: 'Erstatten'
  },
  newBookingModal: {
    title: 'Neue Buchung erstellen',
    desc: 'Manuelle Buchungseingabe',
    successTitle: 'Buchung erstellt!',
    successDesc: 'Wird gespeichert...',
    customerData: 'Kundendaten',
    customerName: 'Name des Kunden *',
    email: 'E-Mail Adresse',
    phone: 'Telefonnummer',
    fieldDetails: 'Platz & Details',
    fieldSelect: 'Platz-Auswahl',
    dateSelect: 'Datum wählen',
    durationLabel: 'Dauer',
    timeSelect: 'Startzeit wählen',
    chooseDateFirst: 'Bitte zuerst ein Datum wählen',
    loadingAvail: 'Verfügbarkeit wird geladen...',
    noSlots: 'Keine freien Zeiten an diesem Tag',
    paymentTitle: 'Bezahlung',
    onSiteLabel: 'Bezahlung: Vor Ort',
    onSiteDesc: 'Der Kunde zahlt Bar oder mit Karte direkt am Counter.',
    estPrice: 'Geschätzter Preis',
    fillRequired: 'Bitte alle Pflichtfelder ausfüllen.',
    saveBooking: 'Buchung Speichern',
    saveError: 'Buchung konnte nicht erstellt werden.'
  },
  details: {
    title: 'Buchungsdetails',
    emailLabel: 'E-Mail',
    endLabel: 'Ende',
    priceLabel: 'Preis',
    paymentStatusLabel: 'Zahlungsstatus',
    paymentMethodLabel: 'Zahlungsmethode',
    card: 'Karte',
    apple: 'Apple Pay',
    google: 'Google Pay',
    rentalsTitle: 'Gemietetes Material',
    created: 'Erstellt:'
  }
};

tr.adminRes = {
  title: 'Rezervasyonlar',
  errorTitle: 'Rezervasyonlar — Hata',
  loadError: 'Yükleme Hatası',
  retry: 'Tekrar Dene',
  headerTitle: 'Tüm Rezervasyonlar',
  headerDesc: 'Tüm rezervasyonları, iptalleri ve talepleri tek bir yerden yönetin.',
  export: 'Dışa Aktar',
  newBooking: 'Yeni Rezervasyon',

  filters: { all: 'Tümü', today: 'Bugün', tomorrow: 'Yarın', week: 'Bu Hafta', cancelled: 'İptal Edilen' },
  status: { confirmed: 'Onaylandı', modified: 'Değiştirildi', completed: 'Tamamlandı', cancelled: 'İptal Edildi', noShow: 'Gelmedi' },
  payment: { pending: 'Bekliyor', paid: 'Ödendi', failed: 'Başarısız', refunded: 'İade Edildi', onSite: 'Yerinde' },
  duration: { m60: '1 Saat', m90: '1,5 Saat', m120: '2 Saat', m150: '2,5 Saat', m180: '3 Saat', min: 'Dk.' },
  
  csvHeader: 'Rezervasyon ID;Tarih;Saat;Müşteri;Telefon;Saha;Süre (Dk.);Durum;Fiyat',

  stats: {
    total: 'Toplam Rezervasyon',
    vsPrevMonth: 'Önceki aya göre',
    cancelRate: 'İptal Oranı',
    popularTime: 'En Popüler Saat',
    primetime: 'Prime Time Doluluk',
    revenueProg: 'Gelir Tahmini',
    target: 'Hedef'
  },
  charts: {
    bookingTrends: 'Rezervasyon Trendleri',
    resPeriod: 'Geçerli döneme ait rezervasyonlar',
    week: 'Hafta',
    month: 'Ay',
    occCompare: 'Doluluk Karşılaştırması',
    bookedHours: 'Saat Rezerve',
    vsPrevWeek: 'Önceki haftaya göre',
    noFields: 'Saha Yok'
  },
  search: {
    placeholder: 'ID, İsim veya Telefon ile ara...',
    foundText: 'bulundu',
    booking: 'Rezervasyon',
    bookings: 'Rezervasyonlar'
  },
  table: {
    id: 'Rezervasyon ID',
    date: 'Tarih & Saat',
    customer: 'Müşteri',
    field: 'Saha',
    duration: 'Süre',
    status: 'Durum',
    payment: 'Ödeme',
    price: 'Fiyat',
    actions: 'İşlemler',
    noResults: 'Rezervasyon bulunamadı',
    showing: 'Gösteriliyor',
    of: '/',
    page: 'Sayfa'
  },
  modals: {
    cancelTitle: 'Rezervasyonu İptal Et?',
    cancelDesc: 'Bu işlem geri alınamaz.',
    booking: 'Rezervasyon:',
    customer: 'Müşteri:',
    period: 'Dönem:',
    field: 'Saha:',
    cancelBtn: 'İptal',
    cancelAction: 'İptal Et',
    
    refundTitle: 'Ücreti İade Et?',
    refundDesc: 'Tutar Stripe üzerinden iade edilecektir.',
    paymentLabel: 'Ödeme:',
    refundAmount: 'İade Tutarı:',
    refundAction: 'İade Et'
  },
  newBookingModal: {
    title: 'Yeni Rezervasyon Oluştur',
    desc: 'Manuel Rezervasyon Girişi',
    successTitle: 'Rezervasyon Oluşturuldu!',
    successDesc: 'Kaydediliyor...',
    customerData: 'Müşteri Verileri',
    customerName: 'Müşteri Adı *',
    email: 'E-Posta Adresi',
    phone: 'Telefon Numarası',
    fieldDetails: 'Saha & Detaylar',
    fieldSelect: 'Saha Seçimi',
    dateSelect: 'Tarih Seç',
    durationLabel: 'Süre',
    timeSelect: 'Başlangıç Saati Seç',
    chooseDateFirst: 'Lütfen önce bir tarih seçin',
    loadingAvail: 'Uygunluk yükleniyor...',
    noSlots: 'Bu gün için boş saat yok',
    paymentTitle: 'Ödeme',
    onSiteLabel: 'Ödeme: Yerinde',
    onSiteDesc: 'Müşteri nakit veya kartla doğrudan resepsiyonda öder.',
    estPrice: 'Tahmini Fiyat',
    fillRequired: 'Lütfen tüm zorunlu alanları doldurun.',
    saveBooking: 'Rezervasyonu Kaydet',
    saveError: 'Rezervasyon oluşturulamadı.'
  },
  details: {
    title: 'Rezervasyon Detayları',
    emailLabel: 'E-Posta',
    endLabel: 'Bitiş',
    priceLabel: 'Fiyat',
    paymentStatusLabel: 'Ödeme Durumu',
    paymentMethodLabel: 'Ödeme Yöntemi',
    card: 'Kart',
    apple: 'Apple Pay',
    google: 'Google Pay',
    rentalsTitle: 'Kiralanan Ekipman',
    created: 'Oluşturulma:'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

// Add useTranslation
txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, `import { pageTitle } from '../../config/brand';\nimport { useTranslation, Trans } from 'react-i18next';`);

txt = txt.replace(/export function AdminReservierungen\(\) \{/, `export function AdminReservierungen() {\n  const { t } = useTranslation();`);

// Apply t() replacements to txt...
txt = txt.replace(/const filterTabs: \{ key: FilterKey; label: string \}\[\] = \[.*?\];/s, `const getFilterTabs = (t: any) => [
  { key: 'all', label: t('adminRes.filters.all', 'Alle') },
  { key: 'today', label: t('adminRes.filters.today', 'Heute') },
  { key: 'tomorrow', label: t('adminRes.filters.tomorrow', 'Morgen') },
  { key: 'week', label: t('adminRes.filters.week', 'Diese Woche') },
  { key: 'cancelled', label: t('adminRes.filters.cancelled', 'Storniert') },
];`);

txt = txt.replace(/const statusConfig:.*?\};/s, `const getStatusConfig = (t: any): Record<ReservationStatus, { label: string; dot: string; bg: string; text: string; border: string }> => ({
  CONFIRMED: { label: t('adminRes.status.confirmed', 'Bestätigt'), dot: 'bg-primary animate-pulse', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  MODIFIED: { label: t('adminRes.status.modified', 'Geändert'), dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  COMPLETED: { label: t('adminRes.status.completed', 'Abgeschlossen'), dot: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  CANCELLED: { label: t('adminRes.status.cancelled', 'Storniert'), dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  NO_SHOW: { label: t('adminRes.status.noShow', 'No-Show'), dot: 'bg-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
});`);

txt = txt.replace(/const paymentStatusLabels:.*?\};/s, `const getPaymentStatusLabels = (t: any): Record<string, string> => ({
  PENDING: t('adminRes.payment.pending', 'Ausstehend'),
  PAID: t('adminRes.payment.paid', 'Bezahlt'),
  FAILED: t('adminRes.payment.failed', 'Fehlgeschlagen'),
  REFUNDED: t('adminRes.payment.refunded', 'Erstattet'),
  ON_SITE: t('adminRes.payment.onSite', 'Vor Ort'),
});`);

txt = txt.replace(/const durationLabels:.*?\};/s, `const getDurationLabels = (t: any): Record<number, string> => ({
  60: t('adminRes.duration.m60', '1 Stunde'),
  90: t('adminRes.duration.m90', '1,5 Stunden'),
  120: t('adminRes.duration.m120', '2 Stunden'),
  150: t('adminRes.duration.m150', '2,5 Stunden'),
  180: t('adminRes.duration.m180', '3 Stunden'),
});`);

txt = txt.replace(/const exportCSV = \\(data: AdminReservation\\[\\]\\) => \\{/, `const exportCSV = (data: AdminReservation[], t: any) => {`);
txt = txt.replace(/const header = 'Buchungs-ID;.*?\\\\n';/, `const header = t('adminRes.csvHeader', 'Buchungs-ID;Datum;Uhrzeit;Kunde;Telefon;Platz;Dauer (Min.);Status;Preis') + '\\n';`);
txt = txt.replace(/statusConfig\\[getDisplayStatus\\(r\\)\\]\\?\\.label/, `getStatusConfig(t)[getDisplayStatus(r)]?.label`);

// Fix usage of config builders
txt = txt.replace(/filterTabs\\.map/g, `getFilterTabs(t).map`);
txt = txt.replace(/statusConfig\\[(.*?)\\]/g, `getStatusConfig(t)[$1]`);
txt = txt.replace(/paymentStatusLabels\\[(.*?)\\]/g, `getPaymentStatusLabels(t)[$1]`);
txt = txt.replace(/durationLabels\\[(.*?)\\]/g, `getDurationLabels(t)[$1]`);
txt = txt.replace(/exportCSV\\(filtered\\)/g, `exportCSV(filtered, t)`);

txt = txt.replace(/Reservierungen konnten nicht geladen werden\\./g, `t('adminRes.loadError')`);
txt = txt.replace(/>Erneut versuchen</g, `>{t('adminRes.retry')}<`);
txt = txt.replace(/>Fehler beim Laden</g, `>{t('adminRes.loadError')}<`);

txt = txt.replace(/pageTitle\\('Reservierungen'\\)/g, `pageTitle(t('adminRes.title'))`);
txt = txt.replace(/pageTitle\\('Reservierungen — Fehler'\\)/g, `pageTitle(t('adminRes.errorTitle'))`);

txt = txt.replace(/>Alle Reservierungen</, `>{t('adminRes.headerTitle')}<`);
txt = txt.replace(/>Verwalten Sie alle Buchungen, Stornierungen und Anfragen an einem Ort\\.</, `>{t('adminRes.headerDesc')}<`);
txt = txt.replace(/>Exportieren</, `>{t('adminRes.export')}<`);
txt = txt.replace(/>Neue Buchung</, `>{t('adminRes.newBooking')}<`);

txt = txt.replace(/>Gesamt Reservierungen</, `>{t('adminRes.stats.total')}<`);
txt = txt.replace(/>vs\\. Vormonat</g, `>{t('adminRes.stats.vsPrevMonth')}<`);
txt = txt.replace(/>Stornierungsrate</, `>{t('adminRes.stats.cancelRate')}<`);
txt = txt.replace(/>Beliebteste Zeit</, `>{t('adminRes.stats.popularTime')}<`);
txt = txt.replace(/>Primetime Auslastung</, `>{t('adminRes.stats.primetime')}<`);
txt = txt.replace(/>Umsatz Prognose</, `>{t('adminRes.stats.revenueProg')}<`);
txt = txt.replace(/>Ziel</, `>{t('adminRes.stats.target')}<`);

txt = txt.replace(/>Buchungstrends</, `>{t('adminRes.charts.bookingTrends')}<`);
txt = txt.replace(/>Reservierungen im laufenden Zeitraum</, `>{t('adminRes.charts.resPeriod')}<`);
txt = txt.replace(/>Woche</, `>{t('adminRes.charts.week')}<`);
txt = txt.replace(/>Monat</, `>{t('adminRes.charts.month')}<`);
txt = txt.replace(/>Auslastungs-Vergleich</, `>{t('adminRes.charts.occCompare')}<`);
txt = txt.replace(/>Buchungen</g, `>{t('adminRes.search.bookings')}<`);
txt = txt.replace(/>Keine Felder</, `>{t('adminRes.charts.noFields')}<`);

// Modals & New Bookings
txt = txt.replace(/Reservierung stornieren\\?/, `{t('adminRes.modals.cancelTitle')}`);
txt = txt.replace(/Diese Aktion kann nicht rückgängig gemacht werden\\./, `{t('adminRes.modals.cancelDesc')}`);
txt = txt.replace(/>Buchung:</g, `>{t('adminRes.modals.booking')}<`);
txt = txt.replace(/>Kunde:</g, `>{t('adminRes.modals.customer')}<`);
txt = txt.replace(/>Zeitraum:</, `>{t('adminRes.modals.period')}<`);
txt = txt.replace(/>Platz:</g, `>{t('adminRes.modals.field')}<`);
txt = txt.replace(/>Abbrechen</g, `>{t('adminRes.modals.cancelBtn')}<`);
txt = txt.replace(/>Stornieren</g, `>{t('adminRes.modals.cancelAction')}<`);

txt = txt.replace(/Betrag erstatten\\?/, `{t('adminRes.modals.refundTitle')}`);
txt = txt.replace(/Der Betrag wird über Stripe zurückerstattet\\./, `{t('adminRes.modals.refundDesc')}`);
txt = txt.replace(/>Zahlung:</, `>{t('adminRes.modals.paymentLabel')}<`);
txt = txt.replace(/>Erstattungsbetrag:</, `>{t('adminRes.modals.refundAmount')}<`);
txt = txt.replace(/>Erstatten</g, `>{t('adminRes.modals.refundAction')}<`);
txt = txt.replace("Betrag erstatten (", `{t('adminRes.modals.refundAction')} (`);

txt = txt.replace(/Neue Buchung erstellen/, `{t('adminRes.newBookingModal.title')}`);
txt = txt.replace(/Manuelle Buchungseingabe/, `{t('adminRes.newBookingModal.desc')}`);
txt = txt.replace(/Buchung erstellt!/, `{t('adminRes.newBookingModal.successTitle')}`);
txt = txt.replace(/Wird gespeichert\\.\\.\\./, `{t('adminRes.newBookingModal.successDesc')}`);
txt = txt.replace(/>Kundendaten</, `>{t('adminRes.newBookingModal.customerData')}<`);
txt = txt.replace(/>Name des Kunden \\*</, `>{t('adminRes.newBookingModal.customerName')}<`);
txt = txt.replace(/>E-Mail Adresse</, `>{t('adminRes.newBookingModal.email')}<`);
txt = txt.replace(/>Telefonnummer</, `>{t('adminRes.newBookingModal.phone')}<`);
txt = txt.replace(/>Platz &amp; Details</, `>{t('adminRes.newBookingModal.fieldDetails')}<`);
txt = txt.replace(/>Platz-Auswahl</, `>{t('adminRes.newBookingModal.fieldSelect')}<`);
txt = txt.replace(/>Datum wählen</, `>{t('adminRes.newBookingModal.dateSelect')}<`);
txt = txt.replace(/>Dauer</, `>{t('adminRes.newBookingModal.durationLabel')}<`);
txt = txt.replace(/>Startzeit wählen</, `>{t('adminRes.newBookingModal.timeSelect')}<`);
txt = txt.replace(/Bitte zuerst ein Datum wählen/, `{t('adminRes.newBookingModal.chooseDateFirst')}`);
txt = txt.replace(/Verfügbarkeit wird geladen\\.\\.\\./, `{t('adminRes.newBookingModal.loadingAvail')}`);
txt = txt.replace(/Keine freien Zeiten an diesem Tag/, `{t('adminRes.newBookingModal.noSlots')}`);
txt = txt.replace(/>Bezahlung</, `>{t('adminRes.newBookingModal.paymentTitle')}<`);
txt = txt.replace(/>Bezahlung: Vor Ort</, `>{t('adminRes.newBookingModal.onSiteLabel')}<`);
txt = txt.replace(/Der Kunde zahlt Bar oder mit Karte direkt am Counter\\./, `{t('adminRes.newBookingModal.onSiteDesc')}`);
txt = txt.replace(/Geschätzter Preis/, `{t('adminRes.newBookingModal.estPrice')}`);
txt = txt.replace(/Bitte alle Pflichtfelder ausfüllen\\./g, `t('adminRes.newBookingModal.fillRequired')`);
txt = txt.replace(/Buchung Speichern/, `{t('adminRes.newBookingModal.saveBooking')}`);
txt = txt.replace(/Buchung konnte nicht erstellt werden\\./g, `t('adminRes.newBookingModal.saveError')`);

txt = txt.replace(/Buchungsdetails/, `{t('adminRes.details.title')}`);
txt = txt.replace(/label=\"E-Mail\"/g, `label={t('adminRes.details.emailLabel')}`);
txt = txt.replace(/label=\"Ende\"/g, `label={t('adminRes.details.endLabel')}`);
txt = txt.replace(/label=\"Preis\"/g, `label={t('adminRes.details.priceLabel')}`);
txt = txt.replace(/label=\"Zahlungsstatus\"/g, `label={t('adminRes.details.paymentStatusLabel')}`);
txt = txt.replace(/label=\"Zahlungsmethode\"/g, `label={t('adminRes.details.paymentMethodLabel')}`);
txt = txt.replace(/Gemietetes Material/, `{t('adminRes.details.rentalsTitle')}`);
txt = txt.replace(/Erstellt:/, `{t('adminRes.details.created')}`);

// Table and basic
txt = txt.replace(/Nach ID, Name oder Telefon suchen\\.\\.\\./, `{t('adminRes.search.placeholder')}`);
txt = txt.replace(/gefunden/, `{t('adminRes.search.foundText')}`);
txt = txt.replace(/>Buchungs-ID</g, `>{t('adminRes.table.id')}<`);
txt = txt.replace(/>Datum & Zeit</g, `>{t('adminRes.table.date')}<`);
txt = txt.replace(/>Kunde</g, `>{t('adminRes.table.customer')}<`);
txt = txt.replace(/>Platz</g, `>{t('adminRes.table.field')}<`);
txt = txt.replace(/>Dauer</g, `>{t('adminRes.table.duration')}<`);
txt = txt.replace(/>Status</g, `>{t('adminRes.table.status')}<`);
txt = txt.replace(/>Zahlung</g, `>{t('adminRes.table.payment')}<`);
txt = txt.replace(/>Preis</g, `>{t('adminRes.table.price')}<`);
txt = txt.replace(/>Aktionen</, `>{t('adminRes.table.actions')}<`);

// Pagination
txt = txt.replace(/>Zeige <span/, `>{t('adminRes.table.showing')} <span`);
txt = txt.replace(/von\\{' '\\}/, `{t('adminRes.table.of')}{' '}`);
txt = txt.replace(/Seite \\{currentPage\\} von/, `{t('adminRes.table.page')} {currentPage} {t('adminRes.table.of')}`);

// Values
txt = txt.replace("{f.bookedHours} / {f.totalHours} Std. gebucht", `{f.bookedHours} / {f.totalHours} {t('adminRes.charts.bookedHours')}`);

fs.writeFileSync(tsxPath, txt);
