# Randevu Halı Saha — Frontend Kuralları

Bu dosya, frontend geliştirme sırasında uyulması gereken kuralları içerir.
Figma tasarımlarını React'a çevirirken bu kurallara kesinlikle uyulmalıdır.

---

## 0. EN KRİTİK KURALLAR

> **Bu bölüm her şeyden önce okunmalıdır. Buraya uymayan değişiklikler REDDEDİLİR.**

### 0.1 ASLA yapma:
- **Projenin kök dizinindeki (`/`) dosyaları OKUMA veya KULLANMA** — tüm frontend kodu `frontend/src/` altındadır
- **Arka planı değiştirme** — Arka plan `bg-background-dark` (#0a0f08) + gradient overlay kullanır, düz siyah (#000000) YAPMA
- **Yeni dosya/klasör oluşturmadan önce mevcut yapıyı kontrol et** — `frontend/src/` altındaki dosya yapısına bak
- **Backend bağlantısını unutma** — Her sayfa gerçek API'ye bağlanmalı, mock/placeholder/console.log YASAK
- **Mevcut bileşenleri yeniden yazma** — Var olan AdminSidebar, AdminLayout, api.ts, authStore vb. değiştirme, KULLAN
- **Farklı bir CSS framework veya ikon kütüphanesi ekleme** — Sadece Tailwind CSS v4 + Material Symbols Outlined

### 0.2 MUTLAKA yap:
- **Bu dosyayı (`frontend/Frontend_rules.md`) TAMAMEN oku** ve her kurala uy
- **Mevcut dosyaları oku** — Değiştirmeden önce dosyayı oku, yapıyı anla
- **Backend endpoint'lerini doğrula** — `backend/src/main/java/com/halisaha/` altındaki Controller'ları oku
- **Renk paletini koru** — Aşağıdaki Section 2'deki renkleri kullan
- **Admin sayfalarını AdminLayout içinde yaz** — Standalone route OLUŞTURMA, AdminLayout kullan
- **api.ts üzerinden API çağrısı yap** — Raw axios KULLANMA

### 0.3 Arka Plan Kuralı (ASLA DEĞİŞTİRME)
Admin ve public sayfaların arka planı:
```
Temel: bg-background-dark (#0a0f08)
Gradient overlay: soldan sağa siyahtan turuncuya hafif geçiş efekti var (primary/5 blur)
Grid pattern: opacity-20, 40px aralıklı ince çizgiler
Sağ üst köşe glow: primary/5 blur-[120px]
```
**ASLA düz siyah (#000000) veya beyaz arka plan KULLANMA. Mevcut arka planı KESİNLİKLE KORU.**

---

## 1. KRİTİK: Tailwind v4 CSS Reset Hatası

**ASLA şunu yazmayın:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**Neden:** Tailwind v4'te `@layer` dışındaki CSS kuralları, `@layer utilities` içindeki kurallardan önceliklidir. Bu yüzden `* { padding: 0 }` yazarsanız `py-24`, `px-8`, `p-6` gibi TÜM Tailwind spacing class'ları sessizce çalışmaz. Sayfada boşluklar sıfır olur, her şey bitişik görünür.

**Tailwind v4 zaten kendi reset'ini (preflight) içerir.** Ekstra reset yazmaya gerek yoktur.

**Custom CSS yazarken her zaman `@layer base` içine koyun:**
```css
@layer base {
  body {
    font-family: var(--font-display);
  }
}
```

---

## 2. Renk Paleti — Kesinlikle Değiştirilmez

Figma tasarımlarında farklı renkler olsa bile, bu projede aşağıdaki renkler kullanılır:

| Kullanım | Renk | Tailwind class |
|----------|------|----------------|
| **Ana renk (butonlar, vurgular, badge'ler)** | `#ff4400` turuncu | `text-primary`, `bg-primary`, `border-primary` |
| **Arka plan (tüm sayfalar)** | `#0a0f08` koyu siyah-yeşil | `bg-background-dark` |
| **Footer arka plan** | `#050804` | `bg-[#050804]` |
| **Navbar arka plan** | `#0a0a0a` %80 opacity | `bg-[#0a0a0a]/80` |
| **Cam efekti (kartlar)** | `rgba(255,255,255,0.05)` | `bg-glass` |
| **Surface dark (kartlar/paneller)** | `#121212` | `bg-surface-dark` |
| **Metin ana** | `#f1f5f9` (slate-100) | `text-slate-100` |
| **Metin ikincil** | `#94a3b8` (slate-400) | `text-slate-400` |
| **Metin soluk** | `#475569` (slate-600) | `text-slate-600` |
| **Border'lar** | `rgba(255,255,255,0.1)` | `border-white/10` |

**Figma'da farklı bir renk görürseniz**, onu KULLANMAYIN. Yukarıdaki paletten en yakın olanı seçin.
Örnek: Figma'da mavi buton varsa → `bg-primary` (turuncu) yapın.

---

## 3. Layout Yapısı — İki Farklı Layout Var

### A. Public Sayfalar (Navbar + Footer)
- `Layout.tsx` ile sarılır (`<Outlet />`)
- Navbar: `sticky top-0 z-50`, `h-16`, `backdrop-blur-md`
- Footer: `bg-[#050804]`, `pt-16 pb-8`, `border-t border-white/10`
- Yeni public sayfa eklerken Navbar ve Footer'a DOKUNMAYIN

### B. Admin Panel (Sidebar Layout — Global Layout YOK)
- Admin sayfaları `Layout.tsx` (Navbar/Footer) **KULLANMAZ**
- Standalone route olarak tanımlıdır
- Kendi layout'u vardır: solda sidebar + sağda content

---

## 4. Admin Panel Kuralları

### 4.1 URL Yapısı (GİZLİ)
Admin paneli gizli URL altında çalışır. `/admin` yok, direkt:
```
/portal-salamanda-soccer-arena-portal               → Admin Login (standalone)
/portal-salamanda-soccer-arena-portal/dashboard      → Dashboard (gerçek API: /admin/dashboard)
/portal-salamanda-soccer-arena-portal/reservierungen → Rezervasyonlar (gerçek API: /admin/reservations)
/portal-salamanda-soccer-arena-portal/zahlungen      → Zahlungen (gerçek API: /admin/reservations + /payments/admin/{id}/refund)
/portal-salamanda-soccer-arena-portal/kontakt-formular → Kontakt Mesajları (gerçek API: /admin/contact)
/portal-salamanda-soccer-arena-portal/material       → Malzeme Listesi (henüz Placeholder)
/portal-salamanda-soccer-arena-portal/personal       → Personel Listesi (henüz Placeholder)
/portal-salamanda-soccer-arena-portal/einstellungen  → Ayarlar (henüz Placeholder)
```
- `/admin/*` → anasayfaya yönlendirir
- Bilinmeyen URL'ler (`/xyz`) → anasayfaya yönlendirir
- Giriş yapmadan admin sayfasına erişim → admin login'e yönlendirir
- USER rolüyle admin sayfasına erişim → `/403` Forbidden

### 4.2 Güvenlik
Tüm admin sayfaları şu şekilde sarılmalı:
```tsx
<ProtectedRoute requiredRole="ADMIN">
  <AdminSayfa />
</ProtectedRoute>
```

### 4.3 Admin Tema — Koyu Siyah + Turuncu Aksan
Admin panelinin tüm sayfaları AdminLogin'deki (`/portal-salamanda-soccer-arena-portal`) arka plan stilini referans alır:

- **Arka plan:** Koyu siyah-kahverengi gradient `rgba(10, 8, 6, 0.85)` → `rgba(10, 8, 6, 0.95)`
- **Kartlar:** `bg-glass rounded-xl border border-white/10 backdrop-blur-md` veya `bg-surface-dark/60 backdrop-blur-xl border border-primary/20`
- **Turuncu aksan:** `primary` (`#ff4400`) — butonlar, aktif menü, göstergeler
- **Metin:** `text-white`, `text-slate-300`, `text-slate-400`, `text-slate-500`
- **Border:** `border-white/10`, `border-primary/20`
- **Input:** `bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-primary/50`

### 4.4 Sidebar (Sol Menü — Açılır/Kapanır)
- Solda sabit sidebar olacak
- **Kapalı mod:** Sadece ikonlar (~64px genişlik)
- **Açık mod:** İkon + metin (~256px genişlik)
- Üstte toggle butonu (hamburger veya chevron)
- Transition: `transition-all duration-300`
- Arka plan: `bg-[#0d0d0d]` veya `bg-surface-dark` — ana sayfadan biraz farklı
- Aktif sayfa: `bg-primary/10 text-primary border-l-2 border-primary`
- Hover: `hover:bg-white/5`
- Alt kısım: Kullanıcı adı + çıkış butonu

**Layout yapısı:**
```
┌──────────┬─────────────────────────────┐
│ Sidebar  │  Main Content Area          │
│ (sol)    │  (scroll edilebilir)        │
│ sabit    │                             │
│          │                             │
└──────────┴─────────────────────────────┘
```

**Kullanıcı kendi sidebar tasarımını yapıştırabilir** — o tasarımı baz al, ama renkleri ve ikonları bu rules'a uyarla.

### 4.5 Admin Bileşenler

**Tablolar:**
- Header: `bg-white/5 text-slate-400 text-xs uppercase tracking-wider`
- Satır: `border-b border-white/5 hover:bg-white/5 transition-colors`
- Metin: `text-sm text-slate-300`

**Butonlar:**
- Primary: `bg-primary text-white font-bold rounded-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`
- Secondary: `border border-white/10 text-slate-300 hover:bg-white/5 rounded-xl`
- Danger: `bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20`

**Input:**
```
bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-4 placeholder:text-slate-600
```
Sol ikon: `pl-12` + absolute Material icon

**Loading:** `<span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />`
**Error:** `p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm`
**Success:** `p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm`

---

## 5. Public Sayfa Route'ları

| Route | Sayfa |
|-------|-------|
| `/` | Ana sayfa |
| `/reservierung` | Rezervasyon oluştur |
| `/reservierung/details` | Rezervasyon detayları |
| `/reservierung/checkout` | Ödeme |
| `/reservierung/success` | Başarılı |
| `/reservierung/failure` | Başarısız |
| `/reservierung/verwalten` | Rezervasyon yönet |
| `/reservierung/verwalten/:id` | Yönetim detay |
| `/reservierung/umbuchen/:id` | Tarih değiştir |
| `/reservierung/stornieren/:id` | İptal |
| `/turniere` | Turnuvalar |
| `/turniere/anmeldung` | Turnuva kayıt |
| `/login` | Giriş (müşteri + admin) |
| `/kontakt` | İletişim |
| `/faq` | SSS |
| `/impressum` | Impressum |
| `/datenschutz` | Gizlilik |
| `/barrierefreiheit` | Erişilebilirlik |
| `/agb` | Genel koşullar |
| `/rueckerstattung` | İade politikası |

**ASLA** `/booking`, `/manage`, `/about`, `/privacy` gibi İngilizce route kullanmayın.

---

## 6. API Bağlantıları — Mock YOK

### Kesinlikle mock/placeholder/console.log kullanılmayacak!
Tüm sayfalar gerçek backend API'ye bağlanmalıdır.

### ⚠️ Endpoint Doğrulama Zorunluluğu
Her frontend sayfası/bileşen geliştirirken:
1. Kullandığın API endpoint'inin backend'de **gerçekten var olduğunu** doğrula
2. Endpoint'in beklediği **request body**, **query parametreleri** ve **response formatını** backend koduyla karşılaştır
3. Eğer bir endpoint backend'de **yoksa veya farklıysa**, bunu HEMEN kullanıcıya bildir — kendi başına mock/sahte data oluşturma
4. Aşağıdaki endpoint tablosunu referans al, ama kesin doğrulama için `backend/src/main/java/com/halisaha/` altındaki Controller dosyalarını oku
5. Backend'de olmayan bir endpoint'e ihtiyaç duyarsan, kullanıcıya şunu söyle: _"Bu sayfa için `POST /api/xxx` endpoint'i gerekiyor ama backend'de bulamadım. Önce backend'e eklenip eklenmeyeceğini onaylayın."_

### API Servisleri
- `src/services/api.ts` — Axios instance (`/api` baseURL, 10s timeout, JWT interceptor)
- `src/services/authService.ts` — Login, refresh, 2FA
- Yeni servisler eklenebilir: `staffService.ts`, `equipmentService.ts`, vb.

### API Response Formatı
```typescript
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}
```

### Auth Store (Zustand)
```typescript
useAuthStore.getState().accessToken    // JWT token
useAuthStore.getState().isAdmin        // boolean
useAuthStore.getState().user           // { displayId, name, email, role }
useAuthStore.getState().login(...)     // Giriş
useAuthStore.getState().logout()       // Çıkış
```

### Backend API Endpointleri (Admin)

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/login` | POST | Giriş |
| `/auth/refresh` | POST | Token yenile |
| `/auth/forgot-password` | POST | Şifre sıfırlama maili gönder |
| `/auth/reset-password` | POST | Yeni şifre belirle (token ile) |
| `/auth/2fa/setup` | GET | TOTP kurulumu |
| `/auth/2fa/verify` | POST | TOTP doğrula |
| `/admin/staff` | GET/POST | Personel listele/oluştur |
| `/admin/staff/{id}` | GET/PUT/DELETE | Personel detay/güncelle/sil |
| `/admin/users/invite-admin` | POST | Yeni admin davet et (email gönderir) |
| `/admin/equipment` | GET/POST | Malzeme listele/oluştur |
| `/admin/equipment/{id}` | GET/PUT/DELETE | Malzeme detay/güncelle/sil |
| `/admin/reservations` | GET | Tüm rezervasyonlar `?from=YYYY-MM-DD&to=YYYY-MM-DD` (default ±30 gün) |
| `/admin/reservations/today` | GET | Bugünkü rezervasyonlar |
| `/admin/reservations/{id}` | GET | Rezervasyon detayı |
| `/admin/reservations/{id}` | PUT | Rezervasyon değiştir (admin, deadline yok) `{ startTime, durationMinutes }` |
| `/admin/reservations/{id}` | DELETE | Rezervasyon iptal (admin, deadline yok) |
| `/admin/contact` | GET | Kontakt mesajları (opsiyonel `?status=NEW`) |
| `/admin/contact/count` | GET | Yeni mesaj sayısı |
| `/admin/contact/{id}` | GET | Mesaj detayı (otomatik okundu işareti) |
| `/admin/contact/{id}/replied` | PATCH | Cevaplandı olarak işaretle |
| `/admin/contact/{id}/archive` | PATCH | Arşivle |
| `/admin/contact/{id}/notes` | PATCH | Admin notu ekle `{ "notes": "..." }` |
| `/contact` | POST | Kontakt formu gönder (PUBLIC, auth gerektirmez) `{ name, email, phone?, subject?, message }` |
| `/admin/dashboard` | GET | Dashboard istatistikleri |
| `/admin/reports/daily` | GET | Günlük rapor |
| `/admin/reports/monthly` | GET | Aylık rapor |
| `/admin/reports/peak-hours` | GET | Yoğun saatler |
| `/admin/settings` | GET/PUT | Uygulama ayarları |
| `/admin/audit` | GET | Denetim kaydı |
| `/admin/notifications` | GET | Bildirimler |
| `/fields` | GET | Sahalar |
| `/payments/{reservationId}/refund` | POST | İade |
| `/payments/{reservationId}/admin-refund` | POST | Admin iadesi |

---

## 7. Dil

- Tüm UI metinleri **Almanca** olmalıdır
- Butonlar: "Speichern", "Abbrechen", "Löschen", "Bearbeiten", "Erstellen", "Hinzufügen"
- Onay: "Sind Sie sicher?"
- Başarılı: "Erfolgreich gespeichert/gelöscht/aktualisiert"
- Hata: "Ein Fehler ist aufgetreten"
- Boş tablo: "Keine Daten vorhanden"

---

## 8. Mobil Uyumluluk (Responsive Design)

Her bileşen mobil-öncelikli (mobile-first) yazılmalıdır:

### Grid'ler
```
grid grid-cols-1 md:grid-cols-2    ← Mobilde tek sütun, desktop'ta iki sütun
```

### Font boyutları
```
text-3xl md:text-5xl               ← Mobilde küçük, desktop'ta büyük
```

### Padding/Spacing
```
px-4 sm:px-6 lg:px-8               ← Ekran büyüdükçe padding artar
```

### Admin Panel
- Desktop-first ama tablet'te de çalışmalı
- Sidebar: Tablet'te default kapalı (sadece ikonlar), desktop'ta açık
- Tablolar: Yatay scroll veya kart görünümüne geçiş

---

## 9. Bileşen Yazım Kuralları

### Kartlar / Kutular
```
rounded-xl border border-white/10 bg-glass backdrop-blur-md transition-all duration-300
```
Hover efekti: `box-glow` class'ı kullan (index.css'de tanımlı)

### İkonlar
Google Material Symbols Outlined kullanılır (başka ikon kütüphanesi EKLEME):
```html
<span className="material-symbols-outlined">icon_name</span>
```

---

## 10. CSS Dosyası Yapısı (index.css)

```css
/* 1. Font import'ları EN ÜSTTE */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

/* 2. Tailwind import */
@import "tailwindcss";

/* 3. Theme tanımları */
@theme {
  --color-primary: #ff4400;
  --color-background-dark: #0a0f08;
  /* ... */
}

/* 4. Custom utility'ler @layer utilities içinde */
@layer utilities {
  .text-glow { ... }
  .box-glow { ... }
}

/* 5. Base stiller @layer base içinde */
@layer base {
  body { ... }
}

/* 6. ASLA @layer dışına CSS yazmayın! */
```

---

## 11. Sık Yapılan Hatalar

| Hata | Sonuç | Çözüm |
|------|-------|-------|
| `* { padding: 0 }` yazmak | Tüm Tailwind spacing bozulur | Yazma, Tailwind preflight zaten halleder |
| `@layer` dışına CSS yazmak | Tailwind utility'leri override olur | Her zaman `@layer base` veya `@layer utilities` kullan |
| Route İngilizce yazmak (`/booking`) | 404 hatası | Almanca route kullan (`/reservierung`) |
| Farklı renkler kullanmak | Marka tutarsızlığı | Sadece yukarıdaki renk paletini kullan |
| `bg-gradient-to-r` yazmak (v3 syntax) | Tailwind v4'te çalışmaz | `bg-linear-to-r` kullan (v4 syntax) |
| Mock/console.log bırakmak | Sunumda çalışmaz | Gerçek API bağlantısı kur |
| Admin route'u `/admin/...` yapmak | Gizli URL bozulur | `/portal-salamanda-soccer-arena-portal/...` kullan |
| Global Layout'u admin'de kullanmak | Navbar/Footer görünür | Admin standalone route olmalı |

---

## 12. Tailwind v3 → v4 Farklılıkları

| v3 (YANLIŞ) | v4 (DOĞRU) |
|---|---|
| `tailwind.config.js` dosyası | `@theme {}` bloğu index.css'de |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `darkMode: "class"` config | Otomatik (CSS custom properties) |
| `@apply` (bazı durumlarda) | `@layer utilities` içinde plain CSS |

---

## 13. Dosya Organizasyonu

```
src/
├── components/
│   ├── common/          # ErrorBoundary, Logo
│   ├── layout/          # Layout, Navbar, Footer, ProtectedRoute
│   └── admin/           # AdminSidebar, AdminLayout vb.
├── pages/
│   ├── admin/           # Admin sayfaları (standalone, Layout kullanmaz)
│   │   ├── AdminLogin.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Reservierungen.tsx
│   │   ├── Material.tsx
│   │   ├── Personal.tsx
│   │   └── Einstellungen.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Booking.tsx
│   └── ...
├── services/            # API servisleri (authService, staffService, vb.)
├── store/               # Zustand stores (authStore)
├── types/               # TypeScript tipleri
└── i18n/                # Çeviri dosyaları
```

---

## 14. Tech Stack

- **React 18+** TypeScript
- **Vite 7** (dev server port 3000)
- **Tailwind CSS v4** (@tailwindcss/vite plugin)
- **react-router-dom v7** (BrowserRouter)
- **Zustand** (state management — authStore)
- **Framer Motion** (animasyonlar)
- **react-i18next** (DE default + TR)
- **Axios** (API client, /api proxy → localhost:8080)
- **Stripe React** (ödeme)
- **Recharts** (admin dashboard grafikleri)
- **react-helmet-async** (SEO)
- **Fonts:** Lexend (display/headings), Inter (body)
- **Icons:** Google Material Symbols Outlined

---

## 15. API Kullanım Kuralları

### ASLA raw `axios` kullanma!
```typescript
// ❌ YANLIŞ — JWT interceptor çalışmaz
import axios from 'axios'
axios.get('/api/fields')

// ✅ DOĞRU — JWT otomatik eklenir, 401 refresh otomatik çalışır
import api from '../services/api'
api.get('/fields')
```

- Tüm API çağrıları `src/services/api.ts`'deki `api` instance üzerinden yapılmalı
- `api` instance zaten `/api` baseURL'e sahip → endpoint'lerde `/api` yazma: `api.get('/fields')` ✅
- JWT token otomatik eklenir (request interceptor)
- 401 hatası gelince refresh token ile otomatik yenilenir (response interceptor)
- Refresh da başarısız olursa `logout()` çağrılır ve kullanıcı login'e yönlendirilir

### Hata Mesajı Çıkarma Pattern'i
Backend her zaman `ApiResponse` döner. Hata mesajını şu şekilde çıkar:
```typescript
import type { AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'

try {
  const res = await api.post('/auth/login', { email, password })
  const data = res.data.data  // gerçek data burası
} catch (err) {
  const axiosErr = err as AxiosError<ApiResponse<unknown>>
  const message = axiosErr.response?.data?.message || 'Ein Fehler ist aufgetreten'

  // Özel HTTP kodlarına göre mesaj:
  if (axiosErr.response?.status === 429) {
    // Rate limit — "Zu viele Versuche. Bitte warten Sie 15 Minuten."
  } else if (axiosErr.response?.status === 401) {
    // Yetkisiz — mesajı göster
  } else if (axiosErr.response?.status === 409) {
    // Conflict — zaten var (email gibi)
  }
}
```

---

## 16. Form Validation Kuralları (Backend ile Tutarlı)

Frontend validasyonu backend ile **birebir aynı** olmalı. Kullanıcı submit etmeden hata görsün.

### Şifre Kuralları
```
Minimum 8 karakter
En az 1 büyük harf (A-Z)
En az 1 küçük harf (a-z)
En az 1 rakam (0-9)
En az 1 özel karakter (!@#$%^&*()_+-=)
```
Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$`

### Email
- `@Email` annotation backend'de — standart email format kontrolü yeterli
- Trim + lowercase yapılmalı (backend de yapıyor)

### İsim
- Min 2, max 100 karakter
- Trim

### Telefon
- Opsiyonel
- Format: `+43...` veya `06...` (Avusturya)

### Genel Kurallar
- `required` alanları boş bırakılamaz
- Hata mesajları Almanca: "Dieses Feld ist erforderlich", "Ungültige E-Mail-Adresse", "Passwort muss mindestens 8 Zeichen lang sein"
- Submit butonu validation geçene kadar `disabled` olabilir (isteğe bağlı)

---

## 17. Yeniden Kullanılabilir Bileşenler (Component Reuse)

### ⚠️ KRİTİK KURAL: Aynı şeyi iki kere yazma!

Bir UI öğesi birden fazla sayfada kullanılıyorsa, **mutlaka** `src/components/common/` altında tek bir bileşen olarak yaz. Asla kopyala-yapıştır yapma.

### Neden?
- Projeyi başka müşteriye satarken sadece props değişir (örn: koordinat, logo, renk)
- Bir yerde bug fix yapınca her yerde düzelir
- Kod tekrarı = bakım kabusu

### Örnekler

| Durum | ❌ YANLIŞ | ✅ DOĞRU |
|-------|----------|---------|
| Harita | Her sayfada ayrı Google Maps kodu | `<MapEmbed lat={...} lng={...} />` bileşeni |
| Tablo | Her admin sayfasında ayrı tablo HTML'i | `<DataTable columns={...} data={...} />` bileşeni |
| Modal/Dialog | Her sayfada ayrı modal kodu | `<ConfirmDialog title={...} onConfirm={...} />` bileşeni |
| Boş durum | Her yerde ayrı "Keine Daten" mesajı | `<EmptyState icon={...} message={...} />` bileşeni |
| Yükleniyor | Her yerde ayrı spinner | `<LoadingSpinner size="sm|md|lg" />` bileşeni |
| İstatistik kartı | Dashboard'da 4 ayrı aynı kart kodu | `<StatCard title={...} value={...} icon={...} />` bileşeni |

### Bileşen Yapısı
```
src/components/
├── common/           # Proje genelinde kullanılanlar
│   ├── Logo.tsx
│   ├── ErrorBoundary.tsx
│   ├── MapEmbed.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── ConfirmDialog.tsx
│   └── DataTable.tsx
├── layout/           # Layout bileşenleri
└── admin/            # Sadece admin'de kullanılanlar
    ├── AdminLayout.tsx
    ├── AdminSidebar.tsx
    └── StatCard.tsx
```

### Kural
Bir bileşen **2+ sayfada** kullanılıyorsa → `components/common/` altına taşı.
Sadece admin'de kullanılıyorsa → `components/admin/` altına koy.
Tek sayfada kullanılıyorsa → sayfanın kendi dosyasında kalabilir.
