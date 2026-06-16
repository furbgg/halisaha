# ⚽ HalıSaha Reservierungssystem

## Projektübersicht / Proje Özeti

Avusturya'da faaliyet gösteren bir halı saha işletmesi için tam kapsamlı rezervasyon ve yönetim sistemi.
4 adet normal halı saha + 1 adet balon futbol sahası.

---

## 🏗️ Tech Stack

| Katman | Teknoloji | Versiyon | Neden |
|--------|-----------|----------|-------|
| Backend | Java + Spring Boot | Java 17, SB 3.x | Güvenlik, kurumsal kalite, güvenilir |
| Veritabanı | PostgreSQL | 16 | ACID uyumlu, güçlü constraint desteği |
| ORM | Hibernate (JPA) | SB3 ile gelen | Entity mapping, lazy loading |
| Migration | Flyway | Güncel | Versiyonlu DB migration |
| Auth | Spring Security + JWT | - | Stateless auth, role-based access |
| 2FA | Google Authenticator (TOTP) | - | Admin girişi için ek güvenlik |
| Frontend | React + TypeScript | React 18+ | Tip güvenliği, büyük ekosistem |
| Styling | Tailwind CSS | 3.x | Hızlı tema, dark mode, animasyonlar |
| Animasyonlar | Framer Motion | Güncel | React-native animasyonlar |
| i18n | react-i18next | Güncel | Almanca (varsayılan) + Türkçe |
| SMS/Bildirim | Twilio (opsiyonel) | - | SMS doğrulama + hatırlatma |
| Ödeme | Stripe | Güncel | Online ödeme (kart, Apple Pay, Google Pay) |
| Email | SendGrid / Spring Mail | - | Rezervasyon onayı + hatırlatma |
| Deployment | Railway (EU Region) | Pro Plan | ~€15-20/ay, EU sunucu (DSGVO) |
| Containerization | Docker + Docker Compose | - | Lokal geliştirme + deployment |

---

## 🏟️ Saha Yapısı

```
Sahalar:
├── Platz 1 (REGULAR) — Küçük boyut, halı zemin futbol sahası — 30 EUR/saat
├── Platz 2 (REGULAR) — Küçük boyut, halı zemin futbol sahası — 30 EUR/saat
├── Platz 3 (REGULAR) — Küçük boyut, halı zemin futbol sahası — 35 EUR/saat
├── Platz 4 (REGULAR) — Küçük boyut, halı zemin futbol sahası — 35 EUR/saat
└── Bubble Arena (BUBBLE) — Şişme balon içinde futbol — 50 EUR/saat
```

- **REGULAR sahalar:** 1 saat veya 3 saat seçilebilir (`allowed_durations = {1, 3}`)
- **BUBBLE saha:** 1 saat veya 2 saat seçilebilir (`allowed_durations = {1, 2}`) — 3 saat balonun içinde çok yorucu
- **Bubble Arena'da balon ekipmanları sahaya dahildir** — ayrıca kiralama yoktur
- Her sahanın çalışma saatleri ayrı tanımlanabilir
- **Fiyatlar field bazlıdır, admin saha düzenleme ekranından değiştirir** — ayrı Settings endpointi yoktur
- Fiyat değişikliği sadece yeni rezervasyonları etkiler; mevcut rezervasyonlar kendi `total_price` değerini korur
- Sahalar aktif/pasif yapılabilir (bakım vs.)

### Saha Tipleri (Kod Düzeyinde)
```java
public enum FieldType {
    REGULAR,  // Normal halı saha
    BUBBLE    // Balon futbol sahası
}
```
Frontend'de FieldSelector bileşeninde iki kategori ayrı gösterilir:
- "Fußballplätze" (4 halı saha kartı)
- "Bubble Football" (1 balon saha kartı)

---

## 👥 Kullanıcı Rolleri & Akışlar

### 1. Misafir (Hesapsız Kullanıcı)
- Siteyi açar → Ana sayfa (fotoğraflı hero + CTA butonları)
- "Rezervasyon Yap" butonuyla direkt rezervasyon yapabilir
- Hesap açmadan: isim, telefon, email girer
- **Telefon doğrulama opsiyonel modüldür:** MVP'de kapalı, `app_settings` üzerinden açılabilir
  - `phone_verification_required = 'false'` (varsayılan) → direkt rezervasyon
  - `phone_verification_required = 'true'` → 6 haneli SMS kodu, 5 dk geçerli
  - SMS maliyeti müşteriye ayrı faturalandırılır
