const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminPersonal.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminStaff = {
  title: 'Personalverwaltung',
  adminPanel: 'Admin Panel',
  subtitle: 'Verwalten Sie Ihr Team, Schichtpläne und Leistungsdaten für die Sportsaison.',
  adminInviteSuccess: 'Admin-Benutzer erstellt. Zugangsdaten wurden per E-Mail gesendet.',
  adminInviteError: 'Fehler beim Erstellen des Admin-Benutzers.',
  time: {
    minsAgo: 'Vor {{min}} Min',
    hoursAgo: 'Vor {{hours}} Std',
    daysAgo: 'Vor {{days}} Tagen',
    yesterday: 'Gestern'
  },
  stats: {
    total: 'Gesamtpersonal',
    activeTitle: 'Aktiv',
    activeDesc: 'Mitarbeiter aktiv',
    inactive: 'Inaktiv'
  },
  search: {
    placeholder: 'Nach Name oder Position suchen...',
    allRoles: 'Alle Rollen'
  },
  buttons: {
    newStaff: 'Neues Personal',
    newAdmin: 'Neues Admin'
  },
  table: {
    staff: 'Mitarbeiter',
    role: 'Rolle',
    status: 'Status',
    contact: 'Kontakt',
    created: 'Erstellt',
    actions: 'Aktionen',
    empty: 'Keine Mitarbeiter gefunden.',
    activeStr: 'Aktiv',
    inactiveStr: 'Inaktiv',
    showing: 'Zeige {{count}} von {{total}} Mitarbeitern'
  },
  actions: {
    editProfile: 'Profil bearbeiten',
    deactivate: 'Deaktivieren'
  },
  modal: {
    editTitle: 'Mitarbeiter bearbeiten',
    newTitle: 'Neues Personal',
    name: 'Name *',
    namePH: 'Vor- und Nachname',
    role: 'Rolle *',
    rolePH: 'Rolle wählen...',
    roles: {
      Manager: 'Manager',
      Trainer: 'Trainer',
      Platzwart: 'Platzwart',
      Rezeption: 'Rezeption',
      Reinigung: 'Reinigung',
      Security: 'Security'
    },
    email: 'E-Mail',
    emailPH: 'email@example.com',
    phone: 'Telefon',
    phonePH: '+43 ...',
    notes: 'Notizen',
    notesPH: 'Interne Notizen...',
    cancel: 'Abbrechen',
    updateBtn: 'Aktualisieren',
    createBtn: 'Erstellen'
  },
  adminModal: {
    title: 'Admin einladen',
    desc: 'Ein neuer Admin-Benutzer wird erstellt und erhält die Zugangsdaten per E-Mail.',
    name: 'Name *',
    email: 'E-Mail *',
    emailPH: 'admin@soccerarena.at',
    inviteBtn: 'Admin einladen',
    cancel: 'Abbrechen'
  }
};

