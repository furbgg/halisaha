import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { Home } from './pages/Home'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ScrollToTop } from './components/common/ScrollToTop'
import { HelmetProvider } from 'react-helmet-async'
import { Navigate, useLocation } from 'react-router-dom'
import { ADMIN_PORTAL_PATH } from './config/brand'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './components/animations/PageTransition'
import { useAuthStore } from './store/authStore'
import './i18n/i18n'

const Booking = lazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })))
const BookingDetails = lazy(() => import('./pages/BookingDetails').then(m => ({ default: m.BookingDetails })))
const BookingCheckout = lazy(() => import('./pages/BookingCheckout').then(m => ({ default: m.BookingCheckout })))
const BookingSuccess = lazy(() => import('./pages/BookingSuccess').then(m => ({ default: m.BookingSuccess })))
const BookingFailure = lazy(() => import('./pages/BookingFailure').then(m => ({ default: m.BookingFailure })))
const BookingManage = lazy(() => import('./pages/BookingManage').then(m => ({ default: m.BookingManage })))
const BookingManageDetail = lazy(() => import('./pages/BookingManageDetail').then(m => ({ default: m.BookingManageDetail })))
const BookingReschedule = lazy(() => import('./pages/BookingReschedule').then(m => ({ default: m.BookingReschedule })))
const BookingCancel = lazy(() => import('./pages/BookingCancel').then(m => ({ default: m.BookingCancel })))
const BookingTicketPrint = lazy(() => import('./pages/BookingTicketPrint').then(m => ({ default: m.BookingTicketPrint })))
const Tournaments = lazy(() => import('./pages/Tournaments').then(m => ({ default: m.Tournaments })))
const TournamentRegistration = lazy(() => import('./pages/TournamentRegistration').then(m => ({ default: m.TournamentRegistration })))
const Impressum = lazy(() => import('./pages/Impressum').then(m => ({ default: m.Impressum })))
const Datenschutz = lazy(() => import('./pages/Datenschutz').then(m => ({ default: m.Datenschutz })))
const Barrierefreiheit = lazy(() => import('./pages/Barrierefreiheit').then(m => ({ default: m.Barrierefreiheit })))
const AGB = lazy(() => import('./pages/AGB').then(m => ({ default: m.AGB })))
const Ruckerstattung = lazy(() => import('./pages/Ruckerstattung').then(m => ({ default: m.Ruckerstattung })))
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })))
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })))
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))
const Forbidden = lazy(() => import('./pages/Forbidden').then(m => ({ default: m.Forbidden })))
const Maintenance = lazy(() => import('./pages/Maintenance').then(m => ({ default: m.Maintenance })))
const ServerError = lazy(() => import('./pages/ServerError').then(m => ({ default: m.ServerError })))
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })))
const AdminForgotPassword = lazy(() => import('./pages/admin/AdminForgotPassword').then(m => ({ default: m.AdminForgotPassword })))
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword').then(m => ({ default: m.AdminResetPassword })))
const AdminLoginSuccess = lazy(() => import('./pages/admin/AdminLoginSuccess').then(m => ({ default: m.AdminLoginSuccess })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminReservierungen = lazy(() => import('./pages/admin/AdminReservierungen').then(m => ({ default: m.AdminReservierungen })))
const AdminZahlungen = lazy(() => import('./pages/admin/AdminZahlungen').then(m => ({ default: m.AdminZahlungen })))
const AdminKontaktFormular = lazy(() => import('./pages/admin/AdminKontaktFormular').then(m => ({ default: m.AdminKontaktFormular })))
const AdminMaterial = lazy(() => import('./pages/admin/AdminMaterial').then(m => ({ default: m.AdminMaterial })))
const AdminPersonal = lazy(() => import('./pages/admin/AdminPersonal').then(m => ({ default: m.AdminPersonal })))
const AdminEinstellungen = lazy(() => import('./pages/admin/AdminEinstellungen').then(m => ({ default: m.AdminEinstellungen })))

function UeberUns() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Über Uns</h1>
      <p className="text-text-muted leading-relaxed mb-4">
        Wir sind ein modernes Halısaha-Zentrum in Wien mit 4 Fußballplätzen und einer exklusiven Bubble Soccer Arena.
        Unser Ziel ist es, Sport und Spaß für alle zugänglich zu machen – egal ob Hobby-Kicker oder ambitioniertes Team.
      </p>
      <p className="text-text-muted leading-relaxed mb-4">
        Alle unsere Plätze sind mit hochwertigem Kunstrasen ausgestattet und können rund um die Uhr gebucht werden.
        Wir bieten außerdem Ausrüstungsverleih, Happy-Hour-Rabatte und die Möglichkeit, Turniere auszurichten.
      </p>
      <p className="text-text-muted leading-relaxed">
        Für Gruppen, Firmenevents oder regelmäßige Buchungen stehen wir gerne persönlich zur Verfügung.
        Kontaktieren Sie uns einfach über das Kontaktformular.
      </p>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const LocationProvider = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/reservierung" element={<PageTransition><Booking /></PageTransition>} />
            <Route path="/reservierung/details" element={<PageTransition><BookingDetails /></PageTransition>} />
            <Route path="/reservierung/checkout" element={<PageTransition><BookingCheckout /></PageTransition>} />
            <Route path="/reservierung/success" element={<PageTransition><BookingSuccess /></PageTransition>} />
            <Route path="/reservierung/failure" element={<PageTransition><BookingFailure /></PageTransition>} />
            <Route path="/reservierung/verwalten" element={<PageTransition><BookingManage /></PageTransition>} />
            <Route path="/reservierung/verwalten/:id" element={<PageTransition><BookingManageDetail /></PageTransition>} />
            <Route path="/reservierung/umbuchen/:id" element={<PageTransition><BookingReschedule /></PageTransition>} />
            <Route path="/reservierung/stornieren/:id" element={<PageTransition><BookingCancel /></PageTransition>} />
            <Route path="/reservierung/:code" element={<Navigate to="/reservierung/verwalten" replace />} />

            <Route path="/turniere" element={<PageTransition><Tournaments /></PageTransition>} />
            <Route path="/turniere/anmeldung" element={<PageTransition><TournamentRegistration /></PageTransition>} />

            <Route path="/impressum" element={<PageTransition><Impressum /></PageTransition>} />
            <Route path="/datenschutz" element={<PageTransition><Datenschutz /></PageTransition>} />
            <Route path="/barrierefreiheit" element={<PageTransition><Barrierefreiheit /></PageTransition>} />
            <Route path="/agb" element={<PageTransition><AGB /></PageTransition>} />
            <Route path="/rueckerstattung" element={<PageTransition><Ruckerstattung /></PageTransition>} />

            <Route path="/login" element={<Navigate to="/" replace />} />

            <Route path="/konto" element={
              <ProtectedRoute>
                <PageTransition><Navigate to="/reservierung/verwalten" replace /></PageTransition>
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={<Navigate to="/" replace />} />

            <Route path="/ueber-uns" element={<PageTransition><UeberUns /></PageTransition>} />
            <Route path="/kontakt" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />

            <Route path="/wartung" element={<PageTransition><Maintenance /></PageTransition>} />
            <Route path="/500" element={<PageTransition><ServerError /></PageTransition>} />
            <Route path="/401" element={<PageTransition><Unauthorized /></PageTransition>} />
            <Route path="/403" element={<PageTransition><Forbidden /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>

          <Route path={ADMIN_PORTAL_PATH} element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path={`${ADMIN_PORTAL_PATH}/passwort-vergessen`} element={<PageTransition><AdminForgotPassword /></PageTransition>} />
          <Route path={`${ADMIN_PORTAL_PATH}/passwort-zuruecksetzen`} element={<PageTransition><AdminResetPassword /></PageTransition>} />
          <Route path={`${ADMIN_PORTAL_PATH}/erfolgreich`} element={
            <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminLoginSuccess /></PageTransition></ProtectedRoute>
          } />
          <Route element={<Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>}>
            <Route path={`${ADMIN_PORTAL_PATH}/dashboard`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/reservierungen`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminReservierungen /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/zahlungen`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminZahlungen /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/kontakt-formular`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminKontaktFormular /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/material`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminMaterial /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/personal`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminPersonal /></PageTransition></ProtectedRoute>
            } />
            <Route path={`${ADMIN_PORTAL_PATH}/einstellungen`} element={
              <ProtectedRoute requiredRole="ADMIN"><PageTransition><AdminEinstellungen /></PageTransition></ProtectedRoute>
            } />
          </Route>

          <Route path="/reservierung/ticket/:id" element={<PageTransition><BookingTicketPrint /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default function App() {
  const { isInitializing, rehydrate } = useAuthStore()

  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  if (isInitializing) {
    return <PageLoader />
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <LocationProvider />
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