- Rezervasyon sonrası onay emaili/SMS'i alır
- Email/SMS'teki link ile rezervasyonunu görüntüler, değiştirir veya iptal eder
- Son 1 saat kala hatırlatma SMS/email alır

### 2. Kayıtlı Kullanıcı (Konto)
- Hesap oluşturur → benzersiz ID verilir
- Avantaj: bilgileri kayıtlı, her seferinde girmez
- Rezervasyonlarında ID'si görünür
- Kendi panelinden geçmiş ve gelecek rezervasyonları görür
- Rezervasyon değiştirme/iptal sayfası

### 3. Yönetici (Admin)
- Google Authenticator ile 2FA giriş
- Bilgisayarında hep açık kalacak dashboard
- Tüm rezervasyonları görür, değiştirir, iptal eder
- Günlük/aylık gelir raporları
- En çok kazandıran saatler, en boş saatler analizi
- Kampanya önerileri (boş saatlere indirim)
- Malzeme takip listesi (kramponlar, yelekler, toplar vb.)
- Personel listesi yönetimi
- Saha fiyat ve çalışma saati ayarları

---

## 🎨 UI/UX Yapısı

### Site Yapısı (Tüm Kullanıcılar)
```
┌─────────────────────────────────────────┐
│ ☰ (Hamburger)              🌙/☀️ 🇩🇪/🇹🇷 │  ← Header
├─────────────────────────────────────────┤
│                                         │
│   [Hero Image - Halı Saha Fotoğrafı]   │
│                                         │
│   ┌─────────────┐ ┌──────────────────┐  │
│   │ Jetzt       │ │ Reservierung     │  │
│   │ Reservieren │ │ Ändern/Stornieren│  │
│   └─────────────┘ └──────────────────┘  │
│                                         │
│   Sahalarımız / Fiyatlar / İletişim     │
│                                         │
└─────────────────────────────────────────┘
```

### Sidebar (Sol üst hamburger menüden açılır)
```
Misafir Görünümü:
├── 🏠 Startseite (Ana Sayfa)
├── 📅 Reservierung (Rezervasyon Yap)
├── 🔄 Reservierung Verwalten (Değiştir/İptal)
└── 🔐 Anmelden (Giriş) — Yönetici/Kullanıcı

Admin Görünümü (giriş sonrası):
├── 📊 Dashboard
├── 📅 Reservierungen Verwalten
├── 📦 Materialliste (Malzeme Takip)
├── 👥 Personalliste (Personel)
├── ⚙️ Einstellungen (Ayarlar)
└── 🚪 Abmelden (Çıkış)
```

