import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../services/api';
import {
  COMPANY_NAME,
  ADDRESS_STREET,
  ADDRESS_ZIP,
  ADDRESS_CITY,
  ADDRESS_COUNTRY,
  MAP_COORDINATES
} from '../config/brand';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconImg,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Reservation {
  id: number;
  confirmationCode: string;
  fieldId: number;
  fieldName: string;
  fieldType: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  status: string;
  paymentStatus: string | null;
  paymentMethod: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  createdAt: string;
  equipmentRentals: { equipmentName: string; quantity: number; size: string; price: number }[];
}

export function BookingManageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [reservation, setReservation] = useState<Reservation | null>(
    (location.state as any)?.reservation || null
  );
  const [loading, setLoading] = useState(!reservation);
  const [error, setError] = useState('');

  const bookingId = id || '';
  const tokenFromHash = location.hash.startsWith('#mt=') ? decodeURIComponent(location.hash.slice(4)) : '';
  const manageToken =
    (location.state as any)?.manageToken ||
    tokenFromHash ||
    (bookingId ? sessionStorage.getItem(`manage-token:${bookingId}`) || '' : '');

  useEffect(() => {
    if (bookingId && manageToken) {
      sessionStorage.setItem(`manage-token:${bookingId}`, manageToken);
    }
  }, [bookingId, manageToken]);

  useEffect(() => {
    if (!tokenFromHash) return;
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', cleanUrl);
  }, [tokenFromHash]);

  useEffect(() => {
    if (reservation) return;
    if (!bookingId) {
      navigate('/reservierung/verwalten');
      return;
    }

    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/${encodeURIComponent(bookingId)}`, {
          headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined
        });
        const data = res.data.data;
        if (!data.customerEmail) {
          navigate('/reservierung/verwalten');
          return;
        }
        setReservation(data);
      } catch {
        setError(t('bookingManageDetail.error.notFound', 'Reservierung nicht gefunden.'));
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [bookingId, manageToken, reservation, navigate, t]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400">{t('common.loading', 'Wird geladen...')}</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400">error</span>
          <p className="text-slate-300 text-lg">{error || t('bookingManageDetail.error.notFound', 'Reservierung nicht gefunden.')}</p>
          <button
            onClick={() => navigate('/reservierung/verwalten')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
          >
            {t('bookingManageDetail.back', 'Zurück zur Übersicht')}
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);
  const formattedDate = format(startDate, 'EEE. dd. MMM, yyyy', { locale: de });
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');
  const formattedCreatedAt = reservation.createdAt
    ? format(new Date(reservation.createdAt), 'dd. MMM, yyyy', { locale: de })
    : '';
  const isPaid = reservation.paymentStatus === 'PAID';
  const isCancelled = reservation.status === 'CANCELLED';

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    CONFIRMED: { label: t('bookingManageDetail.status.confirmed', 'Bestätigt'), color: 'primary', icon: 'check_circle' },
    MODIFIED: { label: t('bookingManageDetail.status.modified', 'Geändert'), color: 'primary', icon: 'edit' },
    CANCELLED: { label: t('bookingManageDetail.status.cancelled', 'Storniert'), color: 'red-500', icon: 'cancel' },
    PENDING_PAYMENT: { label: t('bookingManageDetail.status.pending', 'Zahlung ausstehend'), color: 'amber-500', icon: 'schedule' },
  };
  const currentStatus = statusConfig[reservation.status] || statusConfig.CONFIRMED;

  const handleShare = async () => {
    const dateStr = `${formattedDate}, ${formattedStartTime} Uhr`;
    const shareData = {
      title: t('bookingManageDetail.actions.shareTitle', { company: COMPANY_NAME, defaultValue: `Reservierung bei ${COMPANY_NAME}` }),
      text: `⚽ Hey! Ich habe einen Platz bei ${COMPANY_NAME} gebucht!\n🏟️ Platz: ${reservation.fieldName}\n📅 Datum: ${dateStr}\n🔗 Hier sind die Details:`,
      url: `${window.location.origin}/reservierung/verwalten/${reservation.confirmationCode}`
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert(t('bookingManageDetail.actions.copied', 'Link und Details in die Zwischenablage kopiert!'));
      } catch {
        alert(t('bookingManageDetail.actions.copyFailed', 'Kopieren fehlgeschlagen.'));
      }
    }
  };

  const handlePrint = () => {
    try {
      const printData = {
        date: reservation.startTime,
        fieldName: reservation.fieldName,
        customerName: reservation.customerName,
        amount: `€${reservation.totalPrice.toFixed(2).replace('.', ',')}`,
        time: `${formattedStartTime} - ${formattedEndTime}`
      };
      const encodedData = btoa(encodeURIComponent(JSON.stringify(printData)));
      const query = new URLSearchParams({ data: encodedData }).toString();
      window.open(`/reservierung/ticket/${reservation.confirmationCode}?${query}`, '_blank');
    } catch (err) {
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 140, 0, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <button
            onClick={() => navigate('/reservierung/verwalten')}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium group cursor-pointer bg-transparent border-none"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('bookingManageDetail.back', 'Zurück zur Übersicht')}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                isCancelled
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,140,0,0.15)]'
              }`}>
                <span className="material-symbols-outlined text-sm">{currentStatus.icon}</span>
                {currentStatus.label}
              </span>
              {formattedCreatedAt && (
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {t('bookingManageDetail.status.bookedOn', 'Gebucht am')} {formattedCreatedAt}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('bookingManageDetail.title', 'Deine Reservierung')} <span className="text-slate-500 dark:text-slate-400">#{reservation.confirmationCode}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              {isCancelled
                ? t('bookingManageDetail.descCancelled', 'Diese Buchung wurde storniert.')
                : t('bookingManageDetail.desc', 'Hier findest du alle Details zu deiner bevorstehenden Buchung. Du kannst den Termin verschieben oder stornieren.')}
            </p>
          </div>
          {!isCancelled && (
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-surface-dark/80 text-slate-900 dark:text-white text-sm font-medium border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                <span className="hidden sm:inline">{t('bookingManageDetail.actions.print', 'Drucken')}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-surface-dark/80 text-slate-900 dark:text-white text-sm font-medium border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                <span className="hidden sm:inline">{t('bookingManageDetail.actions.share', 'Teilen')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-light/80 dark:bg-surface-dark/60 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">
                        {reservation.fieldType === 'BUBBLE' ? 'bubble_chart' : 'stadium'}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('bookingManageDetail.details.fieldLabel', 'Gebuchter Platz')}</p>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{reservation.fieldName}</h3>
                      <p className="text-primary text-sm mt-1">
                        {reservation.fieldType === 'BUBBLE' ? 'Bubble Soccer' : t('bookingManageDetail.details.fieldTags', 'Outdoor • Beleuchtet')}
                      </p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-sm">
                        <span className="material-symbols-outlined">calendar_month</span>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t('bookingManageDetail.details.dateTimeLabel', 'Datum & Uhrzeit')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">{formattedDate}</p>
                        <p className="text-slate-900 dark:text-white font-medium">{formattedStartTime} - {formattedEndTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-sm">
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t('bookingManageDetail.details.amountLabel', 'Gesamtbetrag')}</p>
                        <p className="text-slate-900 dark:text-white font-medium text-lg">€{reservation.totalPrice.toFixed(2).replace('.', ',')}</p>
                        <p className="text-slate-500 text-xs">
                          {isPaid
                            ? t('bookingManageDetail.details.paid', 'Bezahlt')
                            : t('bookingManageDetail.details.pending', 'Ausstehend')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reservation.equipmentRentals && reservation.equipmentRentals.length > 0 && (
                    <>
                      <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{t('bookingManageDetail.details.equipment', 'Gemietete Ausrüstung')}</p>
                        <div className="space-y-2">
                          {reservation.equipmentRentals.map((rental, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-900 dark:text-white">
                                {rental.quantity}x {rental.equipmentName} (Gr. {rental.size})
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                €{rental.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {reservation.couponCode && (
                    <>
                      <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">local_offer</span>
                          {t('bookingManageDetail.details.coupon', 'Gutschein')}: {reservation.couponCode}
                        </span>
                        <span className="text-green-500">
                          -€{(reservation.discountAmount || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm shrink-0 w-full md:w-auto shadow-sm">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode
                      value={`${window.location.origin}/reservierung/verwalten/${reservation.confirmationCode}`}
                      size={128}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="text-center mt-1">
                    <p className="text-slate-900 dark:text-white text-xs font-bold tracking-wide">{t('bookingManageDetail.details.qrCode', 'CHECK-IN CODE')}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">{t('bookingManageDetail.details.qrCodeSub', 'Am Empfang vorzeigen')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-64 relative group shadow-sm z-0">
              <MapContainer
                center={[MAP_COORDINATES.lat, MAP_COORDINATES.lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[MAP_COORDINATES.lat, MAP_COORDINATES.lng]}>
                  <Popup>
                    {COMPANY_NAME} <br /> {ADDRESS_STREET}
                  </Popup>
                </Marker>
              </MapContainer>
              <div className="absolute bottom-4 left-4 z-400 flex flex-col md:flex-row items-start md:items-center gap-3 pointer-events-none">
                <div className="hidden md:block p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-white/10 shadow-lg pointer-events-auto">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg pointer-events-auto">
                  <p className="text-slate-900 dark:text-white text-sm font-bold">{ADDRESS_STREET}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{ADDRESS_ZIP} {ADDRESS_CITY}, {ADDRESS_COUNTRY}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-400">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${ADDRESS_STREET}, ${ADDRESS_ZIP} ${ADDRESS_CITY}, ${ADDRESS_COUNTRY}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                >
                  {t('bookingManageDetail.details.route', 'Route planen')}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 space-y-6">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">{t('bookingManageDetail.management.title', 'Verwaltung')}</h3>

              {!isCancelled && (
                <>
                  <div
                    onClick={() => navigate(`/reservierung/umbuchen/${reservation.confirmationCode}`, { state: { reservation, manageToken } })}
                    className="group relative bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,140,0,0.1)] cursor-pointer shadow-sm"
                  >
                    <div className="absolute top-4 right-4 text-slate-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                    <div className="mb-4 size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">edit_calendar</span>
                    </div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{t('bookingManageDetail.management.reschedule.title', 'Termin verschieben')}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {t('bookingManageDetail.management.reschedule.desc', 'Ändere Datum oder Uhrzeit deiner Reservierung. Verfügbarkeit vorbehalten.')}
                    </p>
                  </div>

                  {isPaid && (
                    <div className="group relative bg-amber-50 dark:bg-surface-dark/50 rounded-xl p-5 border border-amber-200 dark:border-amber-500/20 transition-all duration-300 shadow-sm">
                      <div className="mb-4 size-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <span className="material-symbols-outlined">currency_exchange</span>
                      </div>
                      <h4 className="text-amber-600 dark:text-amber-400 font-bold text-lg mb-1">
                        {t('bookingManageDetail.management.refund.title', 'Erstattung')}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <span className="text-amber-500 dark:text-amber-400/80 text-xs uppercase font-bold tracking-wider block mb-1">{t('bookingManageDetail.management.refund.badge', 'Info')}</span>
                        {t('bookingManageDetail.management.refund.desc', 'Bei einer Stornierung bis 48 Stunden vor Spielbeginn erhältst du automatisch eine volle Erstattung über Stripe.')}
                      </p>
                    </div>
                  )}

                  <div
                    onClick={() => navigate(`/reservierung/stornieren/${reservation.confirmationCode}`, { state: { reservation, manageToken } })}
                    className="group relative bg-red-50 dark:bg-surface-dark/50 rounded-xl p-5 border border-red-200 dark:border-red-500/30 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-100 dark:hover:bg-red-500/5 transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <div className="absolute top-4 right-4 text-red-400 dark:text-red-500/50 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </div>
                    <div className="mb-4 size-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500">
                      <span className="material-symbols-outlined">event_busy</span>
                    </div>
                    <h4 className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-500 font-bold text-lg mb-1 transition-colors">
                      {t('bookingManageDetail.management.cancel.title', 'Buchung Stornieren')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      <span className="text-red-500 dark:text-red-400/80 text-xs uppercase font-bold tracking-wider block mb-1">{t('bookingManageDetail.management.cancel.badge', 'Achtung')}</span>
                      {t('bookingManageDetail.management.cancel.desc', 'Stornierungen sind bis 48h vor Spielbeginn kostenlos. Danach fallen Gebühren an.')}
                    </p>
                  </div>
                </>
              )}

              {isCancelled && (
                <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-5 border border-red-200 dark:border-red-500/20">
                  <div className="mb-3 size-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500">
                    <span className="material-symbols-outlined">cancel</span>
                  </div>
                  <h4 className="text-red-600 dark:text-red-400 font-bold text-lg mb-1">
                    {t('bookingManageDetail.cancelled.title', 'Buchung storniert')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {t('bookingManageDetail.cancelled.desc', 'Diese Buchung wurde storniert. Wenn eine Erstattung fällig ist, wird sie innerhalb von 3-5 Werktagen bearbeitet.')}
                  </p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative border border-slate-300 dark:border-white/20 shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">support_agent</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{t('bookingManageDetail.management.help.title', 'Brauchst du Hilfe?')}</p>
                    <button className="text-primary text-sm hover:underline cursor-pointer bg-transparent border-none p-0" onClick={() => navigate('/kontakt')}>
                      {t('bookingManageDetail.management.help.link', 'Kontaktiere den Support')}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
