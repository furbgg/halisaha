import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export function BookingCancel() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : de;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const tokenFromHash = location.hash.startsWith('#mt=') ? decodeURIComponent(location.hash.slice(4)) : '';
  const manageToken =
    (location.state as any)?.manageToken ||
    tokenFromHash ||
    (id ? sessionStorage.getItem(`manage-token:${id}`) || '' : '');

  useEffect(() => {
    if (id && manageToken) {
      sessionStorage.setItem(`manage-token:${id}`, manageToken);
    }
  }, [id, manageToken]);

  useEffect(() => {
    if (!tokenFromHash) return;
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', cleanUrl);
  }, [tokenFromHash]);

  useEffect(() => {
    if (!id) {
      navigate('/reservierung/verwalten', { replace: true });
      return;
    }
    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/${id}`, {
          headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined,
        });
        setReservation(res.data.data);
      } catch (err: any) {
        setErrorStatus(err.response?.status || 500);
      } finally {
        setIsFetching(false);
      }
    };
    fetchReservation();
  }, [id, manageToken, navigate]);

  const handleCancelClick = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/reservations/${id}`, {
        headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined,
      });
      setShowSuccessModal(true);
    } catch (e) {
      alert(t('booking.cancel.error', 'Fehler bei der Stornierung.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  if (errorStatus === 404 || !reservation) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">cancel</span>
        <h2 className="text-2xl font-bold text-white mb-2">Reservierung nicht gefunden</h2>
        <p className="text-slate-400">Die gesuchte Reservierung existiert nicht oder wurde bereits gelöscht.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-medium">Zurück zur Startseite</button>
      </div>
    );
  }

  const reservationDate = new Date(reservation.startTime);
  const endDateTime = new Date(reservation.endTime);

  if (showSuccessModal) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative flex flex-col justify-center items-center h-full">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none z-0" 
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 140, 0, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-surface-dark/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_20px_rgba(255,140,0,0.1)]">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="size-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(255,140,0,0.3)] animate-bounce-short">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('booking.cancel.successTitle', 'Deine Buchung wurde erfolgreich storniert.')}</h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    {t('booking.cancel.successDesc', 'Eine Bestätigung wurde an deine E-Mail-Adresse gesendet. Die Rückerstattung wird innerhalb von 3-5 Werktagen bearbeitet.')}
                </p>
              </div>
              
              <div className="w-full bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col items-center gap-2">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{t('booking.cancel.cancelledBooking', 'Stornierte Buchung')}</span>
                <span className="text-white font-mono text-xl tracking-wide">{id}</span>
              </div>
              
              <div className="flex flex-col w-full gap-3 pt-2">
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                    {t('booking.cancel.backHome', 'ZURÜCK ZUR STARTSEITE')}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
                {t('booking.cancel.needHelp', 'Brauchst du Hilfe?')} <a className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 cursor-pointer" href="#">{t('booking.cancel.contactSupport', 'Kontaktiere unseren Support')}</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative flex flex-col justify-center items-center h-full">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 140, 0, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-6 text-center">
          <button 
            onClick={() => navigate(`/reservierung/verwalten/${id}`, { state: { manageToken } })}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-medium group cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('booking.cancel.backButton', 'Zurück zur Übersicht')}
          </button>
        </div>
        
        <div className="bg-surface-dark/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_20px_rgba(255,140,0,0.1)]">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('booking.cancel.confirmTitle', 'Möchtest du wirklich stornieren?')}</h1>
              <p className="text-slate-400 text-sm md:text-base">
                {t('booking.cancel.confirmDesc', 'Bitte bestätige die Stornierung deiner Buchung.')}
              </p>
            </div>
            
            <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{t('booking.cancel.id', 'Buchungs-Nr.')}</span>
                <span className="text-white font-mono text-sm">{id}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">stadium</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{reservation.fieldName || "Platz"}</p>
                  <p className="text-slate-400 text-xs">{format(reservationDate, 'EE. dd. MMM. yyyy • HH:mm', { locale: dateLocale })} - {format(endDateTime, 'HH:mm')}</p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-left backdrop-blur-sm">
              <span className="material-symbols-outlined text-red-400 shrink-0 mt-0.5">info</span>
              <p className="text-red-200/90 text-sm leading-relaxed">
                <span className="font-bold text-red-400 block mb-0.5">{t('booking.cancel.policyTitle', 'Stornierungsbedingungen')}</span>
                {t('booking.cancel.policyDesc', 'Stornierungen sind bis 48h vor Spielbeginn kostenlos. Danach wird eine Gebühr von 50% einbehalten.')}
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-3 pt-4">
              <button 
                onClick={handleCancelClick}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:text-white/50 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : null}
                  {t('booking.cancel.confirmPaidBtn', 'JETZT KOSTENPFLICHTIG STORNIEREN')}
              </button>
              <button 
                onClick={() => navigate(`/reservierung/verwalten/${id}`, { state: { manageToken } })}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 text-slate-300 font-medium text-sm transition-colors hover:text-white cursor-pointer"
              >
                  {t('booking.cancel.abortBtn', 'DOCH NICHT STORNIEREN')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {t('booking.cancel.haveQuestions', 'Hast du Fragen?')} <a className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 cursor-pointer" href="#">{t('booking.cancel.contactSupport', 'Kontaktiere unseren Support')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