### Tema & Animasyonlar
- **Dark Mode** varsayılan, Light Mode geçiş butonu
- Renk paleti: Koyu yeşil (#0D1F0E), neon yeşil (#39FF14), koyu arka plan (#0A0A0A)
- Futbol temalı buton animasyonları (hover'da top sektirme efekti vb.)
- Framer Motion ile sayfa geçişleri
- Glassmorphism kartlar

### Figma Arama Anahtar Kelimeleri
- "Sports booking dashboard"
- "Football reservation UI"
- "Dark mode booking app"
- "Soccer landing page"
- "Green dark dashboard glassmorphism"
- "Admin dashboard sports facility"
- "Appointment scheduling dark"

---

## 📅 Rezervasyon Sistemi Detayları

### Zaman Dilimleri
- Gün saatlere bölünür (örn: 09:00 - 23:00)
- Rezervasyon seçenekleri: **1 saat** veya **3 saat**
- Her saat dilimi her saha için ayrı ayrı dolu/boş gösterilir
- Frontend'de takvim görünümü + saat grid'i

### Çift Rezervasyon Önleme (CRITICAL)

**⚠️ Bu sistemin en kritik parçası. Race condition kesinlikle önlenmeli.**

#### Katman 1: Database Unique Constraint (Son Savunma)
```sql
-- PostgreSQL partial unique index
CREATE UNIQUE INDEX idx_unique_active_reservation
ON reservations (field_id, start_time)
WHERE status != 'CANCELLED';
```
İki kişi aynı anda aynı slotu kaydetmeye çalışırsa, DB seviyesinde ikincisi HATA alır.

#### Katman 2: Pessimistic Locking (SELECT FOR UPDATE)
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT r FROM Reservation r WHERE r.field.id = :fieldId AND r.startTime = :startTime AND r.status != 'CANCELLED'")
Optional<Reservation> findAndLockSlot(@Param("fieldId") Long fieldId, @Param("startTime") LocalDateTime startTime);
```
Birinci kişi işlem yaparken, ikinci kişi aynı satırı okuyamaz bile. Transaction bitene kadar bekler.

#### Katman 3: Temporary Hold (Opsiyonel, UX için)
```sql
-- Kullanıcı saat seçtiğinde geçici kilit
CREATE TABLE slot_holds (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT NOT NULL REFERENCES fields(id),
    start_time TIMESTAMP NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unique_hold
ON slot_holds (field_id, start_time)
WHERE expires_at > NOW();
```
- Kullanıcı slot seçtiğinde hold oluşturulur
- Scheduled job süresi dolan hold'ları temizler
- Müsaitlik kontrolünde hem reservations hem slot_holds kontrol edilir
- **Hold süresi `app_settings` tablosundan okunur** (`hold_duration_minutes`, varsayılan: 5)
- Admin Settings sayfasından `PUT /api/admin/settings/hold_duration_minutes` ile değiştirilebilir
- `SlotHoldService`'de hardcoded değil: `appSettingsService.getInt("hold_duration_minutes", 5)`

#### Katman 4: Frontend Gösterim (Sadece UX)
- Slot seçildiğinde "Wird reserviert..." göster
- WebSocket veya polling ile diğer kullanıcılara anlık dolu/boş güncelle
- **Frontend kilitleme ASLA tek başına güvenlik sağlamaz — sadece UX amaçlı**

### Fiyat Hesaplama
```
Toplam = (Saha Saatlik Ücreti × Süre) + (Malzeme Kiralama Toplamı)

Örnek:
  Platz 1 × 1 saat                     = 30 EUR
  + Krampon 45 numara × 2 çift × 1 saat = 6 EUR
  + Kaleci eldiveni L × 1 × 1 saat      = 2 EUR
  TOPLAM                                 = 38 EUR
```

### Online Ödeme Sistemi (Stripe)
```
Ödeme yöntemleri:
├── Kredi/Banka Kartı (Visa, Mastercard) → Stripe
├── Apple Pay → Stripe üzerinden
├── Google Pay → Stripe üzerinden
└── Vor Ort (sahada ödeme) → opsiyonel seçenek
```

**Stripe seçilme sebebi:**
- Avusturya'da tam destekli
- Apple Pay + Google Pay tek entegrasyonla geliyor
- PCI DSS uyumunu Stripe hallediyor (kart bilgisi senin sunucuna gelmez)
- Test mode tamamen ücretsiz
- Spring Boot ve React SDK'ları mevcut
- Komisyon: %1.5 + €0.25 per transaction (Avrupa kartları)

**Ödeme akışı:**
```
1. Kullanıcı rezervasyon formunu doldurur
2. "Jetzt bezahlen" butonuna basar
3. Frontend → Stripe'a kart bilgisi gider (SENİN SUNUCUNA DEĞİL)
4. Stripe → PaymentIntent oluşturur → client_secret döner
5. Frontend → Stripe Elements ile ödeme onayı alır
6. Stripe → Backend webhook'a "payment_succeeded" gönderir
7. Backend → Rezervasyonu CONFIRMED yapar
8. Kullanıcıya onay emaili gider

ÖNEMLİ: Kart bilgisi ASLA senin backend'ine gelmez.
Stripe Elements (frontend component) doğrudan Stripe ile konuşur.
```

Rezervasyon özet + ödeme sayfasında gösterim:
```
┌──────────────────────────────────────┐
│ Zusammenfassung                      │
│                                      │
│ Platz 1 (Fußball) × 1 Std.      30€ │
│ Krampon 45 × 2 Paar               6€ │
│ Torwarthandschuhe L × 1           2€ │
│ ──────────────────────────────────── │
│ Gesamtpreis:                     38€ │
│                                      │
│ Zahlungsmethode wählen               │
│ ┌──────────┐ ┌──────┐ ┌──────────┐  │
│ │ 💳 Karte │ │  Pay │ │ G Pay   │  │
│ └──────────┘ └──────┘ └──────────┘  │
│                                      │
│ [Stripe Elements Kart Formu]         │
│                                      │
│ ☐ Vor Ort bezahlen (sahada ödeme)   │
│                                      │
│ [Jetzt bezahlen — 38,00 EUR]        │
└──────────────────────────────────────┘
```
- "Gesamtpreis" (toplam fiyat) yazılır — artık gerçek ödeme olduğu için "geschätzt" yok
- Stripe Elements ile kart/Apple Pay/Google Pay ödeme
- "Vor Ort bezahlen" opsiyonel seçenek (sahada ödeme, payment_status = 'ON_SITE')

**İptal ve iade mantığı:**
```
├── 24+ saat önce → Tam iade (Stripe refund)
├── 2-24 saat önce → %50 iade
├── 2 saatten az → İade yok
└── Admin iptal → Admin karar verir (tam/kısmi/sıfır iade)
```

`total_price` alanı `reservation` tablosunda saklanır.
`payment_status` ile gerçek ödeme durumu takip edilir (PENDING, PAID, FAILED, REFUNDED, ON_SITE).
Admin panelde gelir rakamları **"Einnahmen"** olarak gösterilir — online ödenenler (PAID) ve sahada ödenenler (ON_SITE) ayrı raporlanır.

### Bildirimler
1. **Rezervasyon onayı:** Email + SMS (opsiyonel)
2. **1 saat kala hatırlatma:** Email + SMS
3. **Hatırlatmada link:** Tıklayınca rezervasyon detay sayfası açılır
4. **Detay sayfasında:** Değiştirme ve iptal seçenekleri

---

## 🔒 Güvenlik Mimarisi

### Authentication & Authorization
```
├── JWT (Access Token + Refresh Token)
│   ├── Access Token: 15 dk ömür
│   ├── Refresh Token: 7 gün ömür
│   └── HttpOnly cookie'de saklanır
├── Google Authenticator (TOTP)
│   └── Sadece Admin login için
├── Spring Security Filter Chain
│   ├── JwtAuthenticationFilter
│   ├── RateLimitingFilter
│   └── CorsFilter
└── Role-Based Access Control
    ├── ROLE_ADMIN → tam yetki
    ├── ROLE_USER → kendi rezervasyonları
    └── ANONYMOUS → sadece rezervasyon oluşturma
```

### Güvenlik Kuralları
- **Şifreler:** BCrypt ile hash (strength 12)
- **HTTPS:** Zorunlu (Railway otomatik sağlar)
- **CORS:** Sadece frontend domain'den istek kabul
- **Rate Limiting:** Login: 5 deneme/15 dk, API: 100 istek/dk
- **Input Validation:** Bean Validation + custom validators
- **SQL Injection:** Hibernate parameterized queries (zaten korumalı)
- **XSS:** React otomatik escape + Content Security Policy header
- **CSRF:** JWT stateless olduğu için disable (cookie-based değilse)
- **Log'larda:** Kişisel veri (telefon, email) ASLA log'a yazılmaz
- **Veritabanı:** Dışarıdan erişim kapalı, sadece backend bağlanır

### İstatistik ve Raporlama Sistemi

İstatistikler `reservation` tablosundaki `total_price`, `payment_status` ve `start_time` alanlarından hesaplanır.
Stripe ile online ödeme yapıldığı için gerçek gelir (PAID) takip edilir. Sahada ödeme (ON_SITE) ayrı raporlanır.

**Admin Dashboard Quick Stats:**
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Heute            │ │ Heute            │ │ Diesen Monat     │ │ Auslastung       │
│ 8 Reservierungen │ │ 240 EUR          │ │ 4.800 EUR        │ │ 68%              │
│ (gestriger: 6)   │ │ (Einnahmen)      │ │ (Einnahmen)      │ │ (diese Woche)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Gösterim kuralları:**
- Admin panelde **"Einnahmen"** kullanılır — gerçek ödeme sistemi mevcut
- Online ödenen (PAID) ve sahada ödenen (ON_SITE) ayrı gösterilir
- İade edilen (REFUNDED) tutarlar gelirden düşülür
- İptal edilen rezervasyonlar grafiklerde farklı renk (kırmızı/gri) gösterilir
- Ödeme yöntemi dağılımı (kart vs Apple Pay vs Google Pay vs sahada)

**Kampanya Önerisi Motoru:**
Admin dashboard'da boş saatlere göre otomatik öneri kutusu:
```
Doluluk oranı %30 altındaki saatleri bul → önceki ayla karşılaştır →
hafta içi/hafta sonu ayrımı yap → Almanca öneri metni üret
```

---

### Admin Güvenliği
- 2FA zorunlu (Google Authenticator)
- Session timeout: 8 saat (bilgisayarda açık kalacak ama makul limit)
- IP bazlı opsiyonel kısıtlama
- Admin işlemleri audit log'a yazılır

---

## 🇦🇹 Avusturya Yasal Uyum (DSGVO / GDPR)

### Datenschutzerklärung (Gizlilik Politikası) — ZORUNLU
- Sitede ayrı bir sayfa olarak yer alacak
- İçerik: Hangi veriler toplanıyor, neden, ne kadar süre saklanıyor, kimin erişimi var, kullanıcı hakları
- **Stripe ödeme notu eklenmeli:** "Für die Zahlungsabwicklung nutzen wir Stripe Inc. (USA). Es gelten die Datenschutzbestimmungen von Stripe: https://stripe.com/de/privacy"
- Kart bilgisi senin sunucunda TUTULMAZ (Stripe tutar) — sadece son 4 hane ve kart markası saklanır
- Stripe GDPR uyumlu (EU Standard Contractual Clauses)
- Generator ile ücretsiz oluşturulabilir: e-recht24.de veya oesterreich.gv.at
- **Maliyet: €0** (avukat opsiyonel, €100-200)

### Impressum — ZORUNLU (E-Commerce-Gesetz § 5)
- Sitede ayrı sayfa
- İçerik: İşletme adı, adres, telefon, email, ticaret sicil no, UID-Nr, yetkili makam
- Müşterinin (halı saha işletmecisi) bilgileri konur
- Template: WKO.at'da mevcut
- **Maliyet: €0**

### Cookie Banner
- Eğer sadece teknik cookie (JWT) kullanılıyorsa: Banner zorunlu DEĞİL ama bilgilendirme önerilir
- Google Analytics veya tracking varsa: Opt-in banner ZORUNLU
- Açık kaynak çözüm: cookieconsent.js
- **Maliyet: €0**

### Onay Checkbox'ları (Rezervasyon Formunda)
```
☐ Ich habe die Datenschutzerklärung gelesen und stimme zu. * (ZORUNLU)
☐ Ich möchte per E-Mail/SMS an meinen Termin erinnert werden. (OPSİYONEL)

→ Checkbox 1 işaretlenmeden "Reservieren" butonu disabled
→ Her iki onay timestamp ile DB'ye kaydedilir
```

### Teknik DSGVO Gereksinimleri (Kodda yapılacak)
```
├── Kullanıcı hesap silme ("Konto löschen") → CASCADE DELETE
├── Kullanıcı veri export (JSON/PDF) → "Meine Daten herunterladen"
├── Eski veriyi anonimleştirme → 1 yıl sonra isim/telefon silinir
├── Email/SMS onayı kayıt → privacy_accepted_at, notification_consent_at
├── HTTPS zorunlu → Railway otomatik
├── EU sunucu → Railway EU region seç
├── Log'larda kişisel veri yok
└── Veritabanı erişimi sadece backend üzerinden
```

**DSGVO toplam maliyet: €0** (kodda halledilir)

---

## 🗄️ Veritabanı Şeması

### Tablolar

```sql
-- ==================== SAHALAR ====================
CREATE TABLE fields (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('REGULAR', 'BUBBLE')),
    hourly_price DECIMAL(10,2) NOT NULL,
    allowed_durations INTEGER[] NOT NULL DEFAULT '{1, 3}', -- REGULAR: {1,3} | BUBBLE: {1,2}
    is_active BOOLEAN DEFAULT true,
    opening_time TIME NOT NULL DEFAULT '09:00',
    closing_time TIME NOT NULL DEFAULT '23:00',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== KULLANICILAR ====================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    display_id VARCHAR(20) UNIQUE NOT NULL, -- Kullanıcıya gösterilen ID (örn: "HS-2024-001")
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    totp_secret VARCHAR(255), -- Google Authenticator (sadece admin)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== REZERVASYONLAR ====================
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    confirmation_code VARCHAR(20) UNIQUE NOT NULL, -- "RES-XXXXXX"
    field_id BIGINT NOT NULL REFERENCES fields(id),
    user_id BIGINT REFERENCES users(id), -- NULL = misafir rezervasyonu
    guest_name VARCHAR(100), -- misafir için
    guest_phone VARCHAR(20), -- misafir için
    guest_email VARCHAR(255), -- misafir için
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours IN (1, 2, 3)), -- Asıl kontrol ReservationService'de field.allowedDurations ile yapılır
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'MODIFIED', 'COMPLETED', 'NO_SHOW')),
    privacy_accepted BOOLEAN NOT NULL DEFAULT false,
    privacy_accepted_at TIMESTAMP,
    notification_consent BOOLEAN DEFAULT false,
    notification_consent_at TIMESTAMP,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'ON_SITE')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'ON_SITE')),
    stripe_payment_intent_id VARCHAR(255),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(20), -- 'USER', 'ADMIN', 'SYSTEM'
    notes TEXT, -- Admin notları
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Çift rezervasyon önleme (CRITICAL)
CREATE UNIQUE INDEX idx_unique_active_reservation
ON reservations (field_id, start_time)
WHERE status NOT IN ('CANCELLED');

