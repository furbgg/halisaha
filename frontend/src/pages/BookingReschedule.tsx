import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  format, addMonths, subMonths, startOfMonth, 
  startOfWeek, addDays, isSameMonth, isSameDay, 
  parseISO, isBefore, startOfDay, addMinutes 
} from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation, Trans } from 'react-i18next';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  held: boolean;
}

export function BookingReschedule() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
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

  const dateLocale = i18n.language === 'tr' ? tr : de;

  const [currentMonthDate, setCurrentMonthDate] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotsCache, setSlotsCache] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [reservation, setReservation] = useState<any>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/${bookingId}`, {
          headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined,
        });
        const rData = res.data.data;
        setReservation(rData);
        if (rData.startTime) {
          const rDate = parseISO(rData.startTime);
          setCurrentMonthDate(startOfMonth(rDate));
          setSelectedDate(startOfDay(rDate));
        }
      } catch {
      } finally {
        setIsFetchingInfo(false);
      }
    };
    if (bookingId) fetchReservation();
  }, [bookingId, manageToken]);

  const oldAppointmentDate = reservation ? parseISO(reservation.startTime) : new Date();
  const oldAppointmentEnd = reservation ? parseISO(reservation.endTime) : new Date();
  const fieldId = reservation?.fieldId ?? 0;
  const duration = reservation?.durationMinutes ?? 60;
  const oldPrice = reservation?.totalPrice ?? 0;
  const fieldName = reservation?.fieldName ?? '';

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonthDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(startDate, i));
    }
    return days;
  }, [currentMonthDate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!fieldId || fieldId === 0) return;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (slotsCache[dateStr]) return;
      
      setIsLoading(true);
      try {
        const res = await api.get(`/fields/${fieldId}/availability`, {
          params: { date: dateStr, duration }
        });
        setSlotsCache(prev => ({ ...prev, [dateStr]: res.data.data.slots }));
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
    setSelectedSlot(null);
  }, [selectedDate, duration, fieldId]);

  const handlePrevMonth = () => setCurrentMonthDate(subMonths(currentMonthDate, 1));
  const handleNextMonth = () => setCurrentMonthDate(addMonths(currentMonthDate, 1));

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;
    setSelectedDate(day);
    if (!isSameMonth(day, currentMonthDate)) {
      setCurrentMonthDate(startOfMonth(day));
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    try {
      setIsLoading(true);
      await api.put(`/reservations/${bookingId}`, {
        startTime: selectedSlot.startTime,
        durationMinutes: duration
      }, {
        headers: manageToken ? { 'X-Manage-Token': manageToken } : undefined,
      });
      setShowSuccessModal(true);
    } catch {
      alert(t('bookingReschedule.error', "Fehler beim Verschieben des Termins."));
    } finally {
      setIsLoading(false);
    }
  };

  const currentSlots = slotsCache[format(selectedDate, 'yyyy-MM-dd')] || [];

  if (isFetchingInfo) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">event_busy</span>
        <h2 className="text-2xl font-bold text-white mb-2">{t('bookingReschedule.errorNotFound', 'Termin nicht gefunden')}</h2>
        <p className="text-slate-400">{t('bookingReschedule.errorNotFoundDesc', 'Die Reservierung konnte nicht gefunden werden oder wurde bereits storniert.')}</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-medium">{t('bookingReschedule.btnHome', 'Zurück zur Startseite')}</button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm bg-black/70 transition-opacity duration-300 ${showSuccessModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`relative w-full max-w-md bg-surface-dark/90 backdrop-blur-xl border-2 border-primary rounded-2xl p-8 shadow-[0_0_50px_rgba(255,140,0,0.15)] transform transition-all duration-500 flex flex-col items-center text-center ${showSuccessModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`} style={{ boxShadow: '0 0 5px rgba(255, 140, 0, 0.2), inset 0 0 5px rgba(255, 140, 0, 0.1)' }}>
          <button 
            onClick={() => navigate(`/reservierung/verwalten/${bookingId}`, { state: { manageToken } })}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          
          <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary shadow-[0_0_20px_rgba(255,140,0,0.3)] animate-in zoom-in duration-500 delay-150">
            <span className="material-symbols-outlined text-primary text-[48px] font-bold">check</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight" style={{ textShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }}>
            {t('bookingReschedule.success.title', 'Erfolgreich verschoben!')}
          </h2>
          
          <p className="text-slate-300 leading-relaxed mb-8">
            <Trans i18nKey="bookingReschedule.success.desc" components={{ 1: <span className="text-white font-semibold" /> }} values={{ date: selectedSlot ? `${format(selectedDate, 'EE. d. MMM', { locale: dateLocale })} um ${format(parseISO(selectedSlot.startTime), 'HH:mm')} Uhr` : '' }}>
              Dein neuer Termin am <span className="text-white font-semibold">{selectedSlot ? `${format(selectedDate, 'EE. d. MMM', { locale: dateLocale })} um ${format(parseISO(selectedSlot.startTime), 'HH:mm')} Uhr` : ''}</span> wurde bestätigt. Wir haben dir eine neue Bestätigungs-E-Mail gesendet.
            </Trans>
          </p>
          
          <button 
            onClick={() => navigate(`/reservierung/verwalten/${bookingId}`, { state: { manageToken } })}
            className="w-full bg-primary hover:bg-orange-600 text-white font-black py-3.5 px-6 rounded-lg text-sm tracking-wide uppercase transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,140,0,0.4)] cursor-pointer"
          >
            {t('bookingReschedule.success.btn', 'ZURÜCK ZUR ÜBERSICHT')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 lg:p-8 w-full relative">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none z-0" 
          style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      
      <div className="w-full max-w-[1024px] flex flex-col gap-8 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            <span>{t('bookingReschedule.subtitle', 'Buchung Verwalten')}</span>
          </div>
          <h1 className="text-primary text-3xl lg:text-4xl font-bold tracking-tight">{t('bookingReschedule.title', 'Termin verschieben')}</h1>
          <p className="text-slate-400 max-w-2xl">
            {t('bookingReschedule.desc', 'Wählen Sie ein neues Datum und eine neue Uhrzeit für Ihr Spiel. Änderungen sind bis 48 Stunden vor Spielbeginn kostenlos.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="bg-surface-dark/80 backdrop-blur-xl p-5 rounded-xl border-l-4 border-l-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{t('bookingReschedule.current.title', 'Aktueller Termin')}</p>
                <div className="flex items-center gap-2 text-white text-lg font-bold">
                  <span className="material-symbols-outlined text-primary">event_available</span>
                  <span>{format(oldAppointmentDate, 'EE. dd. MMM, HH:mm', { locale: dateLocale })} - {format(oldAppointmentEnd, 'HH:mm', { locale: dateLocale })}</span>
                </div>
                <p className="text-slate-500 text-sm">{fieldName} • {reservation.durationMinutes} Min</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-white/10"></div>
              <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-400">{t('bookingReschedule.current.duration', 'Dauer')}</p>
                  <p className="font-bold text-white">{duration} Min</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{t('bookingReschedule.current.price', 'Preis')}</p>
                  <p className="font-bold text-white">{oldPrice.toFixed(2)} €</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-dark/80 backdrop-blur-xl rounded-xl p-6 flex flex-col gap-6 border border-white/5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-bold">{t('bookingReschedule.calendar.title', 'Neues Datum wählen')}</h3>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
                  <button onClick={handlePrevMonth} className="p-1 hover:text-primary transition-colors text-slate-400 cursor-pointer">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="text-sm font-semibold px-2 min-w-[120px] text-center text-white">
                    {format(currentMonthDate, 'MMMM yyyy', { locale: dateLocale })}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:text-primary transition-colors text-slate-400 cursor-pointer">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-7 mb-2">
                  {(t('bookingReschedule.calendar.days', { returnObjects: true }) as string[]).map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 lg:gap-2">
                  {calendarDays.map((day, i) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isSelected = isSameDay(day, selectedDate);
                    const isOldDate = isSameDay(day, oldAppointmentDate);
                    const isSameMo = isSameMonth(day, currentMonthDate);

                    let btnClass = "relative h-10 lg:h-12 rounded-lg flex items-center justify-center text-sm transition-all ";
                    
                    if (isPast) {
                      btnClass += "text-slate-600 cursor-not-allowed ";
                    } else if (isSelected) {
                      btnClass += "bg-primary text-white font-bold shadow-[0_0_15px_rgba(255,107,0,0.3)] ";
                    } else {
                      btnClass += `hover:bg-white/5 hover:text-white cursor-pointer ${isSameMo ? 'text-slate-300' : 'text-slate-600'}`;
                    }

                    if (isOldDate && !isSelected) {
                      btnClass += " border border-white/10 bg-white/5 text-slate-400";
                    }

                    return (
                      <button 
                        key={i} 
                        disabled={isPast} 
                        onClick={() => handleDateClick(day)} 
                        className={btnClass}
                      >
                        {format(day, 'd')}
                        {isSelected && !isOldDate && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>}
                        {isOldDate && <div className="absolute top-1 right-1 text-[8px] text-slate-500">{t('bookingReschedule.current.tag', 'OLD')}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="bg-surface-dark/80 backdrop-blur-xl rounded-xl p-6 flex flex-col gap-4 border border-white/5 shadow-sm min-h-[160px]">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-bold">{t('bookingReschedule.slots.title', 'Verfügbare Zeiten')} <span className="text-primary font-normal text-base ml-1">({duration / 60} Std)</span></h3>
                <div className="text-xs text-slate-400 flex gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full border border-primary"></div>
                    {t('bookingReschedule.slots.available', 'Verfügbar')}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    {t('bookingReschedule.slots.selected', 'Gewählt')}
                  </div>
                </div>
              </div>

              {isLoading ? (
                 <div className="flex items-center justify-center h-24 text-primary animate-pulse">
                   <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                   <span className="ml-2 font-medium">{t('bookingReschedule.slots.loading', 'Lade Termine...')}</span>
                 </div>
              ) : currentSlots.length === 0 ? (
                 <div className="text-center text-slate-500 py-6 text-sm">
                    {t('bookingReschedule.slots.empty', 'Für dieses Datum sind leider keine passenden Termine (mehr) verfügbar.')}
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {currentSlots.map((slot, idx) => {
                    const startT = format(parseISO(slot.startTime), 'HH:mm');
                    const endT = format(parseISO(slot.endTime), 'HH:mm');
                    
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    const isDisabled = !slot.available;

                    if (isDisabled) {
                      return (
                        <button key={idx} className="relative flex flex-col items-center justify-center p-3 rounded-lg border border-transparent bg-white/5 text-slate-600 cursor-not-allowed opacity-50" disabled>
                          <span className="font-bold text-lg line-through decoration-slate-600">{startT}</span>
                          <span className="text-xs">- {endT}</span>
                        </button>
                      );
                    }

                    if (isSelected) {
                      return (
                        <button key={idx} className="relative flex flex-col items-center justify-center p-3 rounded-lg bg-primary text-white shadow-[0_0_15px_rgba(255,107,0,0.25)] ring-1 ring-primary ring-offset-2 ring-offset-surface-dark transition-all transform scale-[1.02] cursor-pointer">
                          <div className="absolute top-1 right-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          </div>
                          <span className="font-black text-lg">{startT}</span>
                          <span className="text-xs font-semibold opacity-90">- {endT}</span>
                        </button>
                      );
                    }

                    return (
                      <button 
                        key={idx} 
                        onClick={() => handleSlotClick(slot)}
                        className="group relative flex flex-col items-center justify-center p-3 rounded-lg border border-primary/30 bg-[#1a1a1a] hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all duration-200 cursor-pointer"
                      >
                        <span className="text-white font-bold text-lg group-hover:text-primary transition-colors">{startT}</span>
                        <span className="text-xs text-slate-500 group-hover:text-primary/70">- {endT}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-dark/80 backdrop-blur-xl p-6 rounded-xl flex flex-col gap-6 sticky top-24 border border-white/5 shadow-sm">
              <h3 className="text-white font-bold text-lg pb-4 border-b border-white/10">{t('bookingReschedule.summary.title', 'Zusammenfassung')}</h3>
              
              <div className="flex flex-col gap-4 relative">
                <div className="absolute left-[11px] top-8 bottom-8 w-[2px] bg-white/10"></div>
                
                <div className="flex gap-3 items-start opacity-60">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 z-10 border border-white/10">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">history</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">{t('bookingReschedule.summary.old', 'Alter Termin')}</p>
                    <p className="text-sm text-slate-300">{format(oldAppointmentDate, 'EE. dd. MMM', { locale: dateLocale })}</p>
                    <p className="text-sm text-slate-300">18:00 - 19:30</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(255,107,0,0.4)]">
                    <span className="material-symbols-outlined text-[14px] text-white font-bold">update</span>
                  </div>
                  <div className={`transition-all duration-300 ${!selectedSlot ? 'opacity-50' : 'opacity-100'}`}>
                    <p className="text-xs text-primary uppercase font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]">{t('bookingReschedule.summary.new', 'Neuer Termin')}</p>
                    <p className="text-lg text-white font-bold">
                      {format(selectedDate, 'EE. dd. MMM', { locale: dateLocale })}
                    </p>
                    <p className="text-lg text-white font-bold">
                      {selectedSlot 
                          ? `${format(parseISO(selectedSlot.startTime), 'HH:mm')} - ${format(parseISO(selectedSlot.endTime), 'HH:mm')}`
                          : "---"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-slate-400 text-sm">{t('bookingReschedule.summary.fee', 'Änderungsgebühr')}</span>
                <span className="text-primary font-bold">0,00 €</span>
              </div>
              
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  onClick={handleSubmit}
                  disabled={!selectedSlot}
                  className="w-full bg-primary hover:bg-orange-600 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-lg text-base tracking-wide uppercase transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,107,0,0.4)] disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">check</span>
                  {t('bookingReschedule.summary.submit', 'Termin jetzt ändern')}
                </button>
                <button 
                  onClick={() => navigate(`/reservierung/verwalten/${bookingId}`)}
                  className="w-full text-center text-slate-400 hover:text-white py-2 text-sm font-medium transition-colors border border-transparent hover:border-white/10 rounded-lg cursor-pointer bg-transparent"
                >
                  {t('bookingReschedule.summary.cancel', 'Abbrechen & Zurück')}
                </button>
              </div>
              
              <div className="flex gap-2 items-center justify-center mt-2">
                <span className="material-symbols-outlined text-slate-600 text-[14px]">lock</span>
                <span className="text-[10px] text-slate-500">{t('bookingReschedule.summary.secure', 'Sichere Verbindung & Datenverarbeitung')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
