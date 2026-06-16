import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format, addDays, addMonths, startOfWeek, subWeeks, addWeeks, isSameDay, isBefore, startOfDay } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface HappyHourConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  discountPercent: number;
}

interface Field {
  id: number;
  name: string;
  supportedSports: string[];
  hourlyPrice: number;
  allowedDurations: number[];
  openingTime: string;
  closingTime: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  held: boolean;
}

interface FieldAvailability {
  fieldId: number;
  fieldName: string;
  date: string;
  durationMinutes: number;
  slots: TimeSlot[];
}

const isFootballType = (sports: string[]) => sports.includes('FOOTBALL') || sports.includes('REGULAR');
const isBubbleType = (sports: string[]) => sports.includes('BUBBLE_SOCCER') || sports.includes('BUBBLE');

const SPORT_CONFIG: Record<string, { icon: string; label: string; shortLabel: string }> = {
  'FOOTBALL': { icon: 'sports_soccer', label: 'Fußball', shortLabel: 'Fußb.' },
  'BUBBLE_SOCCER': { icon: 'bubble_chart', label: 'Bubble Soccer', shortLabel: 'Bubble' },
  'TENNIS': { icon: 'sports_tennis', label: 'Tennis', shortLabel: 'Tennis' },
  'BASKETBALL': { icon: 'sports_basketball', label: 'Basketball', shortLabel: 'Basket.' },
  'VOLLEYBALL': { icon: 'sports_volleyball', label: 'Volleyball', shortLabel: 'Volley.' },
};
const SPORT_ORDER = ['FOOTBALL', 'BUBBLE_SOCCER', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL'];

const fieldSupportsSport = (field: Field, sport: string): boolean => {
  const sports = field.supportedSports || [];
  if (sport === 'FOOTBALL') return isFootballType(sports);
  if (sport === 'BUBBLE_SOCCER') return isBubbleType(sports);
  return sports.includes(sport);
};


export const Booking = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : de;
  const TODAY = startOfDay(new Date());
  const MAX_BOOKING_DATE = addMonths(TODAY, 3);
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [gameType, setGameType] = useState<string>('FOOTBALL');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [sportPrices, setSportPrices] = useState({
    football: 80,
    bubble: 160,
    tennis: 0,
    basketball: 0,
    volleyball: 0
  });

  const availableSports = useMemo(() => {
    const sportSet = new Set<string>();
    fields.forEach(f => (f.supportedSports || []).forEach(s => {
      if (s === 'REGULAR') sportSet.add('FOOTBALL');
      else if (s === 'BUBBLE') sportSet.add('BUBBLE_SOCCER');
      else sportSet.add(s);
    }));
    return SPORT_ORDER.filter(s => sportSet.has(s));
  }, [fields]);

  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<{ date: string, startTime: string } | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const [happyHour, setHappyHour] = useState<HappyHourConfig | null>(null);

  useEffect(() => {
    api.get('/settings/happy-hour')
      .then((res: any) => setHappyHour(res.data.data))
      .catch(() => {});

    api.get('/settings/public')
      .then((res: any) => {
        const d = res.data.data || {};
        setSportPrices(prev => ({
          football: d['price_football'] ? Number(d['price_football']) : prev.football,
          bubble: d['price_bubble_soccer'] ? Number(d['price_bubble_soccer']) : prev.bubble,
          tennis: d['price_tennis'] ? Number(d['price_tennis']) : prev.tennis,
          basketball: d['price_basketball'] ? Number(d['price_basketball']) : prev.basketball,
          volleyball: d['price_volleyball'] ? Number(d['price_volleyball']) : prev.volleyball,
        }));
      })
      .catch(() => {});
  }, []);

  const isSlotInHappyHour = (hourStr: string): boolean => {
    if (!happyHour?.enabled) return false;
    const [sh, sm] = happyHour.startTime.split(':').map(Number);
    const [eh, em] = happyHour.endTime.split(':').map(Number);
    const [h, m] = hourStr.split(':').map(Number);
    const slotMins = h * 60 + m;
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (startMins <= endMins) {
      return slotMins >= startMins && slotMins < endMins;
    }
    return slotMins >= startMins || slotMins < endMins;
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await api.get('/fields');
        const data = response.data.data;
        if (data && data.length > 0) {
          setFields(data);
          const firstFootball = data.find((f: Field) => isFootballType(f.supportedSports || []));
          const initial = firstFootball || data[0];
          setSelectedFieldId(initial.id);
          if (isFootballType(initial.supportedSports || [])) setGameType('FOOTBALL');
          else if (isBubbleType(initial.supportedSports || [])) setGameType('BUBBLE_SOCCER');
          else setGameType(initial.supportedSports?.[0] || 'FOOTBALL');
        }
      } catch (error) {
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    if (!selectedFieldId) return;

    const fetchWeekAvailability = async () => {
      setIsLoading(true);
      try {
        const promises = [];
        for (let i = 0; i < 7; i++) {
          const day = addDays(weekStart, i);
          if (isBefore(day, TODAY) || isBefore(MAX_BOOKING_DATE, day)) continue;
          const dateStr = format(day, 'yyyy-MM-dd');
          promises.push(
            api.get(`/fields/${selectedFieldId}/availability`, {
              params: {
                date: dateStr,
                duration: durationMinutes
              }
            }).then((res: any) => ({ date: dateStr, slots: res.data.data.slots as TimeSlot[] }))
          );
        }

        const results = await Promise.all(promises);
        const newAvailability: Record<string, TimeSlot[]> = {};
        results.forEach((res: any) => {
          newAvailability[res.date] = res.slots;
        });
        setWeeklyAvailability(newAvailability);
        setApiError(null);
      } catch (error) {
        setApiError('Die Verfügbarkeiten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        setWeeklyAvailability({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeekAvailability();
    setSelectedSlot(null);
  }, [selectedFieldId, weekStart, durationMinutes]);

  const selectedField = useMemo(() => fields.find(f => f.id === selectedFieldId), [fields, selectedFieldId]);

  useEffect(() => {
    if (!selectedField) return;
    const allowed = selectedField.allowedDurations;
    if (allowed && allowed.length > 0 && !allowed.includes(durationMinutes)) {
      setDurationMinutes(allowed[0]);
    }
  }, [selectedField, durationMinutes]);

  const handlePrevWeek = () => {
    const prev = subWeeks(weekStart, 1);
    if (isBefore(addDays(prev, 6), TODAY)) return;
    setWeekStart(prev);
  };
  const handleNextWeek = () => {
    const next = addWeeks(weekStart, 1);
    if (isBefore(MAX_BOOKING_DATE, next)) return;
    setWeekStart(next);
  };

  const smallCalendarDays = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfCalendar = startOfWeek(startOfMonth, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 35; i++) {
        days.push(addDays(startOfCalendar, i));
    }
    return days;
  }, [currentDate]);

  const allHours = useMemo(() => {
    const hourSet = new Set<string>();
    Object.values(weeklyAvailability).forEach(daySlots => {
      daySlots.forEach(slot => {
        hourSet.add(slot.startTime.substring(11, 16));
      });
    });
    return Array.from(hourSet).sort();
  }, [weeklyAvailability]);

  const getEffectiveHourlyPrice = () => {
    if (gameType === 'FOOTBALL') return sportPrices.football;
    if (gameType === 'BUBBLE' || gameType === 'BUBBLE_SOCCER') return sportPrices.bubble;
    if (gameType === 'TENNIS') return sportPrices.tennis;
    if (gameType === 'BASKETBALL') return sportPrices.basketball;
    if (gameType === 'VOLLEYBALL') return sportPrices.volleyball;
    return selectedField ? selectedField.hourlyPrice : 0;
  };

  const calculatedPrice = useMemo(() => {
    if (!selectedField) return 0;
    const baseHourly = getEffectiveHourlyPrice();
    let price = (baseHourly / 60) * durationMinutes;
    if (selectedSlot && happyHour?.enabled) {
      const slotHour = selectedSlot.startTime.substring(11, 16);
      if (isSlotInHappyHour(slotHour)) {
        price = price * (1 - happyHour.discountPercent / 100);
      }
    }
    return price;
  }, [selectedField, gameType, sportPrices, durationMinutes, selectedSlot, happyHour]);

  const getSlotPrice = (hour?: string) => {
    if (!selectedField) return "-";
    const baseHourly = getEffectiveHourlyPrice();
    let price = (baseHourly / 60) * durationMinutes;
    if (hour && isSlotInHappyHour(hour) && happyHour) {
      price = price * (1 - happyHour.discountPercent / 100);
    }
    return `€${price.toFixed(0)}`;
  };

  const getOriginalPrice = () => {
    if (!selectedField) return "-";
    const baseHourly = getEffectiveHourlyPrice();
    return `€${((baseHourly / 60) * durationMinutes).toFixed(0)}`;
  };
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.07] grid-bg"
          style={{
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
          }}
        ></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="hidden md:flex w-full h-[calc(100vh-80px)] overflow-hidden relative z-10 text-slate-100">
        <aside className="w-80 flex-none glass-panel border-r border-white/5 flex flex-col z-10 overflow-y-auto bg-surface-dark/60">
          <div className="p-6 space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('booking.step1.sportType', 'Spielart')}</label>
              <div className="flex flex-wrap bg-[#141414] p-1.5 rounded-xl border border-white/5 shadow-sm gap-1">
                {availableSports.map(sport => {
                  const cfg = SPORT_CONFIG[sport];
                  if (!cfg) return null;
                  return (
                    <label key={sport} className="cursor-pointer relative flex-1 min-w-[80px]">
                      <input
                        className="sr-only-input peer"
                        name="gametype"
                        type="radio"
                        checked={gameType === sport}
                        onChange={() => {
                          setGameType(sport);
                          const first = fields.find(f => fieldSupportsSport(f, sport));
                          if (first) setSelectedFieldId(first.id);
                          setSelectedSlot(null);
                        }}
                      />
                      <div className="flex items-center justify-center py-3 rounded-lg text-sm font-bold text-slate-400 transition-all peer-checked:bg-[#FF5500] peer-checked:text-white hover:text-white">
                        <span className="material-symbols-outlined text-[20px] mr-2">{cfg.icon}</span>
                        {cfg.label}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('booking.step1.field', 'Spielfeld')}</label>
              <div className="relative">
                <select
                  className="w-full bg-[#141414] border border-white/5 text-white text-sm font-bold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                  value={selectedFieldId || ''}
                  onChange={(e) => {
                    setSelectedFieldId(Number(e.target.value));
                    setSelectedSlot(null);
                  }}
                >
                  {fields
                    .filter(f => fieldSupportsSport(f, gameType))
                    .map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('booking.step1.duration', 'Spieldauer')}</label>
              <div className="relative">
                <select
                  className="w-full bg-[#141414] border border-white/5 text-white text-sm font-bold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {(selectedField?.allowedDurations?.length ? selectedField.allowedDurations : [60, 90, 120]).map(mins => (
                    <option key={mins} value={mins}>
                      {mins === 60 ? `1 Stunde` : `${(mins / 60).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Stunden`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('booking.step1.date', 'Datum')}</label>
              <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentDate(subWeeks(currentDate, 4))} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <span className="text-sm font-bold text-white">{format(currentDate, 'MMMM yyyy', { locale: dateLocale })}</span>
                  <button onClick={() => setCurrentDate(addWeeks(currentDate, 4))} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-500 font-medium">
                  <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {smallCalendarDays.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelectedWeek = day >= weekStart && day < addDays(weekStart, 7);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isOutOfRange = isBefore(day, TODAY) || isBefore(MAX_BOOKING_DATE, day);

                    const isSelectedDate = isSameDay(day, selectedDate);
                    let btnClass = "h-8 w-8 flex items-center justify-center rounded-full transition-colors font-medium ";

                    if (isOutOfRange) {
                      btnClass += "text-slate-700 cursor-not-allowed opacity-40";
                    } else if (isSelectedDate) {
                      btnClass += "bg-primary text-white font-bold shadow-neon hover:bg-primary-dark";
                    } else if (isToday) {
                      btnClass += "border border-primary text-primary font-bold hover:bg-white/5";
                    } else if (isSelectedWeek) {
                      btnClass += "bg-white/10 text-white font-semibold";
                    } else if (!isCurrentMonth) {
                      btnClass += "text-slate-600 hover:bg-white/5";
                    } else {
                      btnClass += "text-slate-300 hover:bg-white/10";
                    }

                    return (
                      <button
                        key={idx}
                        className={btnClass}
                        disabled={isOutOfRange}
                        onClick={() => {
                          if (isOutOfRange) return;
                          setSelectedDate(day);
                          setWeekStart(startOfWeek(day, { weekStartsOn: 1 }));
                        }}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-surface-dark/50 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                <div>
                  <p className="text-xs font-bold text-white">{t('booking.step1.cancellation.title', 'Stornierung')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('booking.step1.cancellation.desc', 'Kostenlos bis 48h vor Spielbeginn.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-dark/50 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary mt-0.5">shower</span>
                <div>
                  <p className="text-xs font-bold text-white">{t('booking.step1.equipment.title', 'Ausstattung')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('booking.step1.equipment.desc', 'Duschen und Umkleiden inklusive.')}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative z-0 min-w-0">
          <div className="flex-none p-6 pb-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary tracking-tight">{t('booking.step1.chooseTime', 'WÄHLE DEINE ZEIT')}</h2>
                <p className="text-slate-400 text-sm mt-1">{t('booking.step1.timezone', 'Zeitzone')}: Europe/Vienna</p>
              </div>
              <div className="flex items-center gap-2 bg-surface-dark rounded-lg p-1 border border-white/10">
                <button onClick={handlePrevWeek} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <span className="px-4 text-sm font-semibold text-white">
                  {format(weekStart, `d. MMM`, { locale: dateLocale })}
                </span>
                <button onClick={handleNextWeek} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 pb-48">
            <div className="grid grid-cols-8 gap-3 mb-3 sticky top-0 z-20 bg-background-dark/95 backdrop-blur-sm py-2 border-b border-white/5">
              <div className="text-xs font-medium text-slate-500 flex items-end justify-center pb-1">ZEIT</div>
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const day = addDays(weekStart, offset);
                const isSelectedCol = isSameDay(day, selectedDate);
                const isDayOutOfRange = isBefore(day, TODAY) || isBefore(MAX_BOOKING_DATE, day);
                const isTodayStr = isSameDay(day, new Date()) ? 'ring-1 ring-primary/30' : '';
                return (
                  <div key={offset} className={`text-center rounded-lg pb-1 transition-colors ${isDayOutOfRange ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'} ${isTodayStr}`} onClick={() => !isDayOutOfRange && setSelectedDate(day)}>
                    <div className={`text-xs mb-1 mt-1 ${isSelectedCol && !isDayOutOfRange ? 'text-primary' : 'text-slate-400'}`}>
                      {format(day, 'E', { locale: dateLocale }).substring(0, 2)}
                    </div>
                    <div className={`text-sm font-bold ${isSelectedCol && !isDayOutOfRange ? 'text-primary' : isDayOutOfRange ? 'text-slate-600' : 'text-white'}`}>
                      {format(day, 'dd.MM')}
                    </div>
                    {isSelectedCol && !isDayOutOfRange && <div className="h-1 w-1 bg-primary rounded-full mx-auto mt-1 shadow-neon-sm"></div>}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center p-12 text-slate-400">
                  <span className="material-symbols-outlined animate-spin mr-3">refresh</span>
                  {t('common.loading', 'Laden...')}
                </div>
              ) : apiError ? (
                <div className="flex flex-col items-center justify-center p-12 text-red-400 border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
                  <span className="material-symbols-outlined text-3xl mb-3 opacity-80">error_outline</span>
                  <div className="text-sm font-bold">{t('booking.step1.apiError', 'Verbindungsfehler')}</div>
                  <div className="text-xs text-red-400/80 mt-1 max-w-xs text-center">{apiError}</div>
                  <button onClick={() => setDurationMinutes(durationMinutes)} className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                    {t('booking.step1.retry', 'Erneut versuchen')}
                  </button>
                </div>
              ) : allHours.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-slate-400 border border-dashed border-white/10 rounded-xl">
                  {t('booking.step1.noTimes', 'Keine Zeiten verfügbar')}
                </div>
              ) : (
                allHours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 gap-3 h-16">
                    <div className="flex items-center justify-center text-xs font-mono text-slate-500">{hour}</div>
                    {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                      const day = addDays(weekStart, offset);
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const daySlots = weeklyAvailability[dateStr] || [];
                      const slotData = daySlots.find(s => s.startTime.substring(11, 16) === hour);
                      
                      if (!slotData) {
                        return <div key={offset}></div>;
                      }

                      const isSelected = selectedSlot?.date === dateStr && selectedSlot?.startTime === slotData.startTime;

                      const isHH = isSlotInHappyHour(hour);

                      if (isSelected) {
                        return (
                          <div key={offset} className={`bg-primary/20 border border-primary rounded-md flex flex-col items-center justify-center cursor-pointer shadow-neon relative overflow-hidden`} onClick={() => setSelectedSlot(null)}>
                            <div className="absolute inset-0 bg-primary opacity-10 animate-pulse"></div>
                            <span className="text-sm font-bold text-white relative z-10">{getSlotPrice(hour)}</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wide relative z-10">{t('booking.step1.selected', 'Ausgewählt')}</span>
                            <span className="absolute top-1 right-1 text-[10px] text-white/50 font-mono">{(durationMinutes/60).toFixed(1)}h</span>
                          </div>
                        );
                      }

                      if (!slotData.available || slotData.held) {
                        return (
                          <div key={offset} className="bg-white/5 border border-transparent rounded-md flex flex-col items-center justify-center opacity-40 cursor-not-allowed">
                            <span className="text-xs font-medium text-slate-400">{t('booking.step1.status.booked', 'Belegt')}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={offset} onClick={() => {
                          setSelectedSlot({ date: dateStr, startTime: slotData.startTime });
                          setSelectedDate(day);
                        }} className={`glass-card rounded-md flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 relative overflow-hidden ${isHH ? 'border-primary/30 bg-primary/5' : ''}`}>
                          {isHH && (
                            <span className="absolute top-0.5 right-0.5 text-[7px] font-black text-primary uppercase leading-none bg-primary/10 px-1 rounded">-{happyHour!.discountPercent}%</span>
                          )}
                          {isHH ? (
                            <>
                              <span className="text-sm font-bold text-primary group-hover:text-white">{getSlotPrice(hour)}</span>
                              <span className="text-[8px] text-slate-500 line-through">{getOriginalPrice()}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-bold text-white group-hover:text-primary">{getSlotPrice(hour)}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{t('booking.step1.status.free', 'Frei')}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-5xl z-50 transition-all duration-300 ${selectedSlot ? 'translate-y-0 opacity-100 visible' : 'translate-y-20 opacity-0 invisible pointer-events-none'}`}>
          <div className="bg-surface-dark/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-neon p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
                <span className="material-symbols-outlined text-2xl">calendar_month</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{t('booking.step1.yourAppointment', 'Dein Termin')}</p>
                <h4 className="text-white font-bold text-sm sm:text-base">
                  {selectedSlot && selectedField 
                     ? `${selectedField.name} • ${format(new Date(selectedSlot.startTime), 'E dd. MMM, HH:mm', { locale: dateLocale })}`
                     : t('booking.step1.chooseTimeFirst', 'Wähle zuerst eine Uhrzeit aus')}
                </h4>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div className="text-right flex-1 sm:flex-none w-full sm:w-auto flex justify-between sm:block">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide text-left sm:text-right">{t('booking.step1.total', 'Gesamt')}</p>
              <h4 className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                 {selectedSlot ? `€${calculatedPrice.toFixed(2)}` : "€0,00"}
              </h4>
            </div>
            <button 
              onClick={() => {
                if (selectedSlot && selectedField) {
                  navigate('/reservierung/details', {
                    state: {
                      selectedField: {
                        id: selectedField.id,
                        name: selectedField.name,
                        type: gameType,
                        hourlyPrice: getEffectiveHourlyPrice()
                      },
                      selectedSlot: selectedSlot,
                      durationMinutes: durationMinutes,
                      calculatedPrice: calculatedPrice,
                      happyHourDiscount: (selectedSlot && happyHour?.enabled && isSlotInHappyHour(selectedSlot.startTime.substring(11, 16)))
                        ? ((getEffectiveHourlyPrice() / 60) * durationMinutes) - calculatedPrice
                        : 0
                    }
                  });
                }
              }}
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold h-12 px-8 rounded-xl shadow-[0_0_15px_rgba(255,68,0,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {t('booking.step1.continueBooking', 'JETZT RESERVIEREN')}
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:hidden w-full h-[calc(100vh-64px)] overflow-hidden relative z-10 text-slate-100">
        
        <div className="flex-none px-4 py-3 border-b border-white/5 bg-background-dark/95 backdrop-blur-md z-40">
          <button 
            className="w-full flex items-center justify-between bg-surface-dark border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-slate-200" 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              <span>Filter & Platzwahl</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-lg">
              {showMobileFilters ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          
          <div className={`${showMobileFilters ? 'block animate-in slide-in-from-top-2' : 'hidden'} mt-3 space-y-4 pb-2`}>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Spielfeld</label>
              <div className="relative">
                <select 
                  className="w-full bg-surface-dark border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={selectedFieldId || ''}
                  onChange={(e) => {
                    setSelectedFieldId(Number(e.target.value));
                    setShowMobileFilters(false);
                  }}
                >
                  {fields
                    .filter(f => fieldSupportsSport(f, gameType))
                    .map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Spielart</label>
                <div className="flex flex-wrap bg-surface-dark p-1 rounded-lg border border-white/10 gap-0.5">
                  {availableSports.map(sport => {
                    const cfg = SPORT_CONFIG[sport];
                    if (!cfg) return null;
                    return (
                      <label key={sport} className="flex-1 min-w-[60px] cursor-pointer relative">
                        <input
                          className="sr-only-input peer"
                          name="gametype-mob"
                          type="radio"
                          checked={gameType === sport}
                          onChange={() => {
                            setGameType(sport);
                            const first = fields.find(f => fieldSupportsSport(f, sport));
                            if (first) setSelectedFieldId(first.id);
                          }}
                        />
                        <div className="flex items-center justify-center py-2 rounded text-xs font-medium text-slate-400 transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-neon-sm">
                          <span className="material-symbols-outlined text-sm mr-1">{cfg.icon}</span>
                          {cfg.shortLabel}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dauer</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-dark border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                    value={durationMinutes}
                    onChange={(e) => {
                      setDurationMinutes(Number(e.target.value));
                      setShowMobileFilters(false);
                    }}
                  >
                    {(selectedField?.allowedDurations?.length ? selectedField.allowedDurations : [60, 90, 120]).map(mins => (
                      <option key={`mob-dur-${mins}`} value={mins}>
                        {mins === 60 ? '1 Stunde' : `${(mins / 60).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Stunden`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col relative z-0 min-w-0 overflow-hidden">
          <div className="flex-none bg-background-dark border-b border-white/5 z-30">
            <div className="flex overflow-x-auto hide-scrollbar py-3 px-4 gap-3 snap-x">
              {Array.from({ length: 90 }).map((_, i) => {
                const day = addDays(TODAY, i);
                if (isBefore(MAX_BOOKING_DATE, day)) return null;
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div 
                    key={i} 
                    className={`flex-none snap-start text-center min-w-14 cursor-pointer transition-all ${isSelected ? 'relative' : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => {
                      setSelectedDate(day);
                      setWeekStart(startOfWeek(day, { weekStartsOn: 1 }));
                      setSelectedSlot(null);
                    }}
                  >
                    <div className={`text-[10px] mb-0.5 ${isSelected ? 'text-primary font-medium' : 'text-slate-400'}`}>
                      {format(day, 'E', { locale: dateLocale }).substring(0, 2)}
                    </div>
                    <div className={`${isSelected ? 'text-lg font-bold text-primary' : 'text-sm font-bold text-slate-300'}`}>
                      {format(day, 'dd.MM')}
                    </div>
                    {isSelected && <div className="h-1 w-1 bg-primary rounded-full mx-auto mt-1 shadow-neon-sm absolute -bottom-1 left-1/2 -translate-x-1/2"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-3">
             {isLoading ? (
                <div className="flex items-center justify-center p-12 text-slate-400">
                  <span className="material-symbols-outlined animate-spin mr-3">refresh</span>
                  Laden...
                </div>
              ) : apiError ? (
                <div className="flex flex-col items-center justify-center p-12 text-red-400 border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
                  <span className="material-symbols-outlined text-3xl mb-3 opacity-80">error_outline</span>
                  <div className="text-sm font-bold">{t('booking.step1.apiError', 'Verbindungsfehler')}</div>
                  <div className="text-xs text-red-400/80 mt-1 max-w-xs text-center">{apiError}</div>
                  <button onClick={() => setDurationMinutes(durationMinutes)} className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                    {t('booking.step1.retry', 'Erneut versuchen')}
                  </button>
                </div>
              ) : allHours.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-slate-400 border border-dashed border-white/10 rounded-xl">
                  Keine Zeiten verfügbar.
                </div>
              ) : (
                allHours.map(hour => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const daySlots = weeklyAvailability[dateStr] || [];
                  const slotData = daySlots.find(s => s.startTime.substring(11, 16) === hour);
                  
                  if (!slotData) return null;

                  const [h, m] = hour.split(':').map(Number);
                  const totalMins = h * 60 + m + durationMinutes;
                  const endH = Math.floor(totalMins / 60) % 24;
                  const endM = totalMins % 60;
                  const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                  const isSelected = selectedSlot?.date === dateStr && selectedSlot?.startTime === slotData.startTime;

                  const mobileIsHH = isSlotInHappyHour(hour);

                  if (isSelected) {
                    return (
                      <div key={hour} onClick={() => setSelectedSlot(null)} className="bg-primary/10 border border-primary rounded-xl p-4 flex items-center justify-between shadow-neon relative overflow-hidden cursor-pointer">
                        <div className="absolute inset-0 bg-primary opacity-5 animate-pulse"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="flex flex-col items-center justify-center w-12 border-r border-primary/30 pr-4">
                            <span className="text-lg font-bold text-white">{hour}</span>
                            <span className="text-[10px] text-primary/80 font-mono">{endTimeStr}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{selectedField?.name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-wide">{t('booking.step1.selected', 'Ausgewählt')}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                          <span className="text-xl font-bold text-white">{getSlotPrice(hour)}</span>
                          {mobileIsHH && <span className="text-[10px] text-slate-400 line-through">{getOriginalPrice()}</span>}
                        </div>
                      </div>
                    );
                  }

                  if (!slotData.available || slotData.held) {
                    return (
                      <div key={hour} className="bg-white/5 border border-transparent rounded-xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12 border-r border-white/5 pr-4">
                            <span className="text-lg font-bold text-slate-400">{hour}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{endTimeStr}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-500">{selectedField?.name}</div>
                            <div className="text-xs text-slate-600">{t('booking.step1.unavailable', 'Nicht verfügbar')}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-500 uppercase border border-slate-700 px-2 py-1 rounded">{t('booking.step1.occupied', 'Belegt')}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={hour} onClick={() => setSelectedSlot({ date: dateStr, startTime: slotData.startTime })} className={`glass-card rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer ${mobileIsHH ? 'border-primary/30 bg-primary/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 border-r border-white/10 pr-4">
                          <span className="text-lg font-bold text-white">{hour}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{endTimeStr}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-300">{selectedField?.name}</div>
                          {mobileIsHH ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-primary uppercase">{t('booking.step1.happyHour.title', 'Happy Hour')}</span>
                              <span className="text-[9px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded">-{happyHour!.discountPercent}%</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Frei</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-lg font-bold ${mobileIsHH ? 'text-primary' : 'text-primary'}`}>{getSlotPrice(hour)}</span>
                        {mobileIsHH && <span className="text-[10px] text-slate-500 line-through">{getOriginalPrice()}</span>}
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </main>

        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-linear-to-t from-background-dark via-background-dark/95 to-transparent pb-6 pt-8 pointer-events-none transition-all duration-300 ${selectedSlot ? 'translate-y-0 opacity-100 visible' : 'translate-y-20 opacity-0 invisible'}`}>
          <div className="glass-panel rounded-2xl p-4 shadow-neon pointer-events-auto border-t border-white/10">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{t('booking.step1.yourAppointment', 'Dein Termin')}</span>
                <span className="text-sm font-semibold text-white">
                  {selectedSlot && selectedField 
                     ? `${format(new Date(selectedSlot.startTime), 'E dd. MMM, HH:mm', { locale: dateLocale })}`
                     : ""}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">{selectedSlot ? `€${calculatedPrice.toFixed(2)}` : ""}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                if (selectedSlot && selectedField) {
                  navigate('/reservierung/details', {
                    state: {
                      selectedField: {
                        id: selectedField.id,
                        name: selectedField.name,
                        type: gameType,
                        hourlyPrice: selectedField.hourlyPrice
                      },
                      selectedSlot: selectedSlot,
                      durationMinutes: durationMinutes,
                      calculatedPrice: calculatedPrice,
                      happyHourDiscount: (selectedSlot && happyHour?.enabled && isSlotInHappyHour(selectedSlot.startTime.substring(11, 16)))
                        ? ((selectedField.hourlyPrice / 60) * durationMinutes) - calculatedPrice
                        : 0
                    }
                  });
                }
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-xl shadow-[0_0_15px_rgba(255,68,0,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {t('booking.step1.continueBooking', 'JETZT RESERVIEREN')}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
