import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO, addMinutes } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { HoldTimer } from '../components/common/HoldTimer';
import { equipmentService, type Equipment, type SizeAvailability } from '../services/equipmentService';
import { ADDRESS_STREET, ADDRESS_ZIP, ADDRESS_CITY } from '../config/brand';

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
  happyHourDiscount?: number;
}

interface KramponPair {
  size: string;
  quantity: number;
}

export function BookingDetails() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : de;
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [krampon, setKrampon] = useState<Equipment | null>(null);
  const [sizeAvailability, setSizeAvailability] = useState<SizeAvailability[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addedPairs, setAddedPairs] = useState<KramponPair[]>([]);
  const [kramponLoading, setKramponLoading] = useState(true);

  useEffect(() => {
    if (!location.state || !location.state.selectedSlot) {
      navigate('/reservierung', { replace: true });
    }
  }, [location, navigate]);

  const state = location.state as LocationState | null;

  const startDateTime = state ? parseISO(state.selectedSlot.startTime) : new Date();
  const endDateTime = state ? addMinutes(startDateTime, state.durationMinutes) : new Date();
  const durationHours = state ? state.durationMinutes / 60 : 1;

  useEffect(() => {
    if (!state) return;
    const loadKrampon = async () => {
      try {
        const res = await equipmentService.getRentable();
        const rentables = res.data.data;
        const kramponEquipment = rentables?.find((e: Equipment) => e.category === 'KRAMPON');
        if (kramponEquipment) {
          setKrampon(kramponEquipment);
          const availRes = await equipmentService.getAvailability(
            kramponEquipment.id,
            state.selectedSlot.startTime,
            endDateTime.toISOString()
          );
          setSizeAvailability(availRes.data.data || []);
        }
      } catch {
      } finally {
        setKramponLoading(false);
      }
    };
    loadKrampon();
  }, []);

  if (!state) return null;

  const { selectedField, selectedSlot, durationMinutes, calculatedPrice } = state;

  const kramponPricePerPair = krampon ? krampon.rentalPricePerHour * durationHours : 0;
  const totalKramponPairs = addedPairs.reduce((sum, p) => sum + p.quantity, 0);
  const totalKramponPrice = kramponPricePerPair * totalKramponPairs;
  const totalPrice = calculatedPrice + totalKramponPrice;

  const availableSizes = sizeAvailability.filter(s => {
    const alreadyAdded = addedPairs.filter(p => p.size === s.size).reduce((sum, p) => sum + p.quantity, 0);
    return (s.available - alreadyAdded) > 0;
  });

  const getAvailableForSize = (size: string) => {
    const sizeData = sizeAvailability.find(s => s.size === size);
    if (!sizeData) return 0;
    const alreadyAdded = addedPairs.filter(p => p.size === size).reduce((sum, p) => sum + p.quantity, 0);
    return sizeData.available - alreadyAdded;
  };

  const handleAddPair = () => {
    if (!selectedSize) return;
    const available = getAvailableForSize(selectedSize);
    if (available <= 0) return;

    const existingIndex = addedPairs.findIndex(p => p.size === selectedSize);
    if (existingIndex >= 0) {
      const updated = [...addedPairs];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 };
      setAddedPairs(updated);
    } else {
      setAddedPairs([...addedPairs, { size: selectedSize, quantity: 1 }]);
    }
    setSelectedSize('');
  };

  const handleRemovePair = (index: number) => {
    const updated = [...addedPairs];
    if (updated[index].quantity > 1) {
      updated[index] = { ...updated[index], quantity: updated[index].quantity - 1 };
    } else {
      updated.splice(index, 1);
    }
    setAddedPairs(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleHoldAndProceed = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError(t('booking.step2.error.fillRequired', 'Bitte fülle alle Pflichtfelder aus.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      const payload = {
        fieldId: selectedField.id,
        startTime: selectedSlot.startTime,
        durationMinutes: durationMinutes,
        sessionId: sessionId,
      };

      const res = await api.post('/reservations/hold', payload);
      if (res.status === 201 || res.status === 200) {
        const equipmentRentals = krampon && addedPairs.length > 0
          ? addedPairs.map(pair => ({
              equipmentId: krampon.id,
              quantity: pair.quantity,
              size: pair.size,
            }))
          : [];

        navigate('/reservierung/checkout', {
          state: {
            ...state,
            userParams: formData,
            sessionId: sessionId,
            equipmentRentals,
            kramponTotalPrice: totalKramponPrice,
            kramponPricePerPair,
          }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('booking.step2.error.unavailable', 'Der gewählte Termin ist leider nicht mehr verfügbar.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grow flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <HoldTimer />
      <div className="w-full max-w-[1200px] flex flex-col gap-8">

        <nav aria-label="Progress" className="w-full py-4">
          <ol className="flex flex-wrap items-center gap-y-2 gap-x-4 md:gap-x-8 text-sm md:text-base">
            <li className="flex items-center text-primary/60 cursor-pointer" onClick={() => navigate(-1)}>
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/60 mr-2 text-xs">
                <span className="material-symbols-outlined text-sm">check</span>
              </span>
              <span className="font-medium hover:underline">{t('booking.step2.flow.step1', '1. Termin wählen')}</span>
              <span className="ml-4 text-border-dark">/</span>
            </li>
            <li className="flex items-center text-primary">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-background-dark mr-2 text-xs font-bold">2</span>
              <span className="font-bold">{t('booking.step2.flow.step2', '2. Daten eingeben')}</span>
              <span className="ml-4 text-border-dark">/</span>
            </li>
            <li className="flex items-center text-white/30">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 mr-2 text-xs font-medium">3</span>
              <span className="font-medium">{t('booking.step2.flow.step3', '3. Bestätigung')}</span>
            </li>
          </ol>
        </nav>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500 flex items-center gap-3">
             <span className="material-symbols-outlined">error</span>
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          <div className="flex-1 w-full max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('booking.step2.title', 'Deine Informationen')}</h1>
              <p className="text-slate-600 dark:text-white/60 text-sm md:text-base">{t('booking.step2.subtitle', 'Bitte gib deine Daten ein, um die Reservierung abzuschließen.')}</p>
            </div>

            <form id="booking-form" className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleHoldAndProceed(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-white/90">{t('booking.step2.form.firstName', 'Vorname')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-white/40 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark pl-10 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-white/90">{t('booking.step2.form.lastName', 'Nachname')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-white/40 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark pl-10 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-white/90">{t('booking.step2.form.email', 'E-Mail-Adresse')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-white/40 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark pl-10 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                    placeholder="max.mustermann@beispiel.com"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-white/90">{t('booking.step2.form.phone', 'Telefonnummer')}</label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-border-dark bg-slate-100 dark:bg-surface-dark/50 text-slate-600 dark:text-white/80 sm:text-sm">
                    <img src="https://flagcdn.com/w40/at.png" alt="Austria Flag" className="mr-2" width="20" />
                    +43
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 block w-full min-w-0 rounded-none rounded-r-lg border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark py-3 px-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                    placeholder="650 1234567"
                  />
                </div>
              </div>

              {!kramponLoading && krampon && (
                <div className="pt-2">
                  <div className="border-t border-slate-200 dark:border-border-dark pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('booking.step2.equipment.title', 'Mietmaterial')}</h3>
                        <p className="text-xs text-slate-500 dark:text-white/50">{t('booking.step2.equipment.subtitle', 'Optional — Krampon direkt vor Ort leihen')}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{krampon.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">€{kramponPricePerPair.toFixed(2)} / {t('booking.step2.equipment.pair', 'Paar')} ({durationHours}h)</p>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 rounded-full px-3 py-1 font-medium">
                          {t('booking.step2.equipment.available', 'Verfügbar')}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2">{t('booking.step2.equipment.chooseSize', 'Größe wählen')}</label>
                        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                          {sizeAvailability.map(s => {
                            const avail = getAvailableForSize(s.size || '');
                            const isSelected = selectedSize === s.size;
                            const isOutOfStock = avail <= 0;
                            return (
                              <button
                                key={s.size}
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => setSelectedSize(isSelected ? '' : (s.size || ''))}
                                className={`
                                  relative flex flex-col items-center justify-center rounded-lg border py-2.5 px-1 text-sm font-medium transition-all duration-150
                                  ${isOutOfStock
                                    ? 'border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] text-slate-300 dark:text-white/15 cursor-not-allowed line-through'
                                    : isSelected
                                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-[0_0_10px_rgba(255,140,0,0.15)]'
                                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-700 dark:text-white/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                  }
                                `}
                              >
                                <span className="text-[13px] font-bold">{s.size}</span>
                                <span className={`text-[10px] mt-0.5 ${isOutOfStock ? 'text-red-400/60' : isSelected ? 'text-primary/70' : 'text-slate-400 dark:text-white/30'}`}>
                                  {isOutOfStock ? t('booking.step2.equipment.outOfStock', 'Vergriffen') : `${avail}×`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddPair}
                        disabled={!selectedSize}
                        className="mt-4 w-full bg-primary hover:bg-[#e67e00] disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-white dark:text-background-dark disabled:text-slate-400 dark:disabled:text-white/20 font-semibold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        {selectedSize
                          ? t('booking.step2.equipment.addSize', { size: selectedSize, price: kramponPricePerPair.toFixed(2), defaultValue: `Größe ${selectedSize} hinzufügen (+€${kramponPricePerPair.toFixed(2)})` })
                          : t('booking.step2.equipment.selectSizeFirst', 'Größe auswählen...')}
                      </button>

                      {addedPairs.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">{t('booking.step2.equipment.selected', 'Ausgewählt')}</p>
                          {addedPairs.map((pair, idx) => (
                            <div
                              key={`${pair.size}-${idx}`}
                              className="flex items-center justify-between bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-white/10 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">{pair.size}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {krampon.name} — Größe {pair.size}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-white/50">
                                    {pair.quantity}× {t('booking.step2.equipment.pair', 'Paar')} · €{(kramponPricePerPair * pair.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePair(idx)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                                title="Entfernen"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {pair.quantity > 1 ? 'remove' : 'delete'}
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4"></div>

              <div className="hidden lg:flex items-center justify-between pt-6 border-t border-slate-200 dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="group flex items-center text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined mr-1 group-hover:-translate-x-1 transition-transform text-lg">arrow_back</span>
                  {t('booking.step2.buttons.back', 'Zurück zur Auswahl')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden bg-primary hover:bg-[#e67e00] text-white dark:text-background-dark font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(255,140,0,0.3)] hover:shadow-[0_0_25px_rgba(255,140,0,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? t('booking.step2.buttons.loading', 'LÄDT...') : t('booking.step2.buttons.continue', 'WEITER ZUR ZAHLUNG')}
                    <span className="material-symbols-outlined text-lg">{isLoading ? 'sync' : 'arrow_forward'}</span>
                  </span>
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  {t('booking.step2.summary.title', 'Zusammenfassung')}
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-xl bg-background-dark border border-white/5 overflow-hidden shrink-0 shadow-inner">
                       <img
                         src={selectedField.type === 'FOOTBALL' ? '/soccer.png' : '/bubblesoccer.png'}
                         alt={selectedField.name}
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{selectedField.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedField.type === 'FOOTBALL' ? t('booking.step2.summary.soccer', 'Soccer') : t('booking.step2.summary.bubbleSoccer', 'Bubble Soccer')}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-white/10 my-4"></div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">calendar_month</span>
                      <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-white/60">{t('booking.step2.summary.date', 'Datum')}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{format(startDateTime, 'EEEE, dd. MMM yyyy', { locale: dateLocale })}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">schedule</span>
                      <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-white/60">{t('booking.step2.summary.time', 'Uhrzeit')}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{format(startDateTime, 'HH:mm')} - {format(endDateTime, 'HH:mm')} Uhr</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
                      <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-white/60">{t('booking.step2.summary.location', 'Ort')}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{ADDRESS_STREET}, {ADDRESS_ZIP} {ADDRESS_CITY}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-white/10 pt-4 mb-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-white/70">{t('booking.step2.summary.fieldRental', 'Platzmiete')} ({durationHours}h)</span>
                    <span className="text-slate-900 dark:text-white font-medium">€{calculatedPrice.toFixed(2)}</span>
                  </div>

                  {totalKramponPairs > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('booking.step2.summary.krampon', 'Krampon')} ({totalKramponPairs} {t('booking.step2.equipment.pair', 'Paar')})
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">€{totalKramponPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-slate-600 dark:text-white/70">{t('booking.step2.summary.total', 'Gesamtbetrag')}</span>
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">€{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-right text-xs text-primary mt-1 flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {t('booking.step2.summary.vatIncluded', 'Inkl. MwSt.')}
                  </p>
                </div>

                <div className="lg:hidden">
                  <button
                    type="submit"
                    form="booking-form"
                    disabled={isLoading}
                    className="w-full relative overflow-hidden bg-primary hover:bg-[#e67e00] text-white dark:text-background-dark font-bold py-3 px-4 rounded-lg shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? t('booking.step2.buttons.loading', 'LÄDT...') : t('booking.step2.buttons.continue', 'WEITER ZUR ZAHLUNG')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-3 w-full text-sm font-medium py-2 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white"
                  >
                    {t('booking.step2.buttons.back', 'Zurück zur Auswahl')}
                  </button>
                </div>

                <div className="mt-4 bg-primary/10 rounded-lg p-3 border border-primary/20 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-white/80">
                    {t('booking.step2.summary.cancellation', 'Kostenlose Stornierung bis 48 Stunden vor Spielbeginn möglich.')}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
