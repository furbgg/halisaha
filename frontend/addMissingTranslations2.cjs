const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, 'src', 'i18n', 'tr.json');
const dePath = path.join(__dirname, 'src', 'i18n', 'de.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// 1. Tournaments
const tourTR = {
  hero: {
    season: "2026 Sezonu",
    title1: "Yaklaşan",
    title2: "Turnuvalar",
    desc: "Avusturya'nın en iyi takımlarıyla yarışın. Takımınızı bugün kaydedin ve şan, şöhret ve para ödülü için mücadele edin."
  },
  badges: {
    open: "KAYITLAR AÇIK",
    few: "AZ YER KALDI",
    full: "DOLU",
    new: "YENİ"
  },
  details: {
    players: "{{count}}'e {{count}}",
    price: "Takım başı {{price}}€"
  },
  actions: {
    register: "TAKIM KAYDET",
    waitlist: "BEKLEME LİSTESİ"
  },
  hallOfFame: {
    subtitle: "EN İYİLERİN EN İYİSİ",
    title: "Şöhretler Müzesi",
    winner: "{{year}} Şampiyonu"
  }
};

const tourDE = {
  hero: {
    season: "Saison 2026",
    title1: "Kommende",
    title2: "Turniere",
    desc: "Messen Sie sich mit den besten Teams Österreichs. Melden Sie Ihr Team noch heute an und kämpfen Sie um Ruhm, Ehre und Preisgelder."
  },
  badges: {
    open: "Anmeldung Offen",
    few: "Wenige Plätze",
    full: "Ausgebucht",
    new: "Neu"
  },
  details: {
    players: "{{count}} gegen {{count}}",
    price: "{{price}}€ pro Team"
  },
  actions: {
    register: "TEAM ANMELDEN",
    waitlist: "WARTELISTE"
  },
  hallOfFame: {
    subtitle: "Die Besten der Besten",
    title: "Ruhmeshalle",
    winner: "{{year}} Sieger"
  }
};

// 2. Barrierefreiheit (Accessibility)
const barriereTR = {
  titlePart1: "Erişilebilirlik",
  titlePart2: "Beyanı",
  desc: "Bu web sitesinin erişilebilirliği hakkında bilgiler. {{company}}, web sitesini Federal Engellilik Eşitliği Yasası (BGStG) uyarınca erişilebilir kılmaya çalışmaktadır.",
  scope: "Bu erişilebilirlik beyanı <1>{{website}}</1> web sitesi için geçerlidir.",
  backHome: "Ana Sayfaya Dön",
  sections: {
    "1": {
      title: "Gereksinimlere Uyum Durumu",
      desc: "Bu web sitesi, aşağıdaki uyumsuzluklar ve istisnalar nedeniyle \"Web İçeriği Erişilebilirlik Yönergeleri – WCAG 2.1\" AA uyumluluk düzeyi ile kısmen uyumludur."
    },
    "2": {
      title: "Erişilebilir Olmayan İçerikler",
      desc: "Aşağıda listelenen içerikler, belirtilen nedenlerden dolayı erişilebilir değildir:",
      a: {
        title: "a) Erişilebilirlik Düzenlemeleri ile Uyumsuzluk",
        i1: "Bazı görsellerin henüz alternatif metinleri yoktur, bu nedenle bu bilgilere ekran okuyucu kullanıcıları erişemez. Bu metinleri sürekli olarak eklemek için çalışıyoruz.",
        i2: "Bazı gezinme öğelerindeki kontrastlar henüz gerekli standardı tam olarak karşılamamaktadır. Renk şemasının revizyonu planlanmaktadır."
      },
      b: {
        title: "b) Orantısız Yük",
        desc: "Videolarımız şu anda altyazılı değildir. Bunu yeni videolar için standart olarak uygulamak için bir çözüm üzerinde çalışıyoruz."
      }
    },
    "3": {
      title: "Beyanın Hazırlanması",
      desc: "Bu beyan <1>15 Ekim 2023</1> tarihinde hazırlanmıştır. Web sitesinin (AB) 2016/2102 Yönergesinin gerekliliklerini uygulamak için WZG ile uyumluluğunun değerlendirilmesi, WCAG 2.1 AA uyumluluk düzeyine göre bir öz değerlendirme formunda gerçekleştirilmiştir."
    },
    "4": {
      title: "Geri Bildirim ve İletişim Bilgileri",
      p1: "Bu web sitesindeki teklifler ve hizmetler sürekli olarak iyileştirilmekte, değiştirilmekte ve genişletilmektedir. Kullanılabilirlik ve erişilebilirlik bizim için büyük bir endişe kaynağıdır.",
      p2: "Web sitemizi kullanmanızı engelleyen engeller fark ederseniz - bu beyanda açıklanmayan sorunlar, erişilebilirlik gereksinimlerine uygunlukla ilgili eksiklikler - lütfen bunları e-posta ile bize bildirin."
    },
    "5": {
      title: "Uygulama Prosedürü",
      p1: "Yukarıdaki iletişim seçeneklerinden tatmin edici olmayan yanıtlar alırsanız, Avusturya Araştırma Teşvik Ajansı'na (FFG) şikayette bulunabilirsiniz.",
      p2: "FFG, şikayetleri elektronik olarak iletişim formu aracılığıyla kabul eder.",
      link: "Şikayet mercii iletişim formu"
    }
  }
};

const barriereDE = {
  titlePart1: "Barrierefreiheits",
  titlePart2: "erklärung",
  desc: "Informationen zur Zugänglichkeit dieser Website. {{company}} ist bemüht, ihre Website im Einklang mit dem Bundes-Behindertengleichstellungsgesetz (BGStG) barrierefrei zugänglich zu machen.",
  scope: "Diese Erklärung zur Barrierefreiheit gilt für die Website <1>{{website}}</1>.",
  backHome: "Zurück zur Startseite",
  sections: {
    "1": {
      title: "Stand der Vereinbarkeit mit den Anforderungen",
      desc: "Diese Website ist wegen der folgenden Unvereinbarkeiten und Ausnahmen teilweise mit der Konformitätsstufe AA der \"Richtlinien für barrierefreie Webinhalte Web – WCAG 2.1\" vereinbar."
    },
    "2": {
      title: "Nicht barrierefreie Inhalte",
      desc: "Die nachstehend aufgeführten Inhalte sind aus den folgenden Gründen nicht barrierefrei:",
      a: {
        title: "a) Unvereinbarkeit mit den Barrierefreiheitsbestimmungen",
        i1: "Manche Bilder haben noch keinen Alternativtext, sodass diese Information für Screenreader-Benutzer nicht zugänglich ist. Wir arbeiten daran, diese Texte laufend zu ergänzen.",
        i2: "Die Kontraste bei einigen Navigationselementen entsprechen noch nicht vollständig dem erforderlichen Standard. Eine Überarbeitung des Farbschemas ist in Planung."
      },
      b: {
        title: "b) Unverhältnismäßige Belastung",
        desc: "Unsere Videos sind derzeit noch nicht mit Untertiteln ausgestattet. Wir arbeiten an einer Lösung, dies für neue Videos standardmäßig umzusetzen."
      }
    },
    "3": {
      title: "Erstellung der Erklärung",
      desc: "Diese Erklärung wurde am <1>15. Oktober 2023</1> erstellt. Die Bewertung der Vereinbarkeit der Website mit dem WZG zur Umsetzung der Anforderungen der Richtlinie (EU) 2016/2102 erfolgte in Form eines Selbsttests nach WCAG 2.1 im Konformitätslevel AA."
    },
    "4": {
      title: "Feedback und Kontaktangaben",
      p1: "Die Angebote und Services auf dieser Website werden laufend verbessert, ausgetauscht und ausgebaut. Dabei ist uns die Bedienbarkeit und Zugänglichkeit ein großes Anliegen.",
      p2: "Wenn Ihnen Barrieren auffallen, die Sie an der Benutzung unserer Website behindern – Probleme, die in dieser Erklärung nicht beschrieben sind, Mängel in Bezug auf die Einhaltung der Barrierefreiheitsanforderungen – so bitten wir Sie, uns diese per E-Mail mitzuteilen."
    },
    "5": {
      title: "Durchsetzungsverfahren",
      p1: "Bei nicht zufriedenstellenden Antworten aus oben genannter Kontaktmöglichkeit können Sie sich mittels Beschwerde an die Österreichische Forschungsförderungsgesellschaft (FFG) wenden.",
      p2: "Die FFG nimmt über das Kontaktformular Beschwerden auf elektronischem Weg entgegen.",
      link: "Kontaktformular der Beschwerdestelle"
    }
  }
};

// 3. Ruckerstattung (Refund Policy)
const ruckerstattungTR = {
  titlePart1: "İade",
  titlePart2: "Politikası",
  desc: "{{company}}'taki iptaller, son dakika değişiklikleri ve iadeler hakkında bilgiler. Tüm oyuncularımız için adalet ve şeffaflık hedefliyoruz.",
  scope: "Bu politika, <1>{{website}}</1> üzerinden veya doğrudan yerinde rezerve edilen tüm sahalar, etkinlikler ve hizmetler için geçerlidir.",
  backHome: "Ana Sayfaya Dön",
  sections: {
    "1": {
      title: "1. Genel",
      desc: "Planların değişebileceğini anlıyoruz. İade politikamız, sahalarımızın tüm futbol tutkunları için kullanılabilir olmasını sağlarken esnek olacak şekilde tasarlanmıştır. Saha rezervasyonu yaparak aşağıdaki koşulları kabul etmiş olursunuz."
    },
    "2": {
      title: "2. Müşteri İptalleri",
      desc: "İptaller yazılı olarak veya web sitemizdeki kullanıcı hesabı üzerinden yapılmalıdır. İade miktarı, iptal zamanına bağlıdır:",
      mehr: {
        title: "Maç başlangıcından 48 saatten daha önce",
        desc: "Rezervasyon tutarının tamamı iade edilecektir. Alternatif olarak tutar, gelecekteki rezervasyonlar için hesaba kredi olarak yüklenebilir."
      },
      weniger: {
        title: "Maç başlangıcına 48 saatten daha az kala",
        desc: "Maalesef sahayı son dakikada tekrar kiralayamayacağımız için iade yapamıyoruz."
      }
    },
    "3": {
      title: "3. Randevu Değişiklikleri",
      desc: "Randevunuzu iptal etmek yerine ertelemek mi istiyorsunuz? Yeniden planlamalar aşağıdaki koşullar altında mümkündür:",
      i1: "Randevuyu, asıl maç saatinden 48 saat öncesine kadar ücretsiz olarak değiştirebilirsiniz.",
      i2: "Yeni tarih, orijinal rezervasyon tarihinden itibaren 30 gün içinde olmalıdır.",
      i3: "Fiyat farklılıkları (örneğin indirimli saatten ana saate geçiş) ödenmelidir."
    },
    "4": {
      title: "4. Operatör Kaynaklı İptal",
      desc: "{{company}} teknik sorunlar, bakım çalışmaları veya mücbir sebepler (örn. su hasarı, elektrik kesintisi) nedeniyle ayrılmış sahayı sağlayamazsa, elbette ödenen tutarın <1>%100 iadesi</1> tarafınıza yapılacaktır.",
      note: "* Bu gibi durumlarda, size hızlı bir şekilde e-posta veya telefon aracılığıyla ulaşacağız."
    },
    "5": {
      title: "5. Özel Teklifler & Kuponlar",
      desc: "Özel promosyonların bir parçası olarak yapılan veya promosyon çekleriyle ödenen rezervasyonların standart iade prosedürünün dışında bırakılabileceğini lütfen unutmayın."
    },
    "6": {
      title: "6. İşlem Süresi",
      desc: "Tüm iade taleplerini mümkün olan en kısa sürede işleme koymaya çalışıyoruz. Lütfen tutarın orijinal ödeme yönteminize iade edilmesi için <1>7-10 iş günü</1> bekleme süresi tanıyın."
    },
    "7": {
      title: "7. İadeler İçin İletişim",
      desc: "Faturanız veya belirli bir iade işlemi hakkında sorularınız mı var? Destek ekibimiz size yardımcı olmaktan memnuniyet duyacaktır."
    }
  }
};

const ruckerstattungDE = {
  titlePart1: "Rückerstattungs",
  titlePart2: "richtlinie",
  desc: "Informationen zu Stornierungen, Umbuchungen und Rückerstattungen bei {{company}}. Wir streben nach Fairness und Transparenz für alle unsere Spieler.",
  scope: "Diese Richtlinie gilt für alle Buchungen von Plätzen, Events und Dienstleistungen über die Website <1>{{website}}</1> oder direkt vor Ort.",
  backHome: "Zurück zur Startseite",
  sections: {
    "1": {
      title: "1. Allgemeines",
      desc: "Wir verstehen, dass Pläne sich ändern können. Unsere Rückerstattungsrichtlinie wurde entwickelt, um flexibel zu sein, während wir gleichzeitig sicherstellen müssen, dass unsere Plätze für alle Fußballbegeisterten verfügbar bleiben. Mit der Buchung eines Platzes akzeptieren Sie die folgenden Bedingungen."
    },
    "2": {
      title: "2. Stornierungen durch Kunden",
      desc: "Stornierungen müssen schriftlich oder über das Benutzerkonto auf unserer Website erfolgen. Die Rückerstattungshöhe richtet sich nach dem Zeitpunkt der Stornierung:",
      mehr: {
        title: "Mehr als 48 Stunden vor Spielbeginn",
        desc: "Sie erhalten eine vollständige Rückerstattung des Buchungsbetrags. Alternativ kann der Betrag als Guthaben für zukünftige Buchungen gutgeschrieben werden."
      },
      weniger: {
        title: "Weniger als 48 Stunden vor Spielbeginn",
        desc: "Leider ist keine Rückerstattung möglich, da wir den Platz so kurzfristig oft nicht mehr weitervermieten können."
      }
    },
    "3": {
      title: "3. Umbuchungen",
      desc: "Möchten Sie Ihren Termin verschieben, anstatt ihn zu stornieren? Umbuchungen sind unter folgenden Bedingungen möglich:",
      i1: "Umbuchungen sind bis zu 48 Stunden vor dem ursprünglichen Termin kostenlos möglich.",
      i2: "Der neue Termin muss innerhalb von 30 Tagen nach dem ursprünglichen Buchungsdatum liegen.",
      i3: "Preisdifferenzen (z.B. Wechsel von Nebenzeit zu Hauptzeit) müssen aufgezahlt werden."
    },
    "4": {
      title: "4. Rückerstattung bei Ausfall durch den Betreiber",
      desc: "Sollte die {{company}} aufgrund technischer Probleme, Wartungsarbeiten oder höherer Gewalt (z.B. Wasserschaden, Stromausfall) nicht in der Lage sein, den gebuchten Platz zur Verfügung zu stellen, erhalten Sie selbstverständlich eine <1>100%ige Rückerstattung</1> des gezahlten Betrags.",
      note: "* In solchen Fällen werden Sie umgehend per E-Mail oder Telefon kontaktiert."
    },
    "5": {
      title: "5. Besondere Angebote & Gutscheine",
      desc: "Bitte beachten Sie, dass Buchungen, die im Rahmen von Sonderaktionen getätigt wurden oder mit Aktionsgutscheinen bezahlt wurden, von der regulären Rückerstattung ausgeschlossen sein können. Käuflich erworbene Wertgutscheine können nicht in bar abgelöst werden, behalten aber ihre Gültigkeit bei einer Stornierung (Gutschrift auf Kundenkonto)."
    },
    "6": {
      title: "6. Bearbeitungszeit",
      desc: "Wir bemühen uns, alle Rückerstattungsanfragen so schnell wie möglich zu bearbeiten. Bitte erlauben Sie uns eine Bearbeitungszeit von <1>7-10 Werktagen</1>, bis der Betrag auf Ihrem ursprünglichen Zahlungsmittel gutgeschrieben ist."
    },
    "7": {
      title: "7. Kontakt für Rückerstattungen",
      desc: "Haben Sie Fragen zu Ihrer Rechnung oder einer spezifischen Rückerstattung? Unser Support-Team steht Ihnen gerne zur Verfügung."
    }
  }
};

// Booking Additions
const bookingAddTR = {
  cancellation: {
    title: "İptal",
    desc: "Maçtan 48 saat öncesine kadar ücretsiz iptal."
  },
  equipment: {
    title: "Ekipman",
    desc: "Duşlar ve giyinme odaları dahil."
  },
  happyHour: {
    title: "Happy Hour",
    active: "Happy Hour Aktif!",
    discount: "İndirim"
  },
  chooseTime: "ZAMANINI SEÇ",
  timezone: "Saat Dilimi",
  selected: "Seçili",
  unavailable: "Mevcut Değil",
  occupied: "Dolu"
};

const bookingAddDE = {
  cancellation: {
    title: "Stornierung",
    desc: "Kostenlos bis 48h vor Spielbeginn."
  },
  equipment: {
    title: "Ausstattung",
    desc: "Duschen und Umkleiden inklusive."
  },
  happyHour: {
    title: "Happy Hour",
    active: "Happy Hour Aktiv!",
    discount: "Rabatt"
  },
  chooseTime: "WÄHLE DEINE ZEIT",
  timezone: "Zeitzone",
  selected: "Ausgewählt",
  unavailable: "Nicht verfügbar",
  occupied: "Belegt"
};

// Add to objects
trData.tournaments = tourTR;
deData.tournaments = tourDE;

trData.barrierefreiheit = barriereTR;
deData.barrierefreiheit = barriereDE;

trData.ruckerstattung = ruckerstattungTR;
deData.ruckerstattung = ruckerstattungDE;

if (!trData.booking.step1) trData.booking.step1 = {};
Object.assign(trData.booking.step1, bookingAddTR);

if (!deData.booking.step1) deData.booking.step1 = {};
Object.assign(deData.booking.step1, bookingAddDE);

// Safe save
fs.writeFileSync(trPath, JSON.stringify(trData, null, 2));
fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));
console.log('Successfully injected deep translations into tr.json and de.json');