-- ==================== ÖDEMELER ====================
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    payment_method VARCHAR(20), -- 'card', 'apple_pay', 'google_pay'
    card_last4 VARCHAR(4),      -- son 4 hane (Stripe'dan gelir, güvenli)
    card_brand VARCHAR(20),     -- 'visa', 'mastercard'
    failure_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    stripe_receipt_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== GEÇİCİ KİLİTLER ====================
CREATE TABLE slot_holds (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT NOT NULL REFERENCES fields(id),
    start_time TIMESTAMP NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    session_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unique_active_hold
ON slot_holds (field_id, start_time)
WHERE expires_at > NOW();

-- ==================== BİLDİRİMLER ====================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('EMAIL', 'SMS', 'WHATSAPP')),
    purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('CONFIRMATION', 'REMINDER', 'CANCELLATION', 'MODIFICATION')),
    recipient VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== MALZEMELER ====================
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'KRAMPON', 'YELEK', 'TOP', 'KALECI_ELDIVENI', 'DIGER'
    quantity INTEGER NOT NULL DEFAULT 0,
    condition VARCHAR(20) DEFAULT 'GUT' CHECK (condition IN ('NEU', 'GUT', 'BESCHAEDIGT', 'AUSGEMUSTERT')),
    is_rentable BOOLEAN DEFAULT false,                      -- Müşteriye kiralanabilir mi?
    rental_price_per_hour DECIMAL(10,2) DEFAULT 0,          -- Saatlik kiralama ücreti
    available_sizes TEXT[],                                  -- Numara/beden listesi: {'38','39','40','41','42','43','44','45'} veya {'S','M','L','XL'}
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Kiralanabilir malzeme tipleri:
-- Krampon (is_rentable=true): numara bazlı, size: '38'-'46'
-- Kaleci Eldiveni (is_rentable=true): beden bazlı, size: 'S','M','L','XL'
-- Yelek/Forma (is_rentable=true): takım sayısına göre, quantity: 10'luk set
-- Top, File, Kale, Işıklandırma: is_rentable=false (sadece envanter takibi)

