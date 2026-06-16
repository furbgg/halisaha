const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminZahlungen.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminPayments = {
  title: 'Zahlungen',
  titleError: 'Zahlungen — Fehler',
  header: 'Zahlungshistorie & Erstattungen',
  subtitle: 'Alle Zahlungsvorgänge an einem Ort verwalten.',
  secureEnv: 'Sichere Umgebung',
  exportBtn: 'Exportieren',
  loadError: 'Zahlungsdaten konnten nicht geladen werden.',
  errorTitle: 'Fehler beim Laden',
  retry: 'Erneut versuchen',
  timeFmt: '{{time}} Uhr',
  statuses: {
    PAID: 'Erfolg',
    PENDING: 'Ausstehend',
    REFUNDED: 'Erstattet',
    FAILED: 'Fehlgeschlagen',
    ON_SITE: 'Vor Ort'
  },
  methods: {
    CARD: 'Karte',
    APPLE_PAY: 'Apple Pay',
    GOOGLE_PAY: 'GPay',
    ON_SITE: 'Barzahlung'
  },
  filters: {
    all: 'Alle'
  },
  stats: {
    todayRev: 'Umsatz heute',
    vsYesterday: 'Verglichen mit gestern',
    pending: 'Offene Zahlungen',
    attention: 'Erfordert Aufmerksamkeit',
    pendingSub: 'Ausstehende Zahlungen',
    refundedM: 'Gesamt Erstattet (Monat)',
    transactions: 'Transaktion',
    transactionsPlural: 'Transaktionen'
  },
  search: 'Suche nach ID oder Name...',
  foundText: 'Zahlung',
  foundTextPlural: 'Zahlungen',
  foundSuffix: 'gefunden',
  table: {
    id: 'Transaktions-ID',
    date: 'Datum',
    customer: 'Kunde',
    method: 'Methode',
    amount: 'Betrag',
    status: 'Status',
    actions: 'Aktionen',
    empty: 'Keine Zahlungen gefunden',
    showing: 'Zeige {{start}}-{{end}} von {{total}} Einträgen',
    pageOf: 'Seite {{current}} von {{total}}'
  },
  refundModal: {
    title: 'Zahlung Erstatten',
    transaction: 'Transaktion',
    origAmount: 'Ursprünglicher Betrag',
    type: 'Erstattungsart',
    partial: 'Teilerstattung',
    full: 'Volle Erstattung',
    amountEur: 'Betrag (EUR)',
    maxRefundable: 'Maximal erstattungsfähig: ',
    reason: 'Begründung (Optional)',
    reasonPH: 'Grund für die Erstattung...',
    cancel: 'Abbrechen',
    refundBtn: 'Erstatten',
    refundError: 'Erstattung fehlgeschlagen.'
  }
};

