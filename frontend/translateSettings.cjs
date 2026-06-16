const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminSettings = {
  title: 'Einstellungen',
  desc: 'Verwalten Sie Öffnungszeiten, Preise und Reservierungsregeln.',
  online: 'System Online',
  tabs: {
    fields: 'Saha-Einstellungen',
    staff: 'Personal-Einstellungen',
    company: 'Unternehmensdaten',
    security: 'Sicherheit',
    notifications: 'Benachrichtigungen',
    coupons: 'Gutscheine'
  },
  days: { monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag' },
  fields: {
    hoursTitle: 'Öffnungszeiten & Verfügbarkeit',
    table: { day: 'Tag', open: 'Öffnet um', close: 'Schließt um', status: 'Status' },
    pricingTitle: 'Saha Preisgestaltung',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    hourlyStandard: 'Stundensatz Standard',
    happyHourTitle: 'Happy Hour Konfiguration',
    happyHourDesc: 'Legen Sie Zeiten fest, in denen automatisch ein Rabatt auf alle Plätze gewährt wird.',
    happyHourEnable: 'Happy Hour aktivieren',
    startTime: 'Startzeit',
    endTime: 'Endzeit',
    discount: 'Rabatt (%)',
    rulesTitle: 'Reservierungseinstellungen',
    holdDuration: 'Hold-Dauer',
    holdDesc: 'Zeitraum, in dem eine Buchung reserviert bleibt, bevor sie bezahlt werden muss.',
    cancelDeadline: 'Stornierungsfrist',
    cancelDesc: 'Bis wie viele Stunden vor Spielbeginn kann kostenlos storniert werden.',
    notifications: 'Benachrichtigungen',
    notifDesc: 'Automatische Erinnerungen an Kunden senden.',
    reminders: 'Erinnerungs-SMS/Email (24h)'
  },
  coupons: {
    title: 'Gutschein-Verwaltung',
    newBtn: 'Neuer Gutschein',
    table: { code: 'Gutscheincode', discount: 'Rabatt', minOrder: 'Mindestumsatz', validity: 'Gültigkeit', uses: 'Nutzungen', status: 'Status' },
    noCoupons: 'Keine Gutscheine vorhanden.',
    expired: 'Abgelaufen',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    deleteConfirm: 'Gutschein wirklich löschen?',
    modal: {
      editTitle: 'Gutschein bearbeiten',
      newTitle: 'Neuer Gutschein',
      code: 'Gutscheincode',
      discountType: 'Rabatttyp',
      percent: 'Prozent (%)',
      fixed: 'Fester Betrag (€)',
      discountValue: 'Rabattwert',
      maxUses: 'Max. Nutzungen',
      unlimited: '0 = unbegrenzt',
      minOrder: 'Mindestbestellwert',
      noMinOrder: '0 = kein Mindestbetrag',
      validFrom: 'Gültig ab',
      validUntil: 'Gültig bis',
      activateNow: 'Sofort aktivieren',
      cancel: 'Abbrechen',
      save: 'Speichern',
      create: 'Erstellen'
    }
  },
  notifications: {
    clientTitle: 'Kunden-Benachrichtigungen',
    emailSettings: 'E-Mail-Benachrichtigungen',
    emailDesc: 'Alle E-Mail-Benachrichtigungen an Kunden aktivieren/deaktivieren.',
    emailConfirm: 'Buchungsbestätigung per E-Mail',
    emailConfirmDesc: 'Sendet automatisch eine Bestätigung an den Kunden nach erfolgreicher Buchung.',
    emailReminder: 'Terminerinnerung (24h vorher)',
    emailReminderDesc: 'Erinnert Kunden 24 Stunden vor Spielbeginn an ihren Termin.',
    emailCancel: 'Stornierungsbestätigung',
    emailCancelDesc: 'Benachrichtigt den Kunden, wenn eine Buchung storniert wurde.',
    waTitle: 'WhatsApp-Integration',
    waEnable: 'WhatsApp Nachrichten aktivieren',
    waDesc: 'Ermöglicht das Senden von Buchungsdetails direkt über WhatsApp.',
    waKey: 'WhatsApp API Key',
    waKeyDesc: 'Diesen Schlüssel finden Sie in Ihrem Meta Business Dashboard.',
    waPhoneId: 'Phone Number ID',
    waPhoneDesc: 'Die Phone Number ID aus Ihrem WhatsApp Business API Setup.',
    templates: 'Nachrichtenvorlagen',
    placeholders: 'Platzhalter:',
    confirmTpl: 'Buchungsbestätigung',
    cancelTpl: 'Stornierung',
    modTpl: 'Umbuchung',
    couponTpl: 'Gutschein-Info',
    adminReports: 'Admin-Berichte',
    dailyRev: 'Täglicher Umsatzbericht',
    dailyRevDesc: 'Zusammenfassung per E-Mail um 23:59 Uhr.',
    newBooking: 'Benachrichtigung bei neuen Buchungen',
    newBookingDesc: 'Sofortige Info bei jeder neuen Reservierung.',
    sysAlerts: 'System-Benachrichtigungen',
    secAlerts: 'Sicherheitswarnungen',
    secAlertsDesc: 'Warnung bei verdächtigen Login-Versuchen.',
    maintAlerts: 'Wartungsmeldungen',
    maintAlertsDesc: 'Infos über geplante System-Updates.'
  },
  security: {
    adminSec: 'Admin-Sicherheit',
    changePw: 'Passwort ändern',
    currentPw: 'Aktuelles Passwort',
    newPw: 'Neues Passwort',
    pwHint: 'Mindestens 8 Zeichen, inkl. Sonderzeichen',
    confirmPw: 'Passwort bestätigen',
    updatePw: 'Passwort aktualisieren',
    twoFactor: '2-Faktor-Authentifizierung (2FA)',
    twoFactorDesc: 'Zusätzliche Sicherheitsebene für Ihr Konto',
    twoFactorSetup: '2FA einrichten',
    scanQr: 'Scannen Sie den QR-Code mit Google Authenticator oder einer kompatiblen App:',
    manualEntry: 'Oder manuell eingeben:',
    sixDigitCode: '6-stelliger Code',
    cancel: 'Abbrechen',
    activate: 'Aktivieren',
    sessions: 'Sitzungs-Management',
    revokeAll: 'Alle anderen beenden',
    activeSessions: 'Aktive Sitzungen',
    noSessions: 'Keine aktiven Sitzungen',
    unknownDevice: 'Unbekanntes Gerät',
    current: 'Aktuell',
    revoke: 'Sitzung beenden',
    justNow: 'Gerade eben',
    lastActivity: 'Letzte Aktivität:',
    sessionWarning: 'Wenn Sie eine Sitzung nicht erkennen, ändern Sie sofort Ihr Passwort und beenden Sie alle Sitzungen.'
  },
  saveBar: {
    lastChange: 'Letzte Änderung:',
    notSaved: 'Noch nicht gespeichert',
    cancel: 'Abbrechen',
    save: 'Einstellungen Speichern',
    successMsg: 'Einstellungen erfolgreich gespeichert!',
    saveError: 'Fehler beim Speichern.',
    saving: 'Wird gespeichert...'
  },
  placeholder: {
    soon: 'Diese Sektion wird demnächst implementiert.'
  },
  errors: {
    pwFillAll: 'Bitte alle Felder ausfüllen.',
    pwLength: 'Neues Passwort muss mindestens 8 Zeichen haben.',
    pwMismatch: 'Passwörter stimmen nicht überein.',
    pwSuccess: 'Passwort erfolgreich geändert!',
    twoFAError: '2FA konnte nicht eingerichtet werden.',
    twoFAInvalid: 'Ungültiger Code. Bitte erneut versuchen.',
    couponSaveError: 'Fehler beim Speichern'
  }
};

tr.adminSettings = {
  title: 'Ayarlar',
  desc: 'Çalışma saatlerini, fiyatları ve rezervasyon kurallarını yönetin.',
  online: 'Sistem Çevrimiçi',
  tabs: {
    fields: 'Saha Ayarları',
    staff: 'Personel Ayarları',
    company: 'Şirket Bilgileri',
    security: 'Güvenlik',
    notifications: 'Bildirimler',
    coupons: 'Kuponlar'
  },
  days: { monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar' },
  fields: {
    hoursTitle: 'Açılış Saatleri & Uygunluk',
    table: { day: 'Gün', open: 'Açılış', close: 'Kapanış', status: 'Durum' },
    pricingTitle: 'Saha Fiyatlandırma',
    active: 'Aktif',
    inactive: 'Pasif',
    hourlyStandard: 'Standart Saatlik Ücret',
    happyHourTitle: 'Happy Hour Yapılandırması',
    happyHourDesc: 'Tüm sahalarda otomatik olarak indirim uygulanacak saatleri belirleyin.',
    happyHourEnable: 'Happy Hour Aktifleştir',
    startTime: 'Başlangıç Saati',
    endTime: 'Bitiş Saati',
    discount: 'İndirim (%)',
    rulesTitle: 'Rezervasyon Ayarları',
    holdDuration: 'Bekletme Süresi',
    holdDesc: 'Bir rezervasyonun ödenmeden önce bekletileceği süre.',
    cancelDeadline: 'İptal Süresi',
    cancelDesc: 'Oyun başlamadan en fazla kaç saat önceye kadar ücretsiz iptal edilebilir.',
    notifications: 'Bildirimler',
    notifDesc: 'Müşterilere otomatik hatırlatmalar gönderin.',
    reminders: 'Hatırlatma SMS/E-mail (24s)'
  },
  coupons: {
    title: 'Kupon Yönetimi',
    newBtn: 'Yeni Kupon',
    table: { code: 'Kupon Kodu', discount: 'İndirim', minOrder: 'Minimum Sipariş', validity: 'Geçerlilik', uses: 'Kullanım', status: 'Durum' },
    noCoupons: 'Mevcut kupon yok.',
    expired: 'Süresi Doldu',
    active: 'Aktif',
    inactive: 'Pasif',
    edit: 'Düzenle',
    delete: 'Sil',
    deleteConfirm: 'Kuponu silmek istediğinize emin misiniz?',
    modal: {
      editTitle: 'Kuponu Düzenle',
      newTitle: 'Yeni Kupon',
      code: 'Kupon Kodu',
      discountType: 'İndirim Türü',
      percent: 'Yüzde (%)',
      fixed: 'Sabit Tutar (€)',
      discountValue: 'İndirim Değeri',
      maxUses: 'Maks. Kullanım',
      unlimited: '0 = limitsiz',
      minOrder: 'Minimum Sipariş Tutarı',
      noMinOrder: '0 = minimum tutar yok',
      validFrom: 'Geçerlilik Başlangıç',
      validUntil: 'Geçerlilik Bitiş',
      activateNow: 'Hemen Aktifleştir',
      cancel: 'İptal',
      save: 'Kaydet',
      create: 'Oluştur'
    }
  },
  notifications: {
    clientTitle: 'Müşteri Bildirimleri',
    emailSettings: 'E-Posta Bildirimleri',
    emailDesc: 'Müşterilere tüm e-posta bildirimlerini açıp kapatın.',
    emailConfirm: 'E-Posta ile Onay',
    emailConfirmDesc: 'Başarılı rezervasyondan sonra müşteriye otomatik onay gönder.',
    emailReminder: 'Randevu Hatırlatması (24s önce)',
    emailReminderDesc: 'Oyun başlamadan 24 saat önce müşteriye hatırlatma yap.',
    emailCancel: 'İptal Onayı',
    emailCancelDesc: 'Rezervasyon iptal edildiğinde müşteriye bildir.',
    waTitle: 'WhatsApp Entegrasyonu',
    waEnable: 'WhatsApp mesajlarını etkinleştir',
    waDesc: 'Rezervasyon bilgilerinin doğrudan WhatsApp üzerinden gönderilmesini sağlar.',
    waKey: 'WhatsApp API Anahtarı',
    waKeyDesc: 'Bu anahtarı Meta Business kontrol panelinde bulabilirsiniz.',
    waPhoneId: 'Telefon Numarası ID',
    waPhoneDesc: 'WhatsApp Business API kurulumunuzdan alınan Telefon Numarası ID.',
    templates: 'Mesaj Şablonları',
    placeholders: 'Yer Tutucular:',
    confirmTpl: 'Rezervasyon Onayı',
    cancelTpl: 'İptal',
    modTpl: 'Değişiklik',
    couponTpl: 'Kupon Bilgisi',
    adminReports: 'Admin Raporları',
    dailyRev: 'Günlük Gelir Raporu',
    dailyRevDesc: "Her gün 23:59'da e-posta ile özet gönder.",
    newBooking: 'Yeni Rezervasyon Bildirimi',
    newBookingDesc: 'Her yeni rezervasyonda anında bildirim.',
    sysAlerts: 'Sistem Bildirimleri',
    secAlerts: 'Güvenlik Uyarıları',
    secAlertsDesc: 'Şüpheli giriş denemelerinde uyarı.',
    maintAlerts: 'Bakım Bildirimleri',
    maintAlertsDesc: 'Planlı sistem güncellemeleri hakkında bilgi.'
  },
  security: {
    adminSec: 'Admin Güvenliği',
    changePw: 'Şifreyi Değiştir',
    currentPw: 'Mevcut Şifre',
    newPw: 'Yeni Şifre',
    pwHint: 'En az 8 karakter, özel karakter dahil',
    confirmPw: 'Şifreyi Onayla',
    updatePw: 'Şifreyi Güncelle',
    twoFactor: 'İki Faktörlü Doğrulama (2FA)',
    twoFactorDesc: 'Hesabınız için ekstra güvenlik katmanı',
    twoFactorSetup: '2FA Kurulumu',
    scanQr: 'QR kodunu Google Authenticator veya uyumlu bir uygulama ile tarayın:',
    manualEntry: 'Veya manuel olarak girin:',
    sixDigitCode: '6 haneli Kod',
    cancel: 'İptal',
    activate: 'Etkinleştir',
    sessions: 'Oturum Yönetimi',
    revokeAll: 'Diğerlerini Kapat',
    activeSessions: 'Aktif Oturumlar',
    noSessions: 'Aktif oturum yok',
    unknownDevice: 'Bilinmeyen Cihaz',
    current: 'Mevcut',
    revoke: 'Oturumu Kapat',
    justNow: 'Az önce',
    lastActivity: 'Son Aktivite:',
    sessionWarning: 'Eğer bir oturumu tanımıyorsanız, derhal şifrenizi değiştirin ve tüm oturumları kapatın.'
  },
  saveBar: {
    lastChange: 'Son Değişiklik:',
    notSaved: 'Henüz kaydedilmedi',
    cancel: 'İptal',
    save: 'Ayarları Kaydet',
    successMsg: 'Ayarlar başarıyla kaydedildi!',
    saveError: 'Kaydetme hatası.',
    saving: 'Kaydediliyor...'
  },
  placeholder: {
    soon: 'Bu bölüm yakında eklenecek.'
  },
  errors: {
    pwFillAll: 'Lütfen tüm alanları doldurun.',
    pwLength: 'Yeni şifre en az 8 karakter olmalıdır.',
    pwMismatch: 'Şifreler uyuşmuyor.',
    pwSuccess: 'Şifre başarıyla değiştirildi!',
    twoFAError: '2FA kurulamadı.',
    twoFAInvalid: 'Geçersiz kod. Lütfen tekrar deneyin.',
    couponSaveError: 'Kaydetme hatası'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, "import { pageTitle } from '../../config/brand';\nimport { useTranslation, Trans } from 'react-i18next';");
txt = txt.replace(/export function AdminEinstellungen\(\)\s*\{/, "export function AdminEinstellungen() {\n  const { t } = useTranslation();");

// Simple text replacements in strings
txt = txt.replace(/'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'/g, "t('adminSettings.days.monday', 'Montag'), t('adminSettings.days.tuesday', 'Dienstag'), t('adminSettings.days.wednesday', 'Mittwoch'), t('adminSettings.days.thursday', 'Donnerstag'), t('adminSettings.days.friday', 'Freitag'), t('adminSettings.days.saturday', 'Samstag'), t('adminSettings.days.sunday', 'Sonntag')");
txt = txt.replace(/'Bitte alle Felder ausfüllen\.'/g, "t('adminSettings.errors.pwFillAll', 'Bitte alle Felder ausfüllen.')");
txt = txt.replace(/'Neues Passwort muss mindestens 8 Zeichen haben\.'/g, "t('adminSettings.errors.pwLength', 'Neues Passwort muss mindestens 8 Zeichen haben.')");
txt = txt.replace(/'Passwörter stimmen nicht überein\.'/g, "t('adminSettings.errors.pwMismatch', 'Passwörter stimmen nicht überein.')");
txt = txt.replace(/'Passwort erfolgreich geändert!'/g, "t('adminSettings.errors.pwSuccess', 'Passwort erfolgreich geändert!')");
txt = txt.replace(/'Fehler beim Ändern des Passworts\.'/g, "t('adminSettings.errors.pwError', 'Fehler beim Ändern des Passworts.')");
txt = txt.replace(/'2FA konnte nicht eingerichtet werden\.'/g, "t('adminSettings.errors.twoFAError', '2FA konnte nicht eingerichtet werden.')");
txt = txt.replace(/'Ungültiger Code\. Bitte erneut versuchen\.'/g, "t('adminSettings.errors.twoFAInvalid', 'Ungültiger Code. Bitte erneut versuchen.')");
txt = txt.replace(/'Fehler beim Speichern'/g, "t('adminSettings.errors.couponSaveError', 'Fehler beim Speichern')");
txt = txt.replace(/'Gutschein wirklich löschen\?'/g, "t('adminSettings.coupons.deleteConfirm', 'Gutschein wirklich löschen?')");
txt = txt.replace(/'Einstellungen erfolgreich gespeichert!'/g, "t('adminSettings.saveBar.successMsg', 'Einstellungen erfolgreich gespeichert!')");
txt = txt.replace(/'Fehler beim Speichern\.'/g, "t('adminSettings.saveBar.saveError', 'Fehler beim Speichern.')");

txt = txt.replace(/pageTitle\('Einstellungen'\)/g, "pageTitle(t('adminSettings.title'))");

// Use simple string replace for HTML
txt = txt.replace(">Einstellungen</h1>", ">{t('adminSettings.title')}</h1>");
txt = txt.replace(">Verwalten Sie Öffnungszeiten, Preise und Reservierungsregeln.</p>", ">{t('adminSettings.desc')}</p>");
txt = txt.replace(">System Online<", ">{t('adminSettings.online')}<");

// Tabs
txt = txt.replace(/label: 'Saha-Einstellungen'/g, "label: t('adminSettings.tabs.fields', 'Saha-Einstellungen')");
txt = txt.replace(/label: 'Personal-Einstellungen'/g, "label: t('adminSettings.tabs.staff', 'Personal-Einstellungen')");
txt = txt.replace(/label: 'Unternehmensdaten'/g, "label: t('adminSettings.tabs.company', 'Unternehmensdaten')");
txt = txt.replace(/label: 'Sicherheit'/g, "label: t('adminSettings.tabs.security', 'Sicherheit')");
txt = txt.replace(/label: 'Benachrichtigungen'/g, "label: t('adminSettings.tabs.notifications', 'Benachrichtigungen')");
txt = txt.replace(/label: 'Gutscheine'/g, "label: t('adminSettings.tabs.coupons', 'Gutscheine')");

// Fields Tab
txt = txt.replace(">Öffnungszeiten &amp; Verfügbarkeit<", ">{t('adminSettings.fields.hoursTitle')}<");
txt = txt.replace(">Öffnungszeiten & Verfügbarkeit<", ">{t('adminSettings.fields.hoursTitle')}<");
txt = txt.replace(">Tag<", ">{t('adminSettings.fields.table.day')}<");
txt = txt.replace(">Öffnet um<", ">{t('adminSettings.fields.table.open')}<");
txt = txt.replace(">Schließt um<", ">{t('adminSettings.fields.table.close')}<");
txt = txt.replace(">Status<", ">{t('adminSettings.fields.table.status')}<");

txt = txt.replace(">Saha Preisgestaltung<", ">{t('adminSettings.fields.pricingTitle')}<");
txt = txt.replace(/'Aktiv' : 'Inaktiv'/g, "t('adminSettings.fields.active') : t('adminSettings.fields.inactive')");
txt = txt.replace(">Stundensatz Standard<", ">{t('adminSettings.fields.hourlyStandard')}<");

txt = txt.replace(">Happy Hour Konfiguration<", ">{t('adminSettings.fields.happyHourTitle')}<");
txt = txt.replace(">Legen Sie Zeiten fest, in denen automatisch ein Rabatt auf alle Plätze gewährt wird.</", ">{t('adminSettings.fields.happyHourDesc')}</");
txt = txt.replace(">Happy Hour aktivieren<", ">{t('adminSettings.fields.happyHourEnable')}<");
txt = txt.replace(">Startzeit<", ">{t('adminSettings.fields.startTime')}<");
txt = txt.replace(">Endzeit<", ">{t('adminSettings.fields.endTime')}<");
txt = txt.replace(">Rabatt (%)<", ">{t('adminSettings.fields.discount')}<");

txt = txt.replace(">Reservierungseinstellungen<", ">{t('adminSettings.fields.rulesTitle')}<");
txt = txt.replace(">Hold-Dauer<", ">{t('adminSettings.fields.holdDuration')}<");
txt = txt.replace(">Zeitraum, in dem eine Buchung reserviert bleibt, bevor sie bezahlt werden muss.</", ">{t('adminSettings.fields.holdDesc')}</");
txt = txt.replace(">Stornierungsfrist<", ">{t('adminSettings.fields.cancelDeadline')}<");
txt = txt.replace(">Bis wie viele Stunden vor Spielbeginn kann kostenlos storniert werden.</", ">{t('adminSettings.fields.cancelDesc')}</");
txt = txt.replace(">Benachrichtigungen<", ">{t('adminSettings.fields.notifications')}<");
txt = txt.replace(">Automatische Erinnerungen an Kunden senden.</", ">{t('adminSettings.fields.notifDesc')}</");
txt = txt.replace(">Erinnerungs-SMS/Email (24h)<", ">{t('adminSettings.fields.reminders')}<");

// Coupons Tab
txt = txt.replace(">Gutschein-Verwaltung<", ">{t('adminSettings.coupons.title')}<");
txt = txt.replace(">Neuer Gutschein</button>", ">{t('adminSettings.coupons.newBtn')}</button>");
txt = txt.replace(">Neuer Gutschein<", ">{t('adminSettings.coupons.newBtn')}<");
txt = txt.replace(">Gutscheincode<", ">{t('adminSettings.coupons.table.code')}<");
txt = txt.replace(">Rabatt<", ">{t('adminSettings.coupons.table.discount')}<");
txt = txt.replace(">Mindestumsatz<", ">{t('adminSettings.coupons.table.minOrder')}<");
txt = txt.replace(">Gültigkeit<", ">{t('adminSettings.coupons.table.validity')}<");
txt = txt.replace(">Nutzungen<", ">{t('adminSettings.coupons.table.uses')}<");
txt = txt.replace(">Keine Gutscheine vorhanden.<", ">{t('adminSettings.coupons.noCoupons')}<");
txt = txt.replace(">Abgelaufen<", ">{t('adminSettings.coupons.expired')}<");
txt = txt.replace(">Aktiv<", ">{t('adminSettings.coupons.active')}<");
txt = txt.replace(">Inaktiv<", ">{t('adminSettings.coupons.inactive')}<");
txt = txt.replace(/title="Bearbeiten"/, "title={t('adminSettings.coupons.edit')}");
txt = txt.replace(/title="Löschen"/, "title={t('adminSettings.coupons.delete')}");
txt = txt.replace(">% Rabatt<", "> {t('adminSettings.coupons.modal.percent')}<");

txt = txt.replace(">Gutschein bearbeiten<", ">{t('adminSettings.coupons.modal.editTitle')}<");
txt = txt.replace(">Rabatttyp<", ">{t('adminSettings.coupons.modal.discountType')}<");
txt = txt.replace(">Prozent (%)<", ">{t('adminSettings.coupons.modal.percent')}<");
txt = txt.replace(">Fester Betrag (€)<", ">{t('adminSettings.coupons.modal.fixed')}<");
txt = txt.replace(">Rabattwert<", ">{t('adminSettings.coupons.modal.discountValue')}<");
txt = txt.replace(">Max. Nutzungen<", ">{t('adminSettings.coupons.modal.maxUses')}<");
txt = txt.replace(/0 = unbegrenzt/g, "{t('adminSettings.coupons.modal.unlimited')}");
txt = txt.replace(">Mindestbestellwert<", ">{t('adminSettings.coupons.modal.minOrder')}<");
txt = txt.replace(/0 = kein Mindestbetrag/g, "{t('adminSettings.coupons.modal.noMinOrder')}");
txt = txt.replace(">Gültig ab<", ">{t('adminSettings.coupons.modal.validFrom')}<");
txt = txt.replace(">Gültig bis<", ">{t('adminSettings.coupons.modal.validUntil')}<");
txt = txt.replace(">Sofort aktivieren<", ">{t('adminSettings.coupons.modal.activateNow')}<");
txt = txt.replace(">Abbrechen<", ">{t('adminSettings.security.cancel')}<");
txt = txt.replace(">Abbrechen<", ">{t('adminSettings.security.cancel')}<");
txt = txt.replace(">Abbrechen<", ">{t('adminSettings.security.cancel')}<");
txt = txt.replace(">Speichern<", ">{t('adminSettings.coupons.modal.save')}<");
txt = txt.replace(">Erstellen<", ">{t('adminSettings.coupons.modal.create')}<");

// Notifications Tab
txt = txt.replace(">Kunden-Benachrichtigungen<", ">{t('adminSettings.notifications.clientTitle')}<");
txt = txt.replace(">E-Mail-Benachrichtigungen<", ">{t('adminSettings.notifications.emailSettings')}<");
txt = txt.replace(">Alle E-Mail-Benachrichtigungen an Kunden aktivieren/deaktivieren.</", ">{t('adminSettings.notifications.emailDesc')}</");
txt = txt.replace(">Buchungsbestätigung per E-Mail<", ">{t('adminSettings.notifications.emailConfirm')}<");
txt = txt.replace(">Sendet automatisch eine Bestätigung an den Kunden nach erfolgreicher Buchung.</", ">{t('adminSettings.notifications.emailConfirmDesc')}</");
txt = txt.replace(">Terminerinnerung (24h vorher)<", ">{t('adminSettings.notifications.emailReminder')}<");
txt = txt.replace(">Erinnert Kunden 24 Stunden vor Spielbeginn an ihren Termin.</", ">{t('adminSettings.notifications.emailReminderDesc')}</");
txt = txt.replace(">Stornierungsbestätigung<", ">{t('adminSettings.notifications.emailCancel')}<");
txt = txt.replace(">Benachrichtigt den Kunden, wenn eine Buchung storniert wurde.</", ">{t('adminSettings.notifications.emailCancelDesc')}</");

txt = txt.replace(">WhatsApp-Integration<", ">{t('adminSettings.notifications.waTitle')}<");
txt = txt.replace(">WhatsApp Nachrichten aktivieren<", ">{t('adminSettings.notifications.waEnable')}<");
txt = txt.replace(">Ermöglicht das Senden von Buchungsdetails direkt über WhatsApp.</", ">{t('adminSettings.notifications.waDesc')}</");
txt = txt.replace(">WhatsApp API Key<", ">{t('adminSettings.notifications.waKey')}<");
txt = txt.replace(">Diesen Schlüssel finden Sie in Ihrem Meta Business Dashboard.</", ">{t('adminSettings.notifications.waKeyDesc')}</");
txt = txt.replace(">Phone Number ID<", ">{t('adminSettings.notifications.waPhoneId')}<");
txt = txt.replace(">Die Phone Number ID aus Ihrem WhatsApp Business API Setup.</", ">{t('adminSettings.notifications.waPhoneDesc')}</");
txt = txt.replace(">Nachrichtenvorlagen<", ">{t('adminSettings.notifications.templates')}<");
txt = txt.replace(">Platzhalter:<", ">{t('adminSettings.notifications.placeholders')}<");
txt = txt.replace(">Buchungsbestätigung<", ">{t('adminSettings.notifications.confirmTpl')}<");
txt = txt.replace(">Stornierung<", ">{t('adminSettings.notifications.cancelTpl')}<");
txt = txt.replace(">Umbuchung<", ">{t('adminSettings.notifications.modTpl')}<");
txt = txt.replace(">Gutschein-Info<", ">{t('adminSettings.notifications.couponTpl')}<");

txt = txt.replace(">Admin-Berichte<", ">{t('adminSettings.notifications.adminReports')}<");
txt = txt.replace(">Täglicher Umsatzbericht<", ">{t('adminSettings.notifications.dailyRev')}<");
txt = txt.replace(">Zusammenfassung per E-Mail um 23:59 Uhr.</", ">{t('adminSettings.notifications.dailyRevDesc')}</");
txt = txt.replace(">Benachrichtigung bei neuen Buchungen<", ">{t('adminSettings.notifications.newBooking')}<");
txt = txt.replace(">Sofortige Info bei jeder neuen Reservierung.</", ">{t('adminSettings.notifications.newBookingDesc')}</");

txt = txt.replace(">System-Benachrichtigungen<", ">{t('adminSettings.notifications.sysAlerts')}<");
txt = txt.replace(">Sicherheitswarnungen<", ">{t('adminSettings.notifications.secAlerts')}<");
txt = txt.replace(">Warnung bei verdächtigen Login-Versuchen.</", ">{t('adminSettings.notifications.secAlertsDesc')}</");
txt = txt.replace(">Wartungsmeldungen<", ">{t('adminSettings.notifications.maintAlerts')}<");
txt = txt.replace(">Infos über geplante System-Updates.</", ">{t('adminSettings.notifications.maintAlertsDesc')}</");

// Security Tab
txt = txt.replace(">Admin-Sicherheit<", ">{t('adminSettings.security.adminSec')}<");
txt = txt.replace(">Passwort ändern<", ">{t('adminSettings.security.changePw')}<");
txt = txt.replace(">Aktuelles Passwort<", ">{t('adminSettings.security.currentPw')}<");
txt = txt.replace(">Neues Passwort<", ">{t('adminSettings.security.newPw')}<");
txt = txt.replace(">Mindestens 8 Zeichen, inkl. Sonderzeichen<", ">{t('adminSettings.security.pwHint')}<");
txt = txt.replace(">Passwort bestätigen<", ">{t('adminSettings.security.confirmPw')}<");
txt = txt.replace(">Passwort aktualisieren<", ">{t('adminSettings.security.updatePw')}<");
txt = txt.replace(">2-Faktor-Authentifizierung (2FA)<", ">{t('adminSettings.security.twoFactor')}<");
txt = txt.replace(">Zusätzliche Sicherheitsebene für Ihr Konto<", ">{t('adminSettings.security.twoFactorDesc')}<");
txt = txt.replace(">2FA einrichten<", ">{t('adminSettings.security.twoFactorSetup')}<");
txt = txt.replace(">Scannen Sie den QR-Code mit Google Authenticator oder einer kompatiblen App:<", ">{t('adminSettings.security.scanQr')}<");
txt = txt.replace(">Oder manuell eingeben:<", ">{t('adminSettings.security.manualEntry')}<");
txt = txt.replace(">6-stelliger Code<", ">{t('adminSettings.security.sixDigitCode')}<");
txt = txt.replace(">Aktivieren<", ">{t('adminSettings.security.activate')}<");

txt = txt.replace(">Sitzungs-Management<", ">{t('adminSettings.security.sessions')}<");
txt = txt.replace(">Alle anderen beenden<", ">{t('adminSettings.security.revokeAll')}<");
txt = txt.replace(">Aktive Sitzungen<", ">{t('adminSettings.security.activeSessions')}<");
txt = txt.replace(">Keine aktiven Sitzungen<", ">{t('adminSettings.security.noSessions')}<");
txt = txt.replace(/'Unbekanntes Gerät'/g, "t('adminSettings.security.unknownDevice')");
txt = txt.replace(">Aktuell<", ">{t('adminSettings.security.current')}<");
txt = txt.replace(/title="Sitzung beenden"/, "title={t('adminSettings.security.revoke')}");
txt = txt.replace(/'Gerade eben'/g, "t('adminSettings.security.justNow')");
txt = txt.replace(/Letzte Aktivität: /g, "{t('adminSettings.security.lastActivity')} ");
txt = txt.replace(">Wenn Sie eine Sitzung nicht erkennen, ändern Sie sofort Ihr Passwort und beenden Sie alle Sitzungen.</", ">{t('adminSettings.security.sessionWarning')}</");

txt = txt.replace(/Wird gespeichert\.\.\./g, "{t('adminSettings.saveBar.saving')}");
txt = txt.replace(/Wird überprüft\.\.\./g, "{t('adminSettings.security.verifying')}");

// Save Bar & placeholder
txt = txt.replace(">Diese Sektion wird demnächst implementiert.</", ">{t('adminSettings.placeholder.soon')}</");
txt = txt.replace(/Letzte Änderung:/, "{t('adminSettings.saveBar.lastChange')}");
txt = txt.replace(/Noch nicht gespeichert/, "{t('adminSettings.saveBar.notSaved')}");
txt = txt.replace(">Einstellungen Speichern<", ">{t('adminSettings.saveBar.save')}<");

fs.writeFileSync(tsxPath, txt);
