const fs = require('fs');
const path = require('path');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminLogin = {
  nav: {
    home: 'Startseite',
    contact: 'Kontakt'
  },
  status: 'System-Status: Online',
  error: {
    title: 'Login Fehlgeschlagen',
    desc: 'Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.',
    invalid: 'Ungültige Anmeldedaten.',
    tooMany: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.'
  },
  welcome: {
    title: 'Admin-Bereich',
    desc: 'Willkommen zurück! Bitte loggen Sie sich ein,<br/> um Ihre Sportanlage zu verwalten.'
  },
  form: {
    email: 'E-Mail Adresse',
    emailPlaceholder: 'admin@example.com',
    password: 'Passwort',
    passwordPlaceholder: '••••••••',
    remember: 'Angemeldet bleiben',
    forgot: 'Passwort vergessen?',
    submit: 'Anmelden'
  },
  footer: 'Management-Portal für professionelle<br/> Sportanlagen & Reservierungssysteme',
  mfa: {
    tag: 'Sicherheits-Check',
    title: 'Zwei-Faktor-Authentifizierung',
    desc: 'Bitte geben Sie den Code aus Ihrer Google Authenticator App ein.',
    submit: 'Verifizieren',
    issues: 'Probleme beim Login?',
    backup: 'Backup-Code verwenden',
    check: 'Sicherheits-Check für Admin-Bereich • SSL Verschlüsselt'
  },
  support: 'Technischer Support',
  copyright: '© 2026 Randevu Halı Saha'
};

tr.adminLogin = {
  nav: {
    home: 'Ana Sayfa',
    contact: 'İletişim'
  },
  status: 'Sistem Durumu: Çevrimiçi',
  error: {
    title: 'Giriş Başarısız',
    desc: 'Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
    invalid: 'Geçersiz giriş bilgileri.',
    tooMany: 'Çok fazla deneme. Lütfen 15 dakika bekleyin.'
  },
  welcome: {
    title: 'Yönetici Paneli',
    desc: 'Tekrar hoş geldiniz! Spor tesisinizi<br/> yönetmek için giriş yapın.'
  },
  form: {
    email: 'E-Posta Adresi',
    emailPlaceholder: 'admin@ornek.com',
    password: 'Şifre',
    passwordPlaceholder: '••••••••',
    remember: 'Beni hatırla',
    forgot: 'Şifremi unuttum?',
    submit: 'Giriş Yap'
  },
  footer: 'Profesyonel Spor Tesisleri & Rezervasyon Sistemleri<br/> için Yönetim Portalı',
  mfa: {
    tag: 'Güvenlik Kontrolü',
    title: 'İki Faktörlü Kimlik Doğrulama',
    desc: 'Lütfen Google Authenticator uygulamanızdaki kodu girin.',
    submit: 'Doğrula',
    issues: 'Girişte sorun mu yaşıyorsunuz?',
    backup: 'Yedek kodu kullan',
    check: 'Yönetici Paneli için Güvenlik Kontrolü • SSL Şifreli'
  },
  support: 'Teknik Destek',
  copyright: '© 2026 Randevu Halı Saha'
};