tr.adminPayments = {
  title: 'Ödemeler',
  titleError: 'Ödemeler — Hata',
  header: 'Ödeme Geçmişi ve İadeler',
  subtitle: 'Tüm ödeme işlemlerini tek bir yerden yönetin.',
  secureEnv: 'Güvenli Ortam',
  exportBtn: 'Dışa Aktar',
  loadError: 'Ödeme verileri yüklenemedi.',
  errorTitle: 'Yükleme Hatası',
  retry: 'Tekrar Dene',
  timeFmt: '{{time}}',
  statuses: {
    PAID: 'Başarılı',
    PENDING: 'Beklemede',
    REFUNDED: 'İade Edildi',
    FAILED: 'Başarısız',
    ON_SITE: 'Yerinde'
  },
  methods: {
    CARD: 'Kart',
    APPLE_PAY: 'Apple Pay',
    GOOGLE_PAY: 'GPay',
    ON_SITE: 'Nakit Ödeme'
  },
  filters: {
    all: 'Tümü'
  },
  stats: {
    todayRev: 'Bugünkü Ciro',
    vsYesterday: 'Düne kıyasla',
    pending: 'Açık Ödemeler',
    attention: 'Dikkat Gerekiyor',
    pendingSub: 'Bekleyen Ödemeler',
    refundedM: 'Toplam İade (Ay)',
    transactions: 'İşlem',
    transactionsPlural: 'İşlemler'
  },
  search: 'ID veya İsim ile ara...',
  foundText: 'Ödeme',
  foundTextPlural: 'Ödeme',
  foundSuffix: 'bulundu',
  table: {
    id: 'İşlem ID',
    date: 'Tarih',
    customer: 'Müşteri',
    method: 'Yöntem',
    amount: 'Tutar',
    status: 'Durum',
    actions: 'İşlemler',
    empty: 'Ödeme bulunamadı',
    showing: '{{total}} kayıttan {{start}}-{{end}} arası gösteriliyor',
    pageOf: 'Sayfa {{current}} / {{total}}'
  },
  refundModal: {
    title: 'Ödeme İade Et',
    transaction: 'İşlem',
    origAmount: 'Orijinal Tutar',
    type: 'İade Türü',
    partial: 'Kısmi İade',
    full: 'Tam İade',
    amountEur: 'Tutar (EUR)',
    maxRefundable: 'Maksimum iade edilebilir: ',
    reason: 'Gerekçe (Opsiyonel)',
    reasonPH: 'İade nedeni...',
    cancel: 'İptal',
    refundBtn: 'İade Et',
    refundError: 'İade işlemi başarısız.'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, "import { pageTitle } from '../../config/brand';\nimport { useTranslation } from 'react-i18next';");
txt = txt.replace(/export function AdminZahlungen\(\)\s*\{/, "export function AdminZahlungen() {\n  const { t } = useTranslation();");

// Replace object properties outside component
// To fix object literals outside component, we can use a getter or simple i18next instance if needed, but it's simpler to use `t` during render. 
// However, since `statusConfig`, `methodLabels`, `statusFilterTabs` are defined outside, we can inject `t` from `i18next` directly, or move them inside the component.
// It's cleaner to use `import i18next from 'i18next'` and do `i18next.t('...')` but that's not reactive to language changes.
// Since React re-renders on language change if we use useTranslation, `t()` is preferred. Let's move them or adjust where they are used.
// Let's redefine them inside or use map inline. Actually, let's just use `t` inline where they are consumed.
// But some `keys` or `labels` might be used for filtering.

// Let's replace the usages inline:
txt = txt.replace(/const statusConfig.*?;/s, ""); // remove it temporarily
txt = txt.replace(/const methodLabels.*?;/s, "");
txt = txt.replace(/const statusFilterTabs.*?;/s, "");

// re-create them inside the component:
const recreatedVars = `
  const statusConfig: Record<string, { label: string; icon?: string; bg: string; text: string; border: string }> = {
    PAID:     { label: t('adminPayments.statuses.PAID'),         icon: undefined,      bg: 'bg-primary/10',   text: 'text-primary',    border: 'border-primary/20' },
    PENDING:  { label: t('adminPayments.statuses.PENDING'),     icon: undefined,      bg: 'bg-amber-500/10', text: 'text-amber-400',  border: 'border-amber-500/20' },
    REFUNDED: { label: t('adminPayments.statuses.REFUNDED'),      icon: 'undo',         bg: 'bg-red-500/10',   text: 'text-red-400',    border: 'border-red-500/20' },
    FAILED:   { label: t('adminPayments.statuses.FAILED'), icon: 'block',        bg: 'bg-slate-700/50', text: 'text-slate-400',  border: 'border-slate-600/30' },
    ON_SITE:  { label: t('adminPayments.statuses.ON_SITE'),        icon: undefined,      bg: 'bg-green-500/10', text: 'text-green-400',  border: 'border-green-500/20' },
  };

  const methodLabels: Record<string, { label: string; icon: string }> = {
    CARD:       { label: t('adminPayments.methods.CARD'),      icon: 'credit_card' },
    APPLE_PAY:  { label: t('adminPayments.methods.APPLE_PAY'),  icon: 'phone_iphone' },
    GOOGLE_PAY: { label: t('adminPayments.methods.GOOGLE_PAY'),       icon: 'android' },
    ON_SITE:    { label: t('adminPayments.methods.ON_SITE'), icon: 'payments' },
  };

  const statusFilterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: t('adminPayments.filters.all') },
    { key: 'PAID',     label: t('adminPayments.statuses.PAID') },
    { key: 'PENDING',  label: t('adminPayments.statuses.PENDING') },
    { key: 'REFUNDED', label: t('adminPayments.statuses.REFUNDED') },
    { key: 'FAILED',   label: t('adminPayments.statuses.FAILED') },
    { key: 'ON_SITE',  label: t('adminPayments.statuses.ON_SITE') },
  ];
`;

txt = txt.replace(/const \[reservations,/, recreatedVars + '\n  const [reservations,');

// time format in formatDate:
txt = txt.replace(/time: d\.toLocaleTimeString\('de-AT', \{ hour: '2-digit', minute: '2-digit' \}\) \+ ' Uhr',/, `time: d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }),`);
// Wait, formatDate is outside. I'll just remove " + ' Uhr'" and add `timeFmt` translation inside component.
txt = txt.replace(/time: d\.toLocaleTimeString\('de-AT', \{ hour: '2-digit', minute: '2-digit' \}\) \+ ' Uhr',/, `time: d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }),`);

// In CSV export:
txt = txt.replace(/const header = 'Transaktions-ID;Datum;Kunde;Methode;Betrag;Status\\n';/, "const header = `${t('adminPayments.table.id')};${t('adminPayments.table.date')};${t('adminPayments.table.customer')};${t('adminPayments.table.method')};${t('adminPayments.table.amount')};${t('adminPayments.table.status')}\\n`;");

// inside JSX table:
txt = txt.replace(/<span className="text-xs text-slate-500">\{time\}<\/span>/g, '<span className="text-xs text-slate-500">{t("adminPayments.timeFmt", { time })}</span>');
txt = txt.replace(/<span>\{date\}, \{time\}<\/span>/, '<span>{date}, {t("adminPayments.timeFmt", { time })}</span>');

txt = txt.replace(/'Zahlungsdaten konnten nicht geladen werden\.'/g, "t('adminPayments.loadError')");
txt = txt.replace(/'Erstattung fehlgeschlagen\.'/g, "t('adminPayments.refundModal.refundError')");

txt = txt.replace(/>Zahlungen — Fehler</, ">{t('adminPayments.titleError')}<");
txt = txt.replace(/>Zahlungen</g, ">{t('adminPayments.title')}<");
txt = txt.replace(/pageTitle\('Zahlungen'\)/g, "pageTitle(t('adminPayments.title'))");
txt = txt.replace(/pageTitle\('Zahlungen — Fehler'\)/g, "pageTitle(t('adminPayments.titleError'))");

txt = txt.replace(/>Fehler beim Laden</g, ">{t('adminPayments.errorTitle')}<");
txt = txt.replace(/>Erneut versuchen</g, ">{t('adminPayments.retry')}<");

txt = txt.replace(/>Zahlungshistorie &amp; Erstattungen</g, ">{t('adminPayments.header')}<");
txt = txt.replace(/>Alle Zahlungsvorgänge an einem Ort verwalten\.</g, ">{t('adminPayments.subtitle')}<");
txt = txt.replace(/title="Sichere Umgebung"/g, "title={t('adminPayments.secureEnv')}");

txt = txt.replace(/>Exportieren</g, ">{t('adminPayments.exportBtn')}<");

txt = txt.replace(/>Umsatz heute</g, ">{t('adminPayments.stats.todayRev')}<");
txt = txt.replace(/>Verglichen mit gestern</g, ">{t('adminPayments.stats.vsYesterday')}<");
txt = txt.replace(/>Offene Zahlungen</g, ">{t('adminPayments.stats.pending')}<");
txt = txt.replace(/>Erfordert Aufmerksamkeit</g, ">{t('adminPayments.stats.attention')}<");
txt = txt.replace(/>Ausstehende Zahlungen</g, ">{t('adminPayments.stats.pendingSub')}<");
txt = txt.replace(/>Gesamt Erstattet \(Monat\)</g, ">{t('adminPayments.stats.refundedM')}<");
txt = txt.replace(/\{stats\.refundedCount\} Transaktion\{stats\.refundedCount !== 1 \? 'en' : ''\}/g, "{stats.refundedCount} {stats.refundedCount !== 1 ? t('adminPayments.stats.transactionsPlural') : t('adminPayments.stats.transactions')}");

txt = txt.replace(/placeholder="Suche nach ID oder Name\.\.\."/g, "placeholder={t('adminPayments.search')}");
txt = txt.replace(/\{filtered\.length\} Zahlung\{filtered\.length !== 1 \? 'en' : ''\} gefunden/g, "{filtered.length} {filtered.length !== 1 ? t('adminPayments.foundTextPlural') : t('adminPayments.foundText')} {t('adminPayments.foundSuffix')}");

txt = txt.replace(/>Transaktions-ID</g, ">{t('adminPayments.table.id')}<");
txt = txt.replace(/>Datum</g, ">{t('adminPayments.table.date')}<");
txt = txt.replace(/>Kunde</g, ">{t('adminPayments.table.customer')}<");
txt = txt.replace(/>Methode</g, ">{t('adminPayments.table.method')}<");
txt = txt.replace(/>Betrag</g, ">{t('adminPayments.table.amount')}<");
txt = txt.replace(/>Status</g, ">{t('adminPayments.table.status')}<");
txt = txt.replace(/>Aktionen</g, ">{t('adminPayments.table.actions')}<");

txt = txt.replace(/>Keine Zahlungen gefunden</g, ">{t('adminPayments.table.empty')}<");

txt = txt.replace(/Zeige <span className="text-white font-medium">\{\(currentPage - 1\) \* PAGE_SIZE \+ 1\}-\{Math\.min\(currentPage \* PAGE_SIZE, filtered\.length\)\}<\/span> von\{' '\}\n\s*<span className="text-white font-medium">\{filtered\.length\}<\/span> Einträgen/g, "{t('adminPayments.table.showing', { start: (currentPage - 1) * PAGE_SIZE + 1, end: Math.min(currentPage * PAGE_SIZE, filtered.length), total: filtered.length })}");

txt = txt.replace(/Seite \{currentPage\} von \{totalPages\}/g, "{t('adminPayments.table.pageOf', { current: currentPage, total: totalPages })}");

txt = txt.replace(/title="Erstatten"/g, "title={t('adminPayments.refundModal.refundBtn')}");

txt = txt.replace(/>Zahlung Erstatten</g, ">{t('adminPayments.refundModal.title')}<");
txt = txt.replace(/>Transaktion</g, ">{t('adminPayments.refundModal.transaction')}<");
txt = txt.replace(/>Ursprünglicher Betrag</g, ">{t('adminPayments.refundModal.origAmount')}<");
txt = txt.replace(/>Erstattungsart</g, ">{t('adminPayments.refundModal.type')}<");
txt = txt.replace(/>Teilerstattung</g, ">{t('adminPayments.refundModal.partial')}<");
txt = txt.replace(/>Volle Erstattung</g, ">{t('adminPayments.refundModal.full')}<");
txt = txt.replace(/>Betrag \(EUR\)</g, ">{t('adminPayments.refundModal.amountEur')}<");
txt = txt.replace(/>Maximal erstattungsfähig: /g, ">{t('adminPayments.refundModal.maxRefundable')}");
txt = txt.replace(/>Begründung \(Optional\)</g, ">{t('adminPayments.refundModal.reason')}<");
txt = txt.replace(/placeholder="Grund für die Erstattung\.\.\."/g, "placeholder={t('adminPayments.refundModal.reasonPH')}");

txt = txt.replace(/>Abbrechen</g, ">{t('adminPayments.refundModal.cancel')}<");
txt = txt.replace(/\{parseFloat\(refundAmount \|\| '0'\)\.toFixed\(2\)\.replace\('\.', ','\)\} € Erstatten/g, "{parseFloat(refundAmount || '0').toFixed(2).replace('.', ',')} € {t('adminPayments.refundModal.refundBtn')}");
txt = txt.replace(/>Erstatten</g, ">{t('adminPayments.refundModal.refundBtn')}<");

fs.writeFileSync(tsxPath, txt);
