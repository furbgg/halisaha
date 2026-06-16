const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, 'src', 'i18n', 'tr.json');
const dePath = path.join(__dirname, 'src', 'i18n', 'de.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Admin Sidebar keys
if (!trData.nav.admin) trData.nav.admin = {};
trData.nav.admin.dashboard = "Dashboard";
trData.nav.admin.reservations = "Rezervasyonlar";
trData.nav.admin.payments = "Ödemeler";
trData.nav.admin.communication = "İletişim";
trData.nav.admin.contactRequests = "İletişim Talepleri";
trData.nav.admin.management = "Yönetim";
trData.nav.admin.equipment = "Malzeme Listesi";
trData.nav.admin.staff = "Personel Listesi";
trData.nav.admin.settings = "Ayarlar";
trData.nav.admin.logout = "Çıkış Yap";
trData.nav.admin.openSidebar = "Yan menüyü aç";
trData.nav.admin.closeSidebar = "Yan menüyü kapat";

if (!deData.nav.admin) deData.nav.admin = {};
deData.nav.admin.dashboard = "Dashboard";
deData.nav.admin.reservations = "Reservierungen";
deData.nav.admin.payments = "Zahlungen";
deData.nav.admin.communication = "Kommunikation";
deData.nav.admin.contactRequests = "Kontaktanfragen";
deData.nav.admin.management = "Verwaltung";
deData.nav.admin.equipment = "Materialliste";
deData.nav.admin.staff = "Personalliste";
deData.nav.admin.settings = "Einstellungen";
deData.nav.admin.logout = "Abmelden";
deData.nav.admin.openSidebar = "Sidebar öffnen";
deData.nav.admin.closeSidebar = "Sidebar schließen";

// Booking Bottom Bar
if (!trData.booking.step1) trData.booking.step1 = {};
trData.booking.step1.yourAppointment = "Senin Randevun";
trData.booking.step1.total = "Toplam";
trData.booking.step1.continue = "Rezervasyona Devam Et";

if (!deData.booking.step1) deData.booking.step1 = {};
deData.booking.step1.yourAppointment = "Dein Termin";
deData.booking.step1.total = "Gesamt";
deData.booking.step1.continue = "Weiter zur Buchung";

// Admin Einstellungen Save/Cancel
if (!trData.admin) trData.admin = {};
if (!trData.admin.settings) trData.admin.settings = {};
trData.admin.settings.save = "AYARLARI KAYDET";
trData.admin.settings.cancel = "İptal";

if (!deData.admin) deData.admin = {};
if (!deData.admin.settings) deData.admin.settings = {};
deData.admin.settings.save = "EINSTELLUNGEN SPEICHERN";
deData.admin.settings.cancel = "Abbrechen";

fs.writeFileSync(trPath, JSON.stringify(trData, null, 2));
fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));

console.log('Added missing Admin and Booking translations');