de.adminAuth = {
  forgot: {
    support: 'Support',
    contact: 'Kontakt',
    successTitle: 'E-Mail gesendet!',
    successDesc: 'Wir haben einen Link zum Zurücksetzen Ihres Passworts an <span className="text-white font-medium">{{email}}</span> gesendet. Bitte überprüfen Sie auch Ihren Spam-Ordner.',
    backToLogin: 'ZURÜCK ZUM LOGIN',
    sending: 'Senden...',
    resendNotReceived: 'E-Mail nicht erhalten? Erneut senden',
    title: 'Passwort vergessen?',
    desc: 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, um Ihr Passwort zurückzusetzen.',
    emailLabel: 'E-Mail Adresse',
    emailPlaceholder: 'admin@soccerarena.at',
    submit: 'LINK SENDEN',
    back: 'Zurück zum Login',
    techSupport: 'Technischer Support',
    copyright: '© 2026 Randevu Halı Saha',
    resendTitle: 'Link erneut gesendet!',
    resendDesc: 'Wir haben einen neuen Link zum Zurücksetzen Ihres Passworts an Ihre E-Mail-Adresse gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.',
    resendOk: 'VERSTANDEN',
    errorGeneric: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    errorTooMany: 'Zu viele Versuche. Bitte warten Sie 15 Minuten.'
  },
  reset: {
    errInvalidToken: 'Ungültiger oder fehlender Token. Bitte fordern Sie einen neuen Link an.',
    errMismatch: 'Die Passwörter stimmen nicht überein.',
    errWeak: 'Das Passwort erfüllt nicht die Sicherheitsanforderungen.',
    errFailed: 'Das Passwort konnte nicht zurückgesetzt werden. Möglicherweise ist der Link abgelaufen.',
    support: 'Support',
    contact: 'Kontakt',
    successTitle: 'Passwort geändert!',
    successDesc: 'Ihr neues Passwort wurde erfolgreich gespeichert. Sie werden in Kürze zur Anmeldung weitergeleitet...',
    title: 'Neues Passwort festlegen',
    desc: 'Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es.',
    newLabel: 'Neues Passwort',
    placeholder: '••••••••',
    confirmLabel: 'Passwort bestätigen',
    info: 'Min. 8 Zeichen, Groß-, Kleinbuchstaben, Zahl & Sonderzeichen',
    submit: 'PASSWORT SPEICHERN',
    cancel: 'Abbrechen',
    techSupport: 'Technischer Support',
    copyright: '© 2026 Randevu Halı Saha'
  }
};

tr.adminAuth = {
  forgot: {
    support: 'Destek',
    contact: 'İletişim',
    successTitle: 'E-Posta gönderildi!',
    successDesc: '<span className="text-white font-medium">{{email}}</span> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen spam klasörünüzü de kontrol edin.',
    backToLogin: 'GİRİŞE DÖN',
    sending: 'Gönderiliyor...',
    resendNotReceived: 'E-Posta ulaşmadı mı? Tekrar gönder',
    title: 'Şifremi unuttum?',
    desc: 'E-posta adresinizi girin. Şifrenizi sıfırlamanız için size bir bağlantı göndereceğiz.',
    emailLabel: 'E-Posta Adresi',
    emailPlaceholder: 'admin@halisaha.com',
    submit: 'BAĞLANTIYI GÖNDER',
    back: 'Girişe Dön',
    techSupport: 'Teknik Destek',
    copyright: '© 2026 Randevu Halı Saha',
    resendTitle: 'Bağlantı tekrar gönderildi!',
    resendDesc: 'E-posta adresinize yeni bir şifre sıfırlama bağlantısı gönderdik. Lütfen spam klasörünüzü de kontrol edin.',
    resendOk: 'ANLADIM',
    errorGeneric: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    errorTooMany: 'Çok fazla deneme. Lütfen 15 dakika bekleyin.'
  },
  reset: {
    errInvalidToken: 'Geçersiz veya eksik belirteç (token). Lütfen yeni bir bağlantı isteyin.',
    errMismatch: 'Şifreler eşleşmiyor.',
    errWeak: 'Şifre güvenlik gereksinimlerini karşılamıyor.',
    errFailed: 'Şifre sıfırlanamadı. Bağlantının süresi dolmuş olabilir.',
    support: 'Destek',
    contact: 'İletişim',
    successTitle: 'Şifre değiştirildi!',
    successDesc: 'Yeni şifreniz başarıyla kaydedildi. Kısa süre içinde giriş sayfasına yönlendirileceksiniz...',
    title: 'Yeni Şifre Belirle',
    desc: 'Lütfen yeni şifrenizi girin ve onaylayın.',
    newLabel: 'Yeni Şifre',
    placeholder: '••••••••',
    confirmLabel: 'Şifreyi Onayla',
    info: 'En az 8 karakter, büyük-küçük harf, sayı ve özel karakter',
    submit: 'ŞİFREYİ KAYDET',
    cancel: 'İptal',
    techSupport: 'Teknik Destek',
    copyright: '© 2026 Randevu Halı Saha'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));