tr.adminStaff = {
  title: 'Personel Yönetimi',
  adminPanel: 'Admin Paneli',
  subtitle: 'Sezon için ekibinizi, vardiyaları ve performans verilerini yönetin.',
  adminInviteSuccess: 'Admin kullanıcısı oluşturuldu. Giriş bilgileri e-posta ile gönderildi.',
  adminInviteError: 'Admin kullanıcısı oluşturulurken hata.',
  time: {
    minsAgo: '{{min}} Dk Önce',
    hoursAgo: '{{hours}} Saat Önce',
    daysAgo: '{{days}} Gün Önce',
    yesterday: 'Dün'
  },
  stats: {
    total: 'Toplam Personel',
    activeTitle: 'Aktif',
    activeDesc: 'Aktif çalışan',
    inactive: 'Pasif'
  },
  search: {
    placeholder: 'İsim veya pozisyona göre ara...',
    allRoles: 'Tüm Roller'
  },
  buttons: {
    newStaff: 'Yeni Personel',
    newAdmin: 'Yeni Admin'
  },
  table: {
    staff: 'Personel',
    role: 'Rol',
    status: 'Durum',
    contact: 'İletişim',
    created: 'Oluşturuldu',
    actions: 'İşlemler',
    empty: 'Personel bulunamadı.',
    activeStr: 'Aktif',
    inactiveStr: 'Pasif',
    showing: '{{total}} personelden {{count}} tanesi gösteriliyor'
  },
  actions: {
    editProfile: 'Profili Düzenle',
    deactivate: 'Devre Dışı Bırak'
  },
  modal: {
    editTitle: 'Personeli Düzenle',
    newTitle: 'Yeni Personel',
    name: 'İsim *',
    namePH: 'Ad ve Soyad',
    role: 'Rol *',
    rolePH: 'Rol seçin...',
    roles: {
      Manager: 'Yönetici',
      Trainer: 'Antrenör',
      Platzwart: 'Saha Görevlisi',
      Rezeption: 'Resepsiyon',
      Reinigung: 'Temizlik',
      Security: 'Güvenlik'
    },
    email: 'E-Posta',
    emailPH: 'email@ornek.com',
    phone: 'Telefon',
    phonePH: '+90 ...',
    notes: 'Notlar',
    notesPH: 'Dahili Notlar...',
    cancel: 'İptal',
    updateBtn: 'Güncelle',
    createBtn: 'Oluştur'
  },
  adminModal: {
    title: 'Admin Davet Et',
    desc: 'Yeni bir admin oluşturulacak ve giriş bilgileri e-posta ile gönderilecektir.',
    name: 'İsim *',
    email: 'E-Posta *',
    emailPH: 'admin@halisaha.com',
    inviteBtn: 'Davet Et',
    cancel: 'İptal'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, "import { pageTitle } from '../../config/brand';\nimport { useTranslation } from 'react-i18next';");
txt = txt.replace(/export function AdminPersonal\(\)\s*\{/, "export function AdminPersonal() {\n  const { t } = useTranslation();");

// Replacements
txt = txt.replace(/'Admin-Benutzer erstellt\. Zugangsdaten wurden per E-Mail gesendet\.'/, "t('adminStaff.adminInviteSuccess')");
txt = txt.replace(/'Fehler beim Erstellen des Admin-Benutzers\.'/, "t('adminStaff.adminInviteError')");

// Time
txt = txt.replace(/`Vor \$\{diffMin\} Min`/, "t('adminStaff.time.minsAgo', { min: diffMin })");
txt = txt.replace(/`Vor \$\{diffH\} Std`/, "t('adminStaff.time.hoursAgo', { hours: diffH })");
txt = txt.replace(/'Gestern'/, "t('adminStaff.time.yesterday')");
txt = txt.replace(/`Vor \$\{diffD\} Tagen`/, "t('adminStaff.time.daysAgo', { days: diffD })");

// JSX Text replacements
txt = txt.replace(/>Personalverwaltung</g, ">{t('adminStaff.title')}<");
txt = txt.replace(/pageTitle\('Personalverwaltung'\)/, "pageTitle(t('adminStaff.title'))");
txt = txt.replace(/>Admin Panel</, ">{t('adminStaff.adminPanel')}<");
txt = txt.replace(/>Verwalten Sie Ihr Team, Schichtpläne und Leistungsdaten für die Sportsaison\.</, ">{t('adminStaff.subtitle')}<");

txt = txt.replace(/>Gesamtpersonal</, ">{t('adminStaff.stats.total')}<");
txt = txt.replace(/>Aktiv</, ">{t('adminStaff.stats.activeTitle')}<");
txt = txt.replace(/>Mitarbeiter aktiv</, ">{t('adminStaff.stats.activeDesc')}<");
txt = txt.replace(/>Inaktiv</, ">{t('adminStaff.stats.inactive')}<");
txt = txt.replace(/>Aktiv</, ">{t('adminStaff.table.activeStr')}<"); // Role Badge Aktiv
txt = txt.replace(/>Inaktiv</, ">{t('adminStaff.table.inactiveStr')}<"); // Role Badge Inaktiv

txt = txt.replace(/placeholder="Nach Name oder Position suchen\.\.\."/, "placeholder={t('adminStaff.search.placeholder')}");
txt = txt.replace(/>Alle Rollen</, ">{t('adminStaff.search.allRoles')}<");

txt = txt.replace(/>Neues Personal</g, ">{t('adminStaff.buttons.newStaff')}<");
txt = txt.replace(/>Neues Admin</, ">{t('adminStaff.buttons.newAdmin')}<");

txt = txt.replace(/>Mitarbeiter</, ">{t('adminStaff.table.staff')}<");
txt = txt.replace(/>Rolle</, ">{t('adminStaff.table.role')}<");
txt = txt.replace(/>Status</, ">{t('adminStaff.table.status')}<");
txt = txt.replace(/>Kontakt</, ">{t('adminStaff.table.contact')}<");
txt = txt.replace(/>Erstellt</, ">{t('adminStaff.table.created')}<");
txt = txt.replace(/>Aktionen</, ">{t('adminStaff.table.actions')}<");
txt = txt.replace(/>Keine Mitarbeiter gefunden\.</, ">{t('adminStaff.table.empty')}<");

txt = txt.replace(/title="Profil bearbeiten"/, "title={t('adminStaff.actions.editProfile')}");
txt = txt.replace(/title="Deaktivieren"/, "title={t('adminStaff.actions.deactivate')}");

txt = txt.replace(/Zeige <span className="text-white font-medium">\{filteredStaff\.length\}<\/span> von <span className="text-white font-medium">\{allCount\}<\/span> Mitarbeitern/, "{t('adminStaff.table.showing', { count: filteredStaff.length, total: allCount })}");

txt = txt.replace(/'Mitarbeiter bearbeiten' : 'Neues Personal'/, "editingStaff ? t('adminStaff.modal.editTitle') : t('adminStaff.modal.newTitle')");
txt = txt.replace(/>Name \*</g, ">{t('adminStaff.modal.name')}<");
txt = txt.replace(/placeholder="Vor- und Nachname"/g, "placeholder={t('adminStaff.modal.namePH')}");
txt = txt.replace(/>Rolle \*</, ">{t('adminStaff.modal.role')}<");
txt = txt.replace(/>Rolle wählen\.\.\.</, ">{t('adminStaff.modal.rolePH')}<");

txt = txt.replace(/>Manager</g, ">{t('adminStaff.modal.roles.Manager')}<");
txt = txt.replace(/>Trainer</g, ">{t('adminStaff.modal.roles.Trainer')}<");
txt = txt.replace(/>Platzwart</g, ">{t('adminStaff.modal.roles.Platzwart')}<");
txt = txt.replace(/>Rezeption</g, ">{t('adminStaff.modal.roles.Rezeption')}<");
txt = txt.replace(/>Reinigung</g, ">{t('adminStaff.modal.roles.Reinigung')}<");
txt = txt.replace(/>Security</g, ">{t('adminStaff.modal.roles.Security')}<");

txt = txt.replace(/>E-Mail</, ">{t('adminStaff.modal.email')}<");
txt = txt.replace(/placeholder="email@example\.com"/, "placeholder={t('adminStaff.modal.emailPH')}");
txt = txt.replace(/>Telefon</, ">{t('adminStaff.modal.phone')}<");
txt = txt.replace(/placeholder="\+43 \.\.\."/, "placeholder={t('adminStaff.modal.phonePH')}");
txt = txt.replace(/>Notizen</, ">{t('adminStaff.modal.notes')}<");
txt = txt.replace(/placeholder="Interne Notizen\.\.\."/, "placeholder={t('adminStaff.modal.notesPH')}");

txt = txt.replace(/>Abbrechen</g, ">{t('adminStaff.modal.cancel')}<");
txt = txt.replace(/'Aktualisieren' : 'Erstellen'/, "editingStaff ? t('adminStaff.modal.updateBtn') : t('adminStaff.modal.createBtn')");

txt = txt.replace(/>Admin einladen</g, ">{t('adminStaff.adminModal.title')}<");
txt = txt.replace(/'Admin einladen'/, "t('adminStaff.adminModal.inviteBtn')");
txt = txt.replace(/>Ein neuer Admin-Benutzer wird erstellt und erhält die Zugangsdaten per E-Mail\.</, ">{t('adminStaff.adminModal.desc')}<");
txt = txt.replace(/>E-Mail \*</, ">{t('adminStaff.adminModal.email')}<");
txt = txt.replace(/placeholder="admin@soccerarena\.at"/, "placeholder={t('adminStaff.adminModal.emailPH')}");

fs.writeFileSync(tsxPath, txt);
