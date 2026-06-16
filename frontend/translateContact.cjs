const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminKontaktFormular.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminContact = {
  title: 'Admin Kontaktanfragen',
  header: 'Kontaktanfragen verwalten',
  subtitle: 'Übersicht aller Nachrichten aus dem Kontaktformular',
  exportBtn: 'Exportieren',
  statuses: {
    NEW: 'Neu',
    READ: 'Gelesen',
    REPLIED: 'Beantwortet',
    ARCHIVED: 'Archiviert'
  },
  time: {
    today: 'Heute',
    yesterday: 'Gestern'
  },
  stats: {
    all: 'Alle Nachrichten',
    new: 'Neue Nachrichten',
    unread: 'Ungelesen',
    replied: 'Beantwortet',
    total: 'Gesamt'
  },
  search: 'Suche nach Name, E-Mail oder Betreff...',
  filters: {
    all: 'Alle Status'
  },
  table: {
    id: 'ID',
    date: 'Datum',
    name: 'Name & Nachname',
    email: 'E-Mail-Adresse',
    subject: 'Betreff',
    status: 'Status',
    actions: 'Aktionen',
    empty: 'Keine Nachrichten gefunden.',
    showing: 'Zeige {{count}} von {{total}} Ergebnissen'
  },
  actions: {
    view: 'Ansehen',
    delete: 'Löschen'
  },
  drawer: {
    title: 'Nachricht Details',
    tel: 'Tel: ',
    date: 'Datum',
    status: 'Status',
    subject: 'Betreff',
    noSubject: 'Kein Betreff',
    message: 'Nachricht',
    reply: 'Direkt antworten',
    markDone: 'Als erledigt markieren',
    delete: 'Löschen',
    replySubject: 'Ihre Anfrage bei SoccerArena Salamanda'
  }
};