-- ==================== MALZEME KİRALAMA ====================
CREATE TABLE equipment_rentals (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(20),                                        -- Krampon numarası ('38'-'46') veya beden ('S','M','L','XL')
    rental_price DECIMAL(10,2) NOT NULL,                    -- Kiralama ücreti (snapshot, değişmez)
    status VARCHAR(20) DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'PICKED_UP', 'RETURNED', 'DAMAGED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== PERSONEL ====================
CREATE TABLE staff (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'PLATZWART', 'KASSIERER', 'MANAGER', 'REINIGUNG'
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== AUDIT LOG ====================
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'RESERVATION_CREATED', 'RESERVATION_CANCELLED', etc.
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== APP AYARLARI ====================
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Varsayılan ayarlar
INSERT INTO app_settings (key, value, description) VALUES
('reminder_hours_before', '1', 'Kaç saat önce hatırlatma gönderilecek'),
('hold_duration_minutes', '5', 'Geçici slot kilit süresi (dakika)'),
('max_advance_booking_days', '30', 'Kaç gün önceden rezervasyon yapılabilir'),
('cancellation_deadline_hours', '2', 'İptale kaç saat önce izin verilir'),
('phone_verification_required', 'false', 'Misafir rezervasyonunda SMS doğrulama zorunlu mu?');
```

---

## 📁 Proje Klasör Yapısı

### Backend
```
backend/
├── src/main/java/com/halisaha/
│   ├── HalisahaApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── CorsConfig.java
│   │   ├── RateLimitConfig.java
│   │   ├── SchedulerConfig.java
│   │   └── WebSocketConfig.java (opsiyonel, slot güncellemeleri için)
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   ├── service/TotpService.java
│   │   ├── dto/LoginRequest.java
│   │   ├── dto/LoginResponse.java
│   │   ├── dto/RegisterRequest.java
│   │   ├── filter/JwtAuthenticationFilter.java
│   │   └── util/JwtUtil.java
│   ├── user/
│   │   ├── controller/UserController.java
│   │   ├── service/UserService.java
│   │   ├── entity/User.java
│   │   ├── repository/UserRepository.java
│   │   └── dto/...
│   ├── field/
│   │   ├── controller/FieldController.java
│   │   ├── service/FieldService.java
│   │   ├── entity/Field.java
│   │   ├── repository/FieldRepository.java
│   │   └── dto/...
│   ├── reservation/
│   │   ├── controller/ReservationController.java
│   │   ├── controller/AdminReservationController.java
│   │   ├── service/ReservationService.java
│   │   ├── service/SlotHoldService.java
│   │   ├── service/PricingService.java
│   │   ├── entity/Reservation.java
│   │   ├── entity/SlotHold.java
│   │   ├── repository/ReservationRepository.java
│   │   ├── repository/SlotHoldRepository.java
│   │   ├── validator/ReservationValidator.java
│   │   └── dto/...
│   ├── payment/
│   │   ├── controller/PaymentController.java
│   │   ├── controller/StripeWebhookController.java
│   │   ├── service/PaymentService.java
│   │   ├── service/StripeService.java
│   │   ├── entity/Payment.java
│   │   ├── repository/PaymentRepository.java
│   │   ├── dto/CreatePaymentRequest.java
│   │   ├── dto/PaymentResponse.java
│   │   └── config/StripeConfig.java
│   ├── notification/
│   │   ├── service/NotificationService.java
│   │   ├── service/EmailService.java
│   │   ├── service/SmsService.java (Twilio)
│   │   ├── entity/Notification.java
│   │   ├── repository/NotificationRepository.java
│   │   └── scheduler/ReminderScheduler.java
│   ├── dashboard/
│   │   ├── controller/DashboardController.java
│   │   ├── service/ReportService.java
│   │   └── dto/DailyReport.java, MonthlyReport.java, ...
│   ├── equipment/
│   │   ├── controller/EquipmentController.java
│   │   ├── service/EquipmentService.java
│   │   ├── entity/Equipment.java
│   │   └── repository/EquipmentRepository.java
│   ├── staff/
│   │   ├── controller/StaffController.java
│   │   ├── service/StaffService.java
│   │   ├── entity/Staff.java
│   │   └── repository/StaffRepository.java
│   └── common/
│       ├── exception/GlobalExceptionHandler.java
│       ├── dto/ApiResponse.java
│       ├── util/IdGenerator.java (display_id, confirmation_code)
│       └── audit/AuditService.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   ├── db/migration/
│   │   ├── V1__create_fields_table.sql
│   │   ├── V2__create_users_table.sql
│   │   ├── V3__create_reservations_table.sql
│   │   ├── V4__create_slot_holds_table.sql
│   │   ├── V5__create_notifications_table.sql
│   │   ├── V6__create_equipment_table.sql
│   │   ├── V7__create_staff_table.sql
│   │   ├── V8__create_audit_log_table.sql
│   │   ├── V9__create_app_settings_table.sql
│   │   ├── V10__seed_initial_data.sql
│   │   ├── V11__create_payments_table.sql
│   │   └── V12__add_payment_columns_to_reservations.sql
│   └── templates/
│       ├── email-confirmation-de.html
│       ├── email-reminder-de.html
│       └── email-cancellation-de.html
├── Dockerfile
├── pom.xml
└── .env.example
```

### Frontend
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── i18n/
│   │   ├── i18n.ts
│   │   ├── de.json (Almanca — varsayılan)
│   │   └── tr.json (Türkçe)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ReservationPage.tsx
│   │   ├── ReservationManagePage.tsx (link ile açılan değiştir/iptal)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminReservations.tsx
│   │   │   ├── AdminEquipment.tsx
│   │   │   ├── AdminStaff.tsx
│   │   │   └── AdminSettings.tsx
│   │   ├── legal/
│   │   │   ├── Datenschutz.tsx
│   │   │   └── Impressum.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeToggle.tsx (dark/light)
│   │   ├── reservation/
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimeSlotGrid.tsx
│   │   │   ├── FieldSelector.tsx (normal vs balon ayrımı)
│   │   │   ├── DurationSelector.tsx (1 saat / 3 saat)
│   │   │   ├── ReservationForm.tsx
│   │   │   ├── ReservationSummary.tsx
│   │   │   └── PrivacyCheckboxes.tsx
│   │   ├── payment/
│   │   │   ├── PaymentForm.tsx          — Stripe Elements wrapper
│   │   │   ├── PaymentMethodSelector.tsx — Kart/Apple Pay/Google Pay seçimi
│   │   │   └── PaymentStatus.tsx        — Ödeme durumu gösterimi
│   │   ├── dashboard/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── PeakHoursChart.tsx
│   │   │   ├── TodayReservations.tsx
│   │   │   └── QuickStats.tsx
│   │   └── ui/
│   │       ├── AnimatedButton.tsx (futbol temalı)
│   │       ├── GlassCard.tsx
│   │       ├── LoadingSpinner.tsx (top döndürme animasyonu)
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReservation.ts
│   │   └── useTheme.ts
│   ├── services/
│   │   ├── api.ts (axios instance)
│   │   ├── authService.ts
│   │   ├── reservationService.ts
│   │   ├── fieldService.ts
│   │   └── adminService.ts
│   ├── store/ (Zustand veya Context)
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── types/
│   │   ├── reservation.ts
│   │   ├── field.ts
│   │   ├── user.ts
│   │   └── api.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── constants.ts
├── public/
│   └── images/ (saha fotoğrafları)
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
└── .env.example
```

### Root
```
halisaha-reservation/
├── backend/
├── frontend/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .gitignore
├── README.md (bu dosya)
└── docs/
    ├── TECH_STACK.md
    ├── DEVELOPMENT_STEPS.md
    ├── API_ENDPOINTS.md
    └── DEPLOYMENT.md
```

---

## 💰 İş Modeli & Fiyatlandırma

### Müşteriye Satış
- **İlk kurulum:** €4.000-7.000 (kapsamlı sistem)
- **Aylık bakım + hosting:** €80-150/ay
- **SMS paketi:** Ayrı faturalandır (~€0.05-0.08/SMS)
- **Ek özellik geliştirme:** Saat başı €50-80

### Railway Maliyeti (Pro Plan ~€20/ay)
- Spring Boot Backend: ~€5-8/ay
- PostgreSQL: ~€5-7/ay
- Frontend (Static): ~€1-3/ay
- **Toplam: ~€12-20/ay**

### Müşteriye Karşılaştırma Argümanı
"Eversports gibi hazır SaaS'a yılda €1.500+ ödersiniz, özelleştirme yok. Bizde tek seferlik yatırım + düşük aylık maliyet, tamamen size özel."

---

## 📋 Sözleşme Kontrol Listesi (Müşteriye Satarken)
- [ ] Ne dahil, ne dahil değil yazılı olacak
- [ ] Kaynak kodu sahipliği: Lisans mı, tam devir mi?
- [ ] Bakım süresi ve kapsamı
- [ ] Ek geliştirme ücreti
- [ ] Hosting sorumluluğu
- [ ] Veri sorumluluğu (DSGVO'da Auftragsverarbeiter sözleşmesi)
- [ ] Ödeme planı ve takvimi
- [ ] İptal koşulları

---

## ⚠️ Önemli Notlar

### Spring Boot + Railway Optimizasyonu
- `spring.jpa.open-in-view=false` — gereksiz DB bağlantısı önleme
- Lazy loading aktif — N+1 query problemi önleme
- HikariCP connection pool: max 5 bağlantı (Railway DB limiti)
- JVM memory: `-Xmx256m -Xms128m` (Railway RAM tasarrufu)
- GraalVM Native Image opsiyonel (cold start azaltma)

### GitHub'da Public Repo İçin
- `.env` dosyaları `.gitignore`'da
- Müşteriye özel bilgi ASLA repo'da olmayacak
- README İngilizce (uluslararası portfolyo için)
- Demo screenshot'ları ekle
- Live demo linki (varsa)

### SMS Doğrulama Stratejisi
- Twilio veya MessageBird kullan
- Sahte rezervasyon önleme: telefon doğrulama kodu
- Maliyet: ~€5-10/ay (30 SMS'e kadar)
- Alternatif: WhatsApp Business API (daha ucuz, Avusturya'da yaygın)
- Email doğrulama ücretsiz alternatif (SendGrid free: 100 email/gün)
