const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, 'src', 'i18n', 'tr.json');
const dePath = path.join(__dirname, 'src', 'i18n', 'de.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));

const agbTR = {
  tag: "Yasal",
  titlePart1: "Genel",
  titlePart2: "Şartlar ve Koşullar",
  subtitle: "Hizmetlerimizi kullanmadan önce lütfen bu koşulları dikkatlice okuyun. Şeffaflık ve adalet bizim için önemlidir.",
  date: "Durum: Mayıs 2024",
  sections: [
    {
      title: "Kapsam",
      p1: "Bu Genel Şartlar ve Koşullar (bundan böyle \"GŞK\" olarak anılacaktır), {{company}} spor tesisinin (bundan böyle \"İşletmeci\" olarak anılacaktır) müşteriler ve ziyaretçiler (bundan böyle \"Kullanıcı\" olarak anılacaktır) tarafından kullanımını düzenler.",
      p2: "Bir saha rezervasyonu yaparak veya tesise girerek, kullanıcı bu GŞK'yı geçerli sürümünde kabul eder. Kullanıcının farklı şartları, işletmeci açıkça yazılı olarak kabul etmedikçe sözleşmenin parçası olmaz."
    },
    {
      title: "Rezervasyon ve Sözleşme",
      p1: "Saha rezervasyonları temel olarak web sitemizdeki çevrimiçi rezervasyon sistemi üzerinden yapılır.",
      i1: "Kullanıcı ve İşletmeci arasındaki sözleşme, kullanıcı rezervasyon sürecini tamamladığında ve e-posta ile bir rezervasyon onayı aldığında kurulur.",
      i2: "Rezervasyon onayı, rezervasyonla ilgili tüm detayları (tarih, saat, saha numarası, fiyat) içerir.",
      i3: "Kullanıcı, rezervasyon onayındaki bilgileri doğruluk açısından hemen kontrol etmek ve herhangi bir hatayı derhal bildirmek zorundadır."
    },
    {
      title: "Ödeme Koşulları",
      p1: "Saha kullanım fiyatları web sitesindeki güncel fiyat listesine dayanmaktadır. Tüm fiyatlar Euro (EUR) cinsindendir.",
      i1: "Ödeme yöntemleri: Ödeme, sunulan ödeme yöntemleri (Kredi Kartı, Apple Pay, Google Pay) aracılığıyla çevrimiçi olarak yapılır.",
      i2: "Vade: Fatura tutarının tamamı rezervasyon anında veya en geç maç başlamadan önce ödenmelidir.",
      i3: "Önceden tam ödeme yapılmadan sahanın kullanılmasına izin verilmez."
    },
    {
      title: "İptal ve İade",
      p1: "İptaller yazılı olarak (e-posta yoluyla) veya çevrimiçi rezervasyon sistemindeki kullanıcı hesabı üzerinden yapılmalıdır.",
      b1Title: "Maçtan 48 saat öncesine kadar",
      b1Desc: "Ücretsiz iptal mümkündür. Zaten ödenmiş olan tutar tamamen iade edilecektir.",
      b2Title: "48 saat içinde",
      b2Desc: "İade yapılmaz. Geç iptal veya gelinmemesi (No-Show) durumunda tam tutar alıkonur."
    },
    {
      title: "Tesisin Kullanımı ve Kurallar",
      p1: "Tesisin kullanımına yalnızca rezerve edilen sürelerde izin verilir.",
      i1: "Kullanıcılar, sonraki grupların zamanında başlayabilmesi için rezervasyon sürelerinin sonunda tesisten hemen ayrılmalıdır.",
      i2: "Tesiste asılı olan ev kuralları ve personelin talimatları geçerlidir.",
      i3: "Oyun alanlarına yalnızca uygun spor ayakkabılarıyla (çivili kramponlar yasaktır) girilebilir.",
      i4: "Spor alanlarında sigara içmek ve alkol tüketmek yasaktır."
    },
    {
      title: "Sorumluluk",
      p1: "{{company}} ve tesislerinin kullanımı kişinin kendi sorumluluğundadır.",
      i1: "İşletmeci, kaba ihmal veya kasıttan kaynaklanmadığı sürece tesisin kullanımından kaynaklanan hasarlar veya yaralanmalardan sorumlu değildir.",
      i2: "Getirilen değerli eşyalar, giysiler ve ekipmanlar için sorumluluk kabul edilmez. Değerli eşyalarınızı soyunma odalarında bırakmamanızı öneririz.",
      i3: "Tesisteki kasıtlı hasarlar için sebep olan kişi veya rezervasyon yapan kişi tamamen sorumludur."
    },
    {
      title: "İşletmeci Tarafından İptal",
      p1: "İşletmeci, önemli bir nedenle (örn. teknik sorunlar, sahanın oynanamaz durumu, mücbir sebepler) rezervasyonları iptal etme hakkını saklı tutar. Bu durumda, zaten ödenmiş olan tutar tamamen iade edilecektir. Daha fazla tazminat talebi kabul edilmez."
    },
    {
      title: "Veri Koruma",
      p1: "Kişisel verilerinizin korunması bizim için önemlidir. Verilerinizin toplanması, işlenmesi ve kullanılması hakkında bilgileri ayrıntılı Gizlilik Politikamızda bulabilirsiniz."
    },
    {
      title: "Şartların Değiştirilmesi",
      p1: "İşletmeci, bu GŞK'yı her zaman değiştirme hakkını saklı tutar. Değişiklikler web sitesinde duyurulacak ve yayınlandıktan sonra yapılan tüm rezervasyonlar için geçerli olacaktır."
    },
    {
      title: "Yargı Yetkisi ve Yasa",
      p1: "Avusturya hukuku geçerlidir. Müşteri bir girişimci olmadığı veya Avusturya'da genel bir yargı yetkisine sahip olmadığı sürece, sözleşme ilişkisinden kaynaklanan tüm anlaşmazlıklar için Wels yargı yeri olarak kabul edilir."
    }
  ],
  footer: {
    title: "GŞK'larımız hakkında sorularınız mı var?",
    subtitle: "Destek ekibimiz size yardımcı olmaktan memnuniyet duyacaktır.",
    button: "İletişime Geç"
  },
  backHome: "Ana Sayfaya Dön"
};

const agbDE = {
  tag: "Rechtliches",
  titlePart1: "Allgemeine",
  titlePart2: "Geschäftsbedingungen",
  subtitle: "Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unsere Dienste nutzen. Transparenz und Fairness sind uns wichtig.",
  date: "Stand: Mai 2024",
  sections: [
    {
      title: "Geltungsbereich",
      p1: "Diese Allgemeine Geschäftsbedingungen (nachfolgend \"AGB\" genannt) regeln die Nutzung der Sportanlage {{company}} (nachfolgend \"Betreiber\" genannt) durch Kunden und Besucher (nachfolgend \"Nutzer\" genannt).",
      p2: "Mit der Buchung eines Spielfeldes oder dem Betreten der Anlage erkennt der Nutzer diese AGB in ihrer jeweils gültigen Fassung an. Abweichende Bedingungen des Nutzers werden nicht Vertragsbestandteil, es sei denn, der Betreiber stimmt ihrer Geltung ausdrücklich schriftlich zu."
    },
    {
      title: "Buchung & Vertragsabschluss",
      p1: "Die Buchung von Spielfeldern erfolgen vorrangig über das Online-Buchungssystem auf unserer Website.",
      i1: "Der Vertrag zwischen dem Nutzer und dem Betreiber kommt zustande, sobald der Nutzer den Buchungsprozess abgeschlossen hat und eine Buchungsbestätigung per E-Mail erhält.",
      i2: "Die Buchungsbestätigung enthält alle relevanten Details zur Buchung (Datum, Uhrzeit, Platznummer, Preis).",
      i3: "Der Nutzer ist verpflichtet, die Angaben in der Buchungsbestätigung umgehend auf Richtigkeit zu überprüfen und etwaige Fehler unverzüglich mitzuteilen."
    },
    {
      title: "Zahlungsbedingungen",
      p1: "Die Preise für die Nutzung der Spielfelder richten sich nach der aktuellen Preisliste auf der Website. Alle Preise sind in Euro (EUR) angegeben.",
      i1: "Zahlungsmethoden: Die Zahlung erfolgt online über die angebotenen Zahlungsmethoden (Kreditkarte, Apple Pay, Google Pay).",
      i2: "Fälligkeit: Der volle Rechnungsbetrag ist unmittelbar bei Buchung oder spätestens vor Spielantritt fällig.",
      i3: "Eine Nutzung des Platzes ohne vorherige vollständige Bezahlung ist nicht gestattet."
    },
    {
      title: "Stornierung & Rückerstattung",
      p1: "Stornierungen müssen schriftlich (per E-Mail) oder über das Benutzerkonto im Online-Buchungssystem erfolgen.",
      b1Title: "Bis 48h vor Spielbeginn",
      b1Desc: "Kostenfreie Stornierung möglich. Der bereits gezahlte Betrag wird vollständig zurückerstattet.",
      b2Title: "Innerhalb von 48h",
      b2Desc: "Keine Rückerstattung. Bei später Stornierung oder Nichterscheinen (\"No-Show\") wird der volle Betrag einbehalten."
    },
    {
      title: "Nutzung der Anlage & Hausordnung",
      p1: "Die Nutzung der Anlage ist nur während der gebuchten Zeiten gestattet.",
      i1: "Nutzer müssen die Anlage pünktlich zum Ende ihrer Buchungszeit verlassen, um nachfolgenden Gruppen einen pünktlichen Beginn zu ermöglichen.",
      i2: "Es gelten die in der Anlage ausgehängte Hausordnung sowie die Anweisungen des Personals.",
      i3: "Das Betreten der Spielfelder ist nur mit geeignetem Sportschuhwerk gestattet (keine Schraubstollen).",
      i4: "Rauchen und Alkoholkonsum sind auf den Sportflächen untersagt."
    },
    {
      title: "Haftung",
      p1: "Die Nutzung der {{company}} und ihrer Einrichtungen erfolgt auf eigene Gefahr.",
      i1: "Der Betreiber haftet nicht für Schäden oder Verletzungen, die durch die Nutzung der Anlage entstehen, es sei denn, sie beruhen auf grober Fahrlässigkeit oder Vorsatz des Betreibers.",
      i2: "Für mitgebrachte Wertgegenstände, Kleidung und Ausrüstung wird keine Haftung übernommen. Wir empfehlen, keine Wertsachen in den Umkleiden zurückzulassen.",
      i3: "Für mutwillige Beschädigungen an der Einrichtung haftet der Verursacher bzw. der Buchende vollumfänglich."
    },
    {
      title: "Rücktritt durch den Betreiber",
      p1: "Der Betreiber behält sich das Recht vor, Buchungen aus wichtigem Grund (z.B. technische Probleme, Unbespielbarkeit des Platzes, höhere Gewalt) abzusagen. In diesem Fall wird der bereits gezahlte Betrag vollständig erstattet. Weitergehende Schadensersatzansprüche sind ausgeschlossen."
    },
    {
      title: "Datenschutz",
      p1: "Der Schutz Ihrer persönlichen Daten ist uns wichtig. Informationen zur Erhebung, Verarbeitung und Nutzung Ihrer Daten finden Sie in unserer separaten Datenschutzerklärung."
    },
    {
      title: "Änderungen der AGB",
      p1: "Der Betreiber behält sich vor, diese AGB jederzeit zu ändern. Die Änderungen werden auf der Website bekannt gegeben und gelten für alle Buchungen, die nach der Veröffentlichung getätigt werden."
    },
    {
      title: "Gerichtsstand & Recht",
      p1: "Es gilt österreichisches Recht. Als Gerichtsstand für alle Streitigkeiten aus dem Vertragsverhältnis wird Wels vereinbart, sofern der Kunde Unternehmer ist oder keinen allgemeinen Gerichtsstand in Österreich hat."
    }
  ],
  footer: {
    title: "Haben Sie Fragen zu unseren AGB?",
    subtitle: "Unser Support-Team steht Ihnen gerne zur Verfügung.",
    button: "Kontakt aufnehmen"
  },
  backHome: "Zurück zur Startseite"
};

trData.agb = agbTR;
deData.agb = agbDE;

fs.writeFileSync(trPath, JSON.stringify(trData, null, 2));
fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));

console.log('AGB translations added');