tr.adminContact = {
  title: 'Admin İletişim Talepleri',
  header: 'İletişim Taleplerini Yönet',
  subtitle: 'İletişim formundan gelen tüm mesajların özeti',
  exportBtn: 'Dışa Aktar',
  statuses: {
    NEW: 'Yeni',
    READ: 'Okundu',
    REPLIED: 'Cevaplandı',
    ARCHIVED: 'Arşivlendi'
  },
  time: {
    today: 'Bugün',
    yesterday: 'Dün'
  },
  stats: {
    all: 'Tüm Mesajlar',
    new: 'Yeni Mesajlar',
    unread: 'Okunmamış',
    replied: 'Cevaplandı',
    total: 'Toplam'
  },
  search: 'İsim, e-posta veya konuya göre ara...',
  filters: {
    all: 'Tüm Durumlar'
  },
  table: {
    id: 'ID',
    date: 'Tarih',
    name: 'Ad & Soyad',
    email: 'E-Posta Adresi',
    subject: 'Konu',
    status: 'Durum',
    actions: 'İşlemler',
    empty: 'Mesaj bulunamadı.',
    showing: '{{total}} sonuçtan {{count}} tanesi gösteriliyor'
  },
  actions: {
    view: 'Görüntüle',
    delete: 'Sil'
  },
  drawer: {
    title: 'Mesaj Detayları',
    tel: 'Tel: ',
    date: 'Tarih',
    status: 'Durum',
    subject: 'Konu',
    noSubject: 'Konu Yok',
    message: 'Mesaj',
    reply: 'Doğrudan Cevapla',
    markDone: 'Tamamlandı Olarak İşaretle',
    delete: 'Sil',
    replySubject: 'SoccerArena Salamanda İletişim Talebi'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, "import { pageTitle } from '../../config/brand';\nimport { useTranslation } from 'react-i18next';");
txt = txt.replace(/export function AdminKontaktFormular\(\)\s*\{/, "export function AdminKontaktFormular() {\n  const { t } = useTranslation();");

// Replace inside formatDate:
txt = txt.replace(/if \(isToday\) return \`Heute, \$\{time\}\`;/, "if (isToday) return `${t('adminContact.time.today')}, ${time}`;");
txt = txt.replace(/if \(isYesterday\) return \`Gestern, \$\{time\}\`;/, "if (isYesterday) return `${t('adminContact.time.yesterday')}, ${time}`;");

// Replace in handleExport
txt = txt.replace(/const headers \= \['ID', 'Datum', 'Name', 'E-Mail', 'Telefon', 'Betreff', 'Nachricht', 'Status'\];/, "const headers = [t('adminContact.table.id'), t('adminContact.table.date'), t('adminContact.table.name'), t('adminContact.table.email'), 'Telefon', t('adminContact.table.subject'), t('adminContact.drawer.message'), t('adminContact.table.status')];");
txt = txt.replace(/const statusLabels.*\n/, "const statusLabels: Record<string, string> = { NEW: t('adminContact.statuses.NEW'), READ: t('adminContact.statuses.READ'), REPLIED: t('adminContact.statuses.REPLIED'), ARCHIVED: t('adminContact.statuses.ARCHIVED') };\n");

// Replace getStatusLabel
txt = txt.replace(/case 'NEW': return 'Neu';/, "case 'NEW': return t('adminContact.statuses.NEW');");
txt = txt.replace(/case 'READ': return 'Gelesen';/, "case 'READ': return t('adminContact.statuses.READ');");
txt = txt.replace(/case 'REPLIED': return 'Beantwortet';/, "case 'REPLIED': return t('adminContact.statuses.REPLIED');");
txt = txt.replace(/case 'ARCHIVED': return 'Archiviert';/, "case 'ARCHIVED': return t('adminContact.statuses.ARCHIVED');");


// HTML
txt = txt.replace(/pageTitle\('Admin Kontaktanfragen'\)/, "pageTitle(t('adminContact.title'))");
txt = txt.replace(/>Admin Kontaktanfragen</, ">{t('adminContact.title')}<");
txt = txt.replace(/>Kontaktanfragen verwalten</, ">{t('adminContact.header')}<");
txt = txt.replace(/>Übersicht aller Nachrichten aus dem Kontaktformular</, ">{t('adminContact.subtitle')}<");
txt = txt.replace(/>Exportieren</g, ">{t('adminContact.exportBtn')}<");

txt = txt.replace(/>Alle Nachrichten</, ">{t('adminContact.stats.all')}<");
txt = txt.replace(/>Neue Nachrichten</, ">{t('adminContact.stats.new')}<");
txt = txt.replace(/>Ungelesen</, ">{t('adminContact.stats.unread')}<");
txt = txt.replace(/>Beantwortet</, ">{t('adminContact.stats.replied')}<");
txt = txt.replace(/>Gesamt</, ">{t('adminContact.stats.total')}<");

txt = txt.replace(/placeholder="Suche nach Name, E-Mail oder Betreff\.\.\."/, "placeholder={t('adminContact.search')}");
txt = txt.replace(/>Alle Status</, ">{t('adminContact.filters.all')}<");

// <option>s
txt = txt.replace(/>Neu<\/option>/, ">{t('adminContact.statuses.NEW')}</option>");
txt = txt.replace(/>Gelesen<\/option>/, ">{t('adminContact.statuses.READ')}</option>");
txt = txt.replace(/>Beantwortet<\/option>/, ">{t('adminContact.statuses.REPLIED')}</option>");

// Table Headers
txt = txt.replace(/>ID</g, ">{t('adminContact.table.id')}<");
txt = txt.replace(/>Datum</g, ">{t('adminContact.table.date')}<");
txt = txt.replace(/>Name &amp; Nachname</, ">{t('adminContact.table.name')}<");
txt = txt.replace(/>E-Mail-Adresse</, ">{t('adminContact.table.email')}<");
txt = txt.replace(/>Betreff</g, ">{t('adminContact.table.subject')}<");
txt = txt.replace(/>Status</g, ">{t('adminContact.table.status')}<");
txt = txt.replace(/>Aktionen</, ">{t('adminContact.table.actions')}<");

txt = txt.replace(/>Keine Nachrichten gefunden\.</, ">{t('adminContact.table.empty')}<");

txt = txt.replace(/title="Ansehen"/, "title={t('adminContact.actions.view')}");
txt = txt.replace(/title="Löschen"/g, "title={t('adminContact.actions.delete')}");

txt = txt.replace(/p className="text-xs text-slate-500">Zeige \{filteredMessages\.length\} von \{allCount\} Ergebnissen<\/p>/, "p className=\"text-xs text-slate-500\">{t('adminContact.table.showing', { count: filteredMessages.length, total: allCount })}</p>");

// Drawer
txt = txt.replace(/>Nachricht Details</, ">{t('adminContact.drawer.title')}<");
txt = txt.replace(/>Tel: (\{selectedMessage\.phone\})</, ">{t('adminContact.drawer.tel')}{$1}<");
txt = txt.replace(/>Kein Betreff</, ">{t('adminContact.drawer.noSubject')}<");
txt = txt.replace(/>Nachricht</, ">{t('adminContact.drawer.message')}<");
txt = txt.replace(/>Direkt antworten</, ">{t('adminContact.drawer.reply')}<");
txt = txt.replace(/>Als erledigt markieren</, ">{t('adminContact.drawer.markDone')}<");

txt = txt.replace(/subject=RE: \$\{selectedMessage\.subject \|\| 'Ihre Anfrage bei SoccerArena Salamanda'\}/, "subject=RE: ${selectedMessage.subject || t('adminContact.drawer.replySubject')}");

fs.writeFileSync(tsxPath, txt);
