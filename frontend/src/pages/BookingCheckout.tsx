import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format, parseISO, addMinutes } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { HoldTimer } from '../components/common/HoldTimer';
import api from '../services/api';

interface EquipmentRentalItem {
  equipmentId: number;
  quantity: number;
  size: string;
}

interface LocationState {
  selectedField: {
    id: number;
    name: string;
    type: string;
    hourlyPrice: number;
  };
  selectedSlot: {
    date: string;
    startTime: string;
  };
  durationMinutes: number;
  calculatedPrice: number;
  userParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  sessionId?: string;
  happyHourDiscount?: number;
  equipmentRentals?: EquipmentRentalItem[];
  kramponTotalPrice?: number;
  kramponPricePerPair?: number;
}

type PaymentMode = 'stripe' | 'on_site';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({
  state,
  paymentMode,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
  privacyAccepted,
  notificationConsent,
  couponCode,
  paymentElementContainer,
}: {
  state: LocationState;
  paymentMode: PaymentMode;
  onSuccess: (data: any) => void;
  onError: (msg: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  privacyAccepted: boolean;
  notificationConsent: boolean;
  couponCode?: string | null;
  paymentElementContainer?: React.RefObject<HTMLDivElement | null>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!privacyAccepted) return;
    setIsProcessing(true);

    try {
      if (paymentMode === 'on_site') {
        const payload = { ...buildReservationPayload(state, notificationConsent, couponCode), paymentMethod: 'ON_SITE' };
        const res = await api.post('/reservations', payload);
        const reservation = res.data.data;

        onSuccess(reservation);
      } else {
        if (!stripe || !elements) {
          onError(t('booking.step3.error.stripeNotLoaded', 'Stripe ist noch nicht geladen. Bitte warten.'));
          setIsProcessing(false);
          return;
        }

        const payload = { ...buildReservationPayload(state, notificationConsent, couponCode), paymentMethod: 'CARD' };
        const res = await api.post('/reservations', payload);
        const reservation = res.data.data;
        const manageToken = reservation.manageToken || '';

        const paymentRes = await api.post(
          '/payments/create-intent',
          { reservationId: reservation.id, manageToken },
          {
            headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined,
          }
        );
        const { clientSecret } = paymentRes.data.data;

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/reservierung/success?code=${reservation.confirmationCode}`,
          },
          redirect: 'if_required',
        });

        if (error) {
          onError(error.message || t('booking.step3.error.paymentFailed', 'Zahlung fehlgeschlagen.'));
          setIsProcessing(false);
          return;
        }

        onSuccess(reservation);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('booking.step3.error.transactionFailed', 'Die Transaktion konnte nicht verarbeitet werden.');
      onError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={isProcessing || !privacyAccepted}
      className="w-full mt-8 bg-primary text-white dark:text-background-dark font-bold text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,87,34,0.3)] hover:shadow-[0_0_30px_rgba(255,87,34,0.5)] hover:bg-[#e65100] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <span className="material-symbols-outlined text-lg">lock</span>
      {isProcessing
        ? t('booking.step3.buttons.processing', 'Wird verarbeitet...')
        : paymentMode === 'on_site'
          ? t('booking.step3.buttons.bookOnSite', 'Jetzt buchen (Vor-Ort-Zahlung)')
          : t('booking.step3.buttons.pay', 'Jetzt zahlen & buchen')}
    </button>
  );
}

function buildReservationPayload(state: LocationState, notificationConsent: boolean, couponCode?: string | null) {
  return {
    fieldId: state.selectedField.id,
    gameType: state.selectedField.type,
    startTime: parseISO(state.selectedSlot.startTime).toISOString(),
    durationMinutes: state.durationMinutes,
    guestName: `${state.userParams.firstName || ''} ${state.userParams.lastName || ''}`.trim() || 'Gast',
    guestPhone: state.userParams.phone || '',
    guestEmail: state.userParams.email || '',
    privacyAccepted: true,
    notificationConsent,
    sessionId: state.sessionId,
    equipmentRentals: state.equipmentRentals?.length ? state.equipmentRentals : [],
    couponCode: couponCode || null,
  };
}

export function BookingCheckout() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : de;
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [notificationConsent, setNotificationConsent] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discountType: string; discountValue: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (!location.state || !(location.state as LocationState).sessionId) {
      navigate('/reservierung', { replace: true });
    }
  }, [location, navigate]);

  const state = location.state as LocationState | null;
  if (!state || !state.sessionId) return null;

  const { selectedField, selectedSlot, durationMinutes, calculatedPrice, userParams, sessionId } = state;
  const startDateTime = parseISO(selectedSlot.startTime);
  const endDateTime = addMinutes(startDateTime, durationMinutes);

  const discount = state.happyHourDiscount || 0;
  const kramponPrice = state.kramponTotalPrice || 0;
  const equipmentRentals = state.equipmentRentals || [];
  const totalKramponPairs = equipmentRentals.reduce((sum, r) => sum + r.quantity, 0);
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalTotal = calculatedPrice + kramponPrice - discount - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await api.post('/coupons/validate', {
        code: couponInput.trim(),
        orderAmount: calculatedPrice + kramponPrice,
      });
      const result = res.data.data;
      if (result.valid) {
        setAppliedCoupon({
          code: couponInput.trim().toUpperCase(),
          discountAmount: result.discountAmount,
          discountType: result.discountType,
          discountValue: result.discountValue,
        });
      } else {
        setCouponError(result.message || t('booking.step3.coupon.errorInvalid', 'Ungültiger Gutscheincode'));
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || t('booking.step3.coupon.errorCheck', 'Fehler bei der Gutschein-Prüfung'));
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSuccess = (reservation: any) => {
    navigate('/reservierung/success', {
      state: {
        bookingId: reservation.confirmationCode,
        selectedField,
        dateTime: {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          durationMinutes,
        },
        price: {
          total: reservation.totalPrice || finalTotal,
          status: paymentMode === 'on_site' ? 'Vor Ort' : 'Bezahlt',
        },
        paymentMode,
        manageToken: reservation.manageToken || null,
      },
      replace: true,
    });
  };

  const handleError = (errorMessage: string) => {
    navigate('/reservierung/failure', {
      state: {
        selectedField,
        price: { total: finalTotal },
        errorReason: errorMessage,
      },
      replace: true,
    });
  };

  const stripeAppearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#FF8C00',
      colorBackground: '#1a1510',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  };

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"></div>
          <div className="relative z-10 bg-surface-dark/90 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full text-center border border-primary/20 shadow-[0_0_50px_rgba(255,140,0,0.15)] animate-in fade-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute inset-2 rounded-full border border-primary/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '500ms' }}></div>
              <svg className="absolute inset-0 animate-spin" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,140,0,0.1)" strokeWidth="4" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#FF8C00" strokeWidth="4" strokeDasharray="80 210" strokeLinecap="round" />
              </svg>
              <div className="relative bg-background-dark rounded-full w-14 h-14 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                <span className="material-symbols-outlined text-3xl text-primary animate-pulse">sports_soccer</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {paymentMode === 'on_site'
                ? t('booking.step3.processing.titleOnSite', 'Buchung wird erstellt...')
                : t('booking.step3.processing.title', 'Sichere Zahlung wird verarbeitet...')}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {paymentMode === 'on_site'
                ? t('booking.step3.processing.subtitleOnSite', 'Deine Reservierung wird gespeichert. Bitte warten.')
                : t('booking.step3.processing.subtitle', 'Bitte warten, deine Zahlung wird sicher verarbeitet.')}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-orange-200">
              <span className="material-symbols-outlined text-sm text-primary">lock</span>
              <span>{t('booking.step3.processing.tls', 'TLS-Verschlüsselte Verbindung')}</span>
            </div>
          </div>
        </div>
      )}

      <div className={`grow flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden relative transition-all duration-500 ${isProcessing ? 'blur-sm pointer-events-none opacity-50 select-none' : ''}`}>
        <HoldTimer />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="w-full max-w-[1200px] flex flex-col gap-8">

          <nav aria-label="Progress" className="w-full py-4">
            <ol className="flex flex-wrap items-center gap-y-2 gap-x-4 md:gap-x-8 text-sm md:text-base">
              <li className="flex items-center text-primary/60 cursor-pointer transition-colors hover:text-primary" onClick={() => navigate('/reservierung')}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/60 mr-2 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span>
                </span>
                <span className="font-medium hover:underline">{t('booking.step3.flow.step1', '1. Termin wählen')}</span>
                <span className="ml-4 text-border-dark">/</span>
              </li>
              <li className="flex items-center text-primary/60 cursor-pointer transition-colors hover:text-primary" onClick={() => navigate(-1)}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/60 mr-2 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span>
                </span>
                <span className="font-medium hover:underline">{t('booking.step3.flow.step2', '2. Daten eingeben')}</span>
                <span className="ml-4 text-border-dark">/</span>
              </li>
              <li className="flex items-center text-primary">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-background-dark mr-2 text-xs font-bold shadow-[0_0_15px_rgba(255,87,34,0.5)]">3</span>
                <span className="font-bold">{t('booking.step3.flow.step3', '3. Zahlungsart wählen')}</span>
              </li>
            </ol>
          </nav>

          <Elements
            stripe={stripePromise}
            options={{
              mode: 'payment',
              amount: Math.round(finalTotal * 100),
              currency: 'eur',
              appearance: stripeAppearance,
            }}
          >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('booking.step3.payment.title', 'Zahlungsart wählen')}</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('booking.step3.payment.subtitle', 'Wähle deine bevorzugte Zahlungsmethode für die Buchung.')}</p>
              </div>

              <div className="flex flex-col gap-4">
                <label className="group cursor-pointer relative" onClick={() => setPaymentMode('stripe')}>
                  <div className={`bg-white/5 dark:bg-surface-dark/60 backdrop-blur-md p-5 rounded-xl border transition-all duration-300 hover:border-primary/50 ${paymentMode === 'stripe' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMode === 'stripe' ? 'border-primary' : 'border-slate-400'}`}>
                        {paymentMode === 'stripe' && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(249,115,22,0.5)]"></div>}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">{t('booking.step3.payment.online', 'Online bezahlen')}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{t('booking.step3.payment.onlineDesc', 'Kreditkarte, Google Pay, Apple Pay')}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-slate-100 dark:bg-white/10 rounded px-2 flex items-center justify-center text-slate-600 dark:text-white">
                            <span className="text-[10px] font-bold tracking-widest">VISA</span>
                          </div>
                          <div className="h-8 bg-slate-100 dark:bg-white/10 rounded px-2 flex items-center justify-center">
                            <div className="flex -space-x-1">
                              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-orange-400/80"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {paymentMode === 'stripe' && (
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <PaymentElement options={{ layout: 'tabs' }} />
                      </div>
                    )}
                  </div>
                </label>

                <label className="group cursor-pointer relative" onClick={() => setPaymentMode('on_site')}>
                  <div className={`bg-white/5 dark:bg-surface-dark/60 backdrop-blur-md p-5 rounded-xl border transition-all duration-300 hover:border-primary/50 ${paymentMode === 'on_site' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMode === 'on_site' ? 'border-primary' : 'border-slate-400'}`}>
                        {paymentMode === 'on_site' && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(249,115,22,0.5)]"></div>}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">{t('booking.step3.payment.onSite', 'Vor Ort bezahlen')}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{t('booking.step3.payment.onSiteDesc', 'Bar oder Karte bei Ankunft')}</span>
                        </div>
                        <div className="h-8 bg-slate-100 dark:bg-white/10 rounded px-2 flex items-center justify-center text-slate-600 dark:text-white">
                          <span className="material-symbols-outlined text-lg">storefront</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">{t('booking.step3.coupon.title', 'Gutscheincode')}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white dark:bg-background-dark border border-slate-300 dark:border-white/10 rounded-lg py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    placeholder={t('booking.step3.coupon.placeholder', 'Gutscheincode eingeben')}
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-6 py-2 rounded-lg border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      type="button"
                    >
                      {couponLoading ? (
                        <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        t('booking.step3.coupon.apply', 'Anwenden')
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      {t('booking.step3.coupon.remove', 'Entfernen')}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="mt-3 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-lg">confirmation_number</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-sm tracking-wider bg-primary/10 px-2 py-0.5 rounded">{appliedCoupon.code}</span>
                        <span className="text-green-400 text-xs font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          {t('booking.step3.coupon.applied', 'Angewendet')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        {appliedCoupon.discountType === 'PERCENTAGE'
                          ? `${appliedCoupon.discountValue}% Rabatt — Sie sparen €${appliedCoupon.discountAmount.toFixed(2)}`
                          : `€${appliedCoupon.discountValue.toFixed(2)} Rabatt — Sie sparen €${appliedCoupon.discountAmount.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={e => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-400 text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">
                    {t('booking.step3.consent.privacy', 'Ich akzeptiere die')}{' '}
                    <a href="/datenschutz" target="_blank" className="text-primary hover:underline">{t('booking.step3.consent.privacyLink', 'Datenschutzerklärung')}</a>
                    {' '}{t('booking.step3.consent.privacyAnd', 'und die')}{' '}
                    <a href="/agb" target="_blank" className="text-primary hover:underline">{t('booking.step3.consent.terms', 'AGB')}</a>.
                    <span className="text-red-400">*</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={notificationConsent}
                    onChange={e => setNotificationConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-400 text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">
                    {t('booking.step3.consent.notifications', 'Ich möchte Buchungsbestätigungen und Erinnerungen per E-Mail erhalten (optional).')}
                  </span>
                </label>
              </div>

              <div className="mt-4 hidden lg:block">
                <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors gap-1 text-sm bg-transparent border-none cursor-pointer">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  {t('booking.step3.buttons.back', 'Zurück zu den Daten')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className="bg-white/5 dark:bg-surface-dark/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 sticky top-24 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  {t('booking.step3.summary.title', 'Zusammenfassung')}
                </h3>

                <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/10">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-background-dark overflow-hidden shrink-0 border border-white/5 shadow-inner">
                      <img
                        src={selectedField.type === 'BUBBLE' ? '/bubblesoccer.png' : '/soccer.png'}
                        alt={selectedField.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-bold text-base">{selectedField.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {selectedField.type === 'BUBBLE' ? 'Bubble Soccer' : t('booking.step3.summary.soccer', 'Fußball')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary/80 text-lg">calendar_today</span>
                      <span>{format(startDateTime, 'EEEE, dd. MMM yyyy', { locale: dateLocale })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary/80 text-lg">schedule</span>
                      <span>{format(startDateTime, 'HH:mm')} - {format(endDateTime, 'HH:mm')} <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">({durationMinutes / 60}{t('booking.step3.summary.hours', 'h')})</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary/80 text-lg">person</span>
                      <div className="flex flex-col leading-tight">
                        <span>{userParams.firstName} {userParams.lastName}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{userParams.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-6 space-y-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>{t('booking.step3.summary.fieldRental', 'Platzmiete')} ({durationMinutes / 60} {t('booking.step3.summary.hours', 'Std')})</span>
                    <span className="text-slate-900 dark:text-white">€{calculatedPrice.toFixed(2)}</span>
                  </div>
                  {kramponPrice > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>{t('booking.step3.summary.krampon', 'Krampon')} ({totalKramponPairs} {t('booking.step3.summary.pair', 'Paar')})</span>
                      <span className="text-slate-900 dark:text-white">€{kramponPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>{t('booking.step3.summary.discount', 'Happy Hour Rabatt')}</span>
                      <span>-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">confirmation_number</span>
                        {t('booking.step3.summary.couponDiscount', 'Gutschein-Rabatt')}
                      </span>
                      <span>-€{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{t('booking.step3.summary.total', 'Gesamtbetrag')}</span>
                    <span className="text-3xl font-bold text-primary tracking-tight">€{finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 text-right">{t('booking.step3.summary.vatIncluded', 'Inkl. MwSt.')}</p>
                </div>

                <CheckoutForm
                  state={state}
                  paymentMode={paymentMode}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  privacyAccepted={privacyAccepted}
                  notificationConsent={notificationConsent}
                  couponCode={appliedCoupon?.code}
                />

                <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="text-[10px] uppercase tracking-wide font-medium">{t('booking.step3.summary.ssl', 'Sichere SSL-Verschlüsselung')}</span>
                </div>
              </div>

              <div className="lg:hidden text-center pb-8">
                <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors gap-1 text-sm bg-transparent border-none cursor-pointer">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  {t('booking.step3.buttons.back', 'Zurück zu den Daten')}
                </button>
              </div>
            </div>
          </div>
          </Elements>
        </div>
      </div>
    </>
  );
}
