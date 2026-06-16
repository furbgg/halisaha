import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation, Trans } from 'react-i18next';
import {
  adminReservationService,
  type AdminReservation,
  type ReservationStatus,
  type ReservationStats,
} from '../../services/adminReservationService';
import { fieldService } from '../../services/fieldService';
import { reservationService } from '../../services/reservationService';
import type { Field, TimeSlot } from '../../types/field';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../../types/api';

type SortKey = 'id' | 'customer' | 'field' | 'date' | 'time' | 'status' | 'price';
type SortDir = 'asc' | 'desc';

/* ═══════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════ */

const PAGE_SIZE = 10;

type FilterKey = 'all' | 'today' | 'tomorrow' | 'week' | 'cancelled';

const getFilterTabs = (t: any): { key: FilterKey; label: string }[] => [
  { key: 'all', label: t('adminRes.filters.all', 'Alle') },
  { key: 'today', label: t('adminRes.filters.today', 'Heute') },
  { key: 'tomorrow', label: t('adminRes.filters.tomorrow', 'Morgen') },
  { key: 'week', label: t('adminRes.filters.week', 'Diese Woche') },
  { key: 'cancelled', label: t('adminRes.filters.cancelled', 'Storniert') },
];

const getStatusConfig = (t: any): Record<ReservationStatus, { label: string; dot: string; bg: string; text: string; border: string }> => ({
  CONFIRMED: { label: t('adminRes.status.confirmed', 'Bestätigt'), dot: 'bg-primary animate-pulse', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  MODIFIED: { label: t('adminRes.status.modified', 'Geändert'), dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  COMPLETED: { label: t('adminRes.status.completed', 'Abgeschlossen'), dot: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  CANCELLED: { label: t('adminRes.status.cancelled', 'Storniert'), dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  NO_SHOW: { label: t('adminRes.status.noShow', 'No-Show'), dot: 'bg-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
});

const getPaymentStatusLabels = (t: any): Record<string, string> => ({
  PENDING: t('adminRes.payment.pending', 'Ausstehend'),
  PAID: t('adminRes.payment.paid', 'Bezahlt'),
  FAILED: t('adminRes.payment.failed', 'Fehlgeschlagen'),
  REFUNDED: t('adminRes.payment.refunded', 'Erstattet'),
  ON_SITE: t('adminRes.payment.onSite', 'Vor Ort'),
});

const getDurationLabels = (t: any): Record<number, string> => ({
  60: t('adminRes.duration.m60', '1 Stunde'),
  90: t('adminRes.duration.m90', '1,5 Stunden'),
  120: t('adminRes.duration.m120', '2 Stunden'),
  150: t('adminRes.duration.m150', '2,5 Stunden'),
  180: t('adminRes.duration.m180', '3 Stunden'),
});

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Format ISO datetime → "24. Okt, 18:00" */
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('de-AT', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
};

/** Format ISO datetime → "18:00" */
const formatTime = (iso: string): string => {
  return new Date(iso).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
};

/** Format price → "60,00 €" */
const formatEuro = (n: number): string =>
  n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/** YYYY-MM-DD helper */
const toDateStr = (d: Date): string => d.toISOString().split('T')[0];

/** Check if a reservation falls on a given date */
const isOnDate = (r: AdminReservation, date: Date): boolean => {
  const rd = new Date(r.startTime);
  return rd.getFullYear() === date.getFullYear() &&
    rd.getMonth() === date.getMonth() &&
    rd.getDate() === date.getDate();
};

/** Check if reservation is within this week (Mon-Sun) */
const isThisWeek = (r: AdminReservation): boolean => {
  const now = new Date();
  const day = now.getDay();
  const diffMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const rd = new Date(r.startTime);
  return rd >= monday && rd <= sunday;
};

/** Export reservations to CSV and trigger download */
const exportCSV = (data: AdminReservation[], t: any) => {
  const header = 'Buchungs-ID;Datum;Uhrzeit;Kunde;Telefon;Platz;Dauer (Min.);Status;Preis\n';
  const rows = data.map((r) => {
    const d = new Date(r.startTime);
    return [
      r.confirmationCode,
      d.toLocaleDateString('de-AT'),
      formatTime(r.startTime),
      r.customerName,
      r.customerPhone || '',
      r.fieldName,
      r.durationMinutes,
      getStatusConfig(t)[getDisplayStatus(r)]?.label || r.status,
      r.totalPrice.toFixed(2).replace('.', ','),
    ].join(';');
  });
  const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservierungen_${toDateStr(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Derive display status: past bookings → COMPLETED, cancelled → CANCELLED, future → as-is */
const getDisplayStatus = (r: AdminReservation): ReservationStatus => {
  if (r.status === 'CANCELLED') return 'CANCELLED';
  const endTime = new Date(r.endTime);
  if (endTime.getTime() < Date.now()) return 'COMPLETED';
  return r.status;
};

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */

export function AdminReservierungen() {
  
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [cancelTarget, setCancelTarget] = useState<AdminReservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [refundTarget, setRefundTarget] = useState<AdminReservation | null>(null);
  const [refunding, setRefunding] = useState(false);

  const [detailTarget, setDetailTarget] = useState<AdminReservation | null>(null);

  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [chartMode, setChartMode] = useState<'week' | 'month'>('week');

  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ─── Fetch ─── */
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminReservationService.getAll();
      setReservations(res.data.data || []);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      setError(axErr.response?.data?.message || 'Reservierungen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    adminReservationService.getStats().then(res => setStats(res.data.data)).catch(() => {});
  }, [fetchReservations]);

  /* ─── Filtering + Search ─── */
  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let list = reservations;

    switch (activeFilter) {
      case 'today':
        list = list.filter((r) => isOnDate(r, today));
        break;
      case 'tomorrow':
        list = list.filter((r) => isOnDate(r, tomorrow));
        break;
      case 'week':
        list = list.filter(isThisWeek);
        break;
      case 'cancelled':
        list = list.filter((r) => r.status === 'CANCELLED');
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.confirmationCode.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.customerPhone && r.customerPhone.includes(q)) ||
          (r.customerEmail && r.customerEmail.toLowerCase().includes(q)) ||
          r.fieldName.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'id': cmp = a.id - b.id; break;
        case 'customer': cmp = a.customerName.localeCompare(b.customerName); break;
        case 'field': cmp = a.fieldName.localeCompare(b.fieldName); break;
        case 'date': cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime(); break;
        case 'time': cmp = a.startTime.slice(11, 16).localeCompare(b.startTime.slice(11, 16)); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'price': cmp = a.totalPrice - b.totalPrice; break;
        default: cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [reservations, activeFilter, searchQuery, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="material-symbols-outlined text-[14px] ml-1 opacity-50">
      {sortKey === k ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  /* ─── Pagination ─── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  /* ─── Cancel action ─── */
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await adminReservationService.cancel(cancelTarget.id);
      setReservations((prev) =>
        prev.map((r) => (r.id === cancelTarget.id ? { ...r, status: 'CANCELLED' as const } : r)),
      );
      setCancelTarget(null);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      alert(axErr.response?.data?.message || 'Stornierung fehlgeschlagen.');
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Refund action ─── */
  const handleRefund = async () => {
    if (!refundTarget) return;
    try {
      setRefunding(true);
      await adminReservationService.refund(refundTarget.id, refundTarget.totalPrice);
      setReservations((prev) =>
        prev.map((r) => (r.id === refundTarget.id ? { ...r, paymentStatus: 'REFUNDED' as const } : r)),
      );
      setRefundTarget(null);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      alert(axErr.response?.data?.message || 'Erstattung fehlgeschlagen.');
    } finally {
      setRefunding(false);
    }
  };

  /* ─── Neue Buchung Sidebar ─── */
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [nbName, setNbName] = useState('');
  const [nbEmail, setNbEmail] = useState('');
  const [nbPhone, setNbPhone] = useState('');
  const [nbSubmitting, setNbSubmitting] = useState(false);
  const [nbError, setNbError] = useState<string | null>(null);
  const [nbSuccess, setNbSuccess] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNewBooking) return;
    fieldService.getAll().then((res) => {
      const active = (res.data.data || []).filter((f) => f.active);
      setFields(active);
      if (active.length > 0 && !selectedFieldId) {
        setSelectedFieldId(active[0].id);
      }
    }).catch(() => {});
  }, [showNewBooking]);

  useEffect(() => {
    if (!selectedFieldId || !selectedDate) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }
    setSlotsLoading(true);
    setSelectedSlot(null);
    fieldService.getAvailability(selectedFieldId, selectedDate, selectedDuration)
      .then((res) => {
        setAvailableSlots(res.data.data?.slots || []);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedFieldId, selectedDate, selectedDuration]);

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const allowedDurations = selectedField?.allowedDurations || [60, 90, 120, 180];

  useEffect(() => {
    if (allowedDurations.length > 0 && !allowedDurations.includes(selectedDuration)) {
      setSelectedDuration(allowedDurations[0]);
    }
  }, [selectedFieldId]);

  const openNewBooking = () => {
    setNbName(''); setNbEmail(''); setNbPhone('');
    setSelectedDate(''); setSelectedSlot(null);
    setNbError(null); setNbSuccess(false);
    setShowNewBooking(true);
  };

  const closeNewBooking = () => {
    setShowNewBooking(false);
  };

  /** Parse slot time → "14:00" (strip [Europe/Vienna] zone suffix if present) */
  const parseSlotTime = (iso: string): string => {
    const clean = iso.replace(/\[.*]$/, '');
    const d = new Date(clean);
    return d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
  };

  /** Calculate estimated price */
  const estimatedPrice = selectedField
    ? (selectedField.hourlyPrice * selectedDuration) / 60
    : 0;

  /** Submit new booking */
  const handleNewBooking = async () => {
    if (!selectedFieldId || !selectedSlot || !nbName.trim()) {
      setNbError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    try {
      setNbSubmitting(true);
      setNbError(null);
      await reservationService.create({
        fieldId: selectedFieldId,
        startTime: selectedSlot,
        durationMinutes: selectedDuration,
        guestName: nbName.trim(),
        guestPhone: nbPhone.trim() || undefined,
        guestEmail: nbEmail.trim() || undefined,
        privacyAccepted: true,
      });
      setNbSuccess(true);
      setTimeout(() => {
        fetchReservations();
        closeNewBooking();
        setNbSuccess(false);
      }, 1500);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      setNbError(axErr.response?.data?.message || 'Buchung konnte nicht erstellt werden.');
    } finally {
      setNbSubmitting(false);
    }
  };

  /** Min date = today */
  const todayStr = toDateStr(new Date());

  /* ─── Page numbers helper ─── */
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <>
        <Helmet><title>{pageTitle('Reservierungen')}</title></Helmet>
        <div className="p-4 md:p-8 lg:px-12 flex flex-col gap-6 max-w-[1600px] mx-auto">
          <div className="h-10 w-72 bg-slate-700/40 rounded animate-pulse" />
          <div className="h-8 w-96 bg-slate-700/30 rounded animate-pulse" />
          <div className="glass-panel rounded-xl overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
                <div className="h-4 w-20 bg-slate-700/40 rounded" />
                <div className="h-4 w-32 bg-slate-700/30 rounded" />
                <div className="h-4 w-28 bg-slate-700/30 rounded" />
                <div className="h-4 flex-1 bg-slate-700/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <>
        <Helmet><title>{pageTitle('Reservierungen — Fehler')}</title></Helmet>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="glass-card rounded-xl p-8 text-center max-w-md">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4 block">error</span>
            <h2 className="text-white text-lg font-bold mb-2">{t('adminRes.loadError')}</h2>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={fetchReservations} className="bg-primary hover:bg-orange-600 text-black text-sm font-bold py-2 px-6 rounded-lg transition-colors">
              Erneut versuchen
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{pageTitle('Reservierungen')}</title></Helmet>

      <div className="p-4 md:p-8 lg:px-12 flex flex-col gap-6 max-w-[1600px] mx-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">{t('adminRes.headerTitle')}</h2>
              <p className="text-slate-400 text-sm">Verwalten Sie alle Buchungen, Stornierungen und Anfragen an einem Ort.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportCSV(filtered, t)}
                className="glass-card hover:border-primary/40 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">file_upload</span>
                <span className="hidden sm:inline">{t('adminRes.export')}</span>
              </button>
              <button
                onClick={openNewBooking}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)] text-sm font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="hidden sm:inline">{t('adminRes.newBooking')}</span>
              </button>
            </div>
          </header>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminRes.stats.total')}</p>
                  <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white">{stats.totalReservations.toLocaleString('de-AT')}</h3>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${stats.changePercent >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-xs">{stats.changePercent >= 0 ? 'trending_up' : 'trending_down'}</span>
                    {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}% vs. Vormonat
                  </p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminRes.stats.cancelRate')}</p>
                  <span className="material-symbols-outlined text-primary text-xl">event_busy</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white">{stats.cancelRate.toFixed(1)}%</h3>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${stats.cancelRate <= stats.prevCancelRate ? 'text-green-500' : 'text-orange-400'}`}>
                    <span className="material-symbols-outlined text-xs">{stats.cancelRate <= stats.prevCancelRate ? 'trending_down' : 'trending_up'}</span>
                    {(stats.cancelRate - stats.prevCancelRate) >= 0 ? '+' : ''}{(stats.cancelRate - stats.prevCancelRate).toFixed(1)}% vs. Vormonat
                  </p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminRes.stats.popularTime')}</p>
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white">{stats.popularTimeSlot}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('adminRes.stats.primetime')}</p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminRes.stats.revenueProg')}</p>
                  <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white">€{Number(stats.revenueProjection).toLocaleString('de-AT', { minimumFractionDigits: 0 })}</h3>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${stats.revenueChangePercent >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-xs">{stats.revenueChangePercent >= 0 ? 'trending_up' : 'trending_down'}</span>
                    {stats.revenueChangePercent >= 0 ? '+' : ''}{stats.revenueChangePercent.toFixed(0)}% Ziel
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('adminRes.charts.bookingTrends')}</h3>
                    <p className="text-xs text-slate-500">{t('adminRes.charts.resPeriod')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setChartMode('week')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${chartMode === 'week' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-400'}`}>{t('adminRes.charts.week')}</button>
                    <button onClick={() => setChartMode('month')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${chartMode === 'month' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-400'}`}>{t('adminRes.charts.month')}</button>
                  </div>
                </div>
                {(() => {
                  const data = chartMode === 'week' ? stats.weeklyBookings : stats.monthlyBookings;
                  const maxCount = Math.max(...data.map(d => d.count), 1);
                  return (
                    <div className="h-52 flex flex-col relative">
                      <div className="absolute inset-0 flex items-end justify-between gap-1 px-1 pb-10">
                        {data.map((d, i) => {
                          const pct = (d.count / maxCount) * 100;
                          const isHigh = pct >= 70;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-help" title={`${d.label}: ${d.count} Buchungen`}>
                              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{d.count}</span>
                              <div className={`w-full max-w-[14px] rounded-t transition-all duration-500 ${isHigh ? 'bg-primary shadow-[0_0_8px_rgba(255,68,0,0.3)]' : 'bg-primary/25'}`} style={{ height: `${Math.max(pct, 4)}%` }} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-auto pt-4 flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest border-t border-white/5">
                        {data.map((d, i) => <span key={i} className="flex-1 text-center truncate">{d.label}</span>)}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="glass-card rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-5">{t('adminRes.charts.occCompare')}</h3>
                <div className="flex-1 flex flex-col justify-around gap-4">
                  {stats.fieldUtilization.map((f, i) => {
                    const diff = f.percent - f.prevPercent;
                    return (
                      <div key={f.fieldId}>
                        {i > 0 && <div className="h-px bg-white/5 mb-4" />}
                        <div className="flex items-center gap-5">
                          <div className="relative w-20 h-20 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle className="stroke-primary/10" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
                              <circle className="stroke-primary transition-all duration-1000" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${f.percent}, 100`} strokeLinecap="round" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-base font-bold text-white">{Math.round(f.percent)}%</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white truncate">{f.fieldName}</h4>
                            <p className="text-xs text-slate-500">{f.bookedHours} / {f.totalHours} {t('adminRes.charts.bookedHours')}</p>
                            <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${diff >= 0 ? 'text-green-500' : 'text-orange-400'}`}>
                              <span className="material-symbols-outlined text-xs">{diff >= 0 ? 'trending_up' : 'trending_down'}</span>
                              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs. Vorwoche
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stats.fieldUtilization.length === 0 && <p className="text-slate-500 text-sm text-center">{t('adminRes.charts.noFields')}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center glass-panel p-2 rounded-xl">
            <div className="flex flex-wrap gap-2">
              {getFilterTabs(t).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === tab.key
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'today' && (
                    <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                      {reservations.filter((r) => { const t = new Date(); t.setHours(0,0,0,0); return isOnDate(r, t); }).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="w-full xl:w-auto flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#1f1a15] border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm transition-all"
                  placeholder="Nach ID, Name oder Telefon suchen..."
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            {filtered.length} Buchung{filtered.length !== 1 ? 'en' : ''} {t('adminRes.search.foundText')}
          </div>

          {/* ═══════════════════════════════════════════════
             Desktop Table (hidden on mobile)
             ═══════════════════════════════════════════════ */}
          <div className="hidden lg:block glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('id')}>
                      <div className="flex items-center">{t('adminRes.table.id')}<SortIcon k="id" /></div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('date')}>
                      <div className="flex items-center">{t('adminRes.table.date')}<SortIcon k="date" /></div>
                    </th>
                    <th className="p-4 font-semibold min-w-[180px] cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('customer')}>
                      <div className="flex items-center">{t('adminRes.table.customer')}<SortIcon k="customer" /></div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('field')}>
                      <div className="flex items-center">{t('adminRes.table.field')}<SortIcon k="field" /></div>
                    </th>
                    <th className="p-4 font-semibold">{t('adminRes.newBookingModal.durationLabel')}</th>
                    <th className="p-4 font-semibold cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">{t('adminRes.table.status')}<SortIcon k="status" /></div>
                    </th>
                    <th className="p-4 font-semibold">{t('adminRes.table.payment')}</th>
                    <th className="p-4 font-semibold text-right cursor-pointer select-none hover:text-slate-300 transition-colors" onClick={() => toggleSort('price')}>
                      <div className="flex items-center justify-end">{t('adminRes.table.price')}<SortIcon k="price" /></div>
                    </th>
                    <th className="p-4 font-semibold text-center w-28">{t('adminRes.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
                        Keine Reservierungen gefunden
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r) => {
                      const ds = getDisplayStatus(r);
                      const sc = getStatusConfig(t)[ds];
                      return (
                        <tr key={r.id} className="group hover:bg-white/2 transition-colors">
                          <td className="p-4 font-mono text-slate-400 text-xs">{r.confirmationCode}</td>
                          <td className="p-4 text-white">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-slate-500">schedule</span>
                              <span>{formatDateTime(r.startTime)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{r.customerName}</span>
                              {r.customerPhone && (
                                <span className="text-slate-500 text-xs">{r.customerPhone}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{r.fieldName}</span>
                              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{r.gameType || 'FOOTBALL'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-400">{r.durationMinutes} Min.</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border ${sc.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-xs">
                            {getPaymentStatusLabels(t)[r.paymentStatus] || r.paymentStatus}
                          </td>
                          <td className={`p-4 text-right font-medium ${ds === 'CANCELLED' ? 'line-through text-white/30' : 'text-white'}`}>
                            {formatEuro(r.totalPrice)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setDetailTarget(r)}
                                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Details"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                              {r.paymentStatus === 'PAID' && ds !== 'CANCELLED' && (
                                <button
                                  onClick={() => setRefundTarget(r)}
                                  className="p-1.5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Erstatten"
                                >
                                  <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
                                </button>
                              )}
                              {ds !== 'CANCELLED' && ds !== 'COMPLETED' && (
                                <button
                                  onClick={() => setCancelTarget(r)}
                                  className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                  title="Stornieren"
                                >
                                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="px-4 py-3 border-t border-white/10 bg-white/2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Zeige <span className="text-white font-medium">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> von{' '}
                  <span className="text-white font-medium">{filtered.length}</span> Buchungen
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="text-slate-500 text-xs px-1">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                            currentPage === p
                              ? 'bg-primary text-white font-bold shadow-[0_0_10px_rgba(255,68,0,0.3)]'
                              : 'hover:bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════
             Mobile Card View (visible on < lg)
             ═══════════════════════════════════════════════ */}
          <div className="lg:hidden flex flex-col gap-3">
            {paginated.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
                Keine Reservierungen gefunden
              </div>
            ) : (
              paginated.map((r) => {
                const ds = getDisplayStatus(r);
                const sc = getStatusConfig(t)[ds];
                return (
                  <div
                    key={r.id}
                    className="glass-card rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setDetailTarget(r)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border ${sc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="font-mono text-slate-500 text-xs">{r.confirmationCode}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{r.customerName}</span>
                        <span className="text-slate-500 text-xs">{r.fieldName}</span>
                      </div>
                      <span className={`font-bold text-sm ${ds === 'CANCELLED' ? 'line-through text-white/30' : 'text-white'}`}>
                        {formatEuro(r.totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatDateTime(r.startTime)}
                      </div>
                      <span>{r.durationMinutes} Min.</span>
                      <span className="ml-auto text-[10px]">{getPaymentStatusLabels(t)[r.paymentStatus] || r.paymentStatus}</span>
                    </div>

                    {ds !== 'CANCELLED' && ds !== 'COMPLETED' && (
                      <div className="flex justify-end pt-1 border-t border-white/5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setCancelTarget(r); }}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Stornieren
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg glass-card text-slate-400 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-xs text-slate-500">
                  Seite {currentPage} von {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg glass-card text-slate-400 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
         Cancel Confirmation Modal
         ═══════════════════════════════════════════════ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !cancelling && setCancelTarget(null)}>
          <div className="glass-panel rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{t('adminRes.modals.cancelTitle')}?</h3>
                <p className="text-slate-400 text-xs">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.booking')}</span>
                <span className="text-white font-mono text-xs">{cancelTarget.confirmationCode}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.customer')}</span>
                <span className="text-white">{cancelTarget.customerName}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.period')}</span>
                <span className="text-white">{formatDateTime(cancelTarget.startTime)} — {formatTime(cancelTarget.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('adminRes.modals.field')}</span>
                <span className="text-white">{cancelTarget.fieldName}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling && <span className="inline-block h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />}
                Stornieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
         Refund Confirmation Modal
         ═══════════════════════════════════════════════ */}
      {refundTarget && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !refunding && setRefundTarget(null)}>
          <div className="glass-panel rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-500">currency_exchange</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{t('adminRes.modals.refundTitle')}?</h3>
                <p className="text-slate-400 text-xs">Der Betrag wird über Stripe zurückerstattet.</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.booking')}</span>
                <span className="text-white font-mono text-xs">{refundTarget.confirmationCode}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.customer')}</span>
                <span className="text-white">{refundTarget.customerName}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">{t('adminRes.modals.paymentLabel')}</span>
                <span className="text-white">{getPaymentStatusLabels(t)[refundTarget.paymentStatus]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('adminRes.modals.refundAmount')}</span>
                <span className="text-amber-400 font-bold">{formatEuro(refundTarget.totalPrice)}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRefundTarget(null)}
                disabled={refunding}
                className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {refunding && <span className="inline-block h-4 w-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />}
                Erstatten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
         Neue Buchung Sidebar
         ═══════════════════════════════════════════════ */}
      {showNewBooking && (
        <div className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm" onClick={closeNewBooking}>
          <aside
            ref={sidebarRef}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#140f0c]/95 backdrop-blur-xl border-l border-white/8 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden animate-[slideInRight_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1a1310]/50">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{t('adminRes.newBookingModal.title')}</h2>
                <p className="text-slate-500 text-sm mt-1">{t('adminRes.newBookingModal.desc')}</p>
              </div>
              <button onClick={closeNewBooking} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {nbSuccess && (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                  <p className="text-white font-bold text-lg">{t('adminRes.newBookingModal.successTitle')}</p>
                  <p className="text-slate-400 text-sm">Wird gespeichert...</p>
                </div>
              )}

              {!nbSuccess && (
                <>
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">person</span>
                      Kundendaten
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400">Name des Kunden *</label>
                        <input
                          type="text"
                          value={nbName}
                          onChange={(e) => setNbName(e.target.value)}
                          className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                          placeholder="z.B. Max Mustermann"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-400">{t('adminRes.newBookingModal.email')}</label>
                          <input
                            type="email"
                            value={nbEmail}
                            onChange={(e) => setNbEmail(e.target.value)}
                            className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                            placeholder="name@beispiel.de"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-400">{t('adminRes.newBookingModal.phone')}</label>
                          <input
                            type="tel"
                            value={nbPhone}
                            onChange={(e) => setNbPhone(e.target.value)}
                            className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                            placeholder="+43 676 ..."
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">stadium</span>
                      Platz &amp; Details
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400">{t('adminRes.newBookingModal.fieldSelect')}</label>
                        <div className="relative">
                          <select
                            value={selectedFieldId || ''}
                            onChange={(e) => setSelectedFieldId(Number(e.target.value))}
                            className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                          >
                            {fields.map((f) => (
                              <option key={f.id} value={f.id}>{f.name} — {formatEuro(f.hourlyPrice)}/Std.</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">expand_more</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-400">{t('adminRes.newBookingModal.dateSelect')}</label>
                          <input
                            type="date"
                            value={selectedDate}
                            min={todayStr}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none scheme-dark"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-400">{t('adminRes.table.duration')}</label>
                          <div className="relative">
                            <select
                              value={selectedDuration}
                              onChange={(e) => setSelectedDuration(Number(e.target.value))}
                              className="w-full bg-[#181311] border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                            >
                              {allowedDurations.sort((a, b) => a - b).map((d) => (
                                <option key={d} value={d}>{getDurationLabels(t)[d] || `${d} Min.`}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <span className="material-symbols-outlined">expand_more</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400">{t('adminRes.newBookingModal.timeSelect')}</label>
                        {!selectedDate ? (
                          <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-slate-500 text-sm text-center">
                            <span className="material-symbols-outlined text-lg mb-1 block">calendar_today</span>
                            {t('adminRes.newBookingModal.chooseDateFirst')}
                          </div>
                        ) : slotsLoading ? (
                          <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center gap-2">
                            <span className="inline-block h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-slate-400 text-sm">Verfügbarkeit wird geladen...</span>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-slate-500 text-sm text-center">
                            <span className="material-symbols-outlined text-lg mb-1 block">event_busy</span>
                            {t('adminRes.newBookingModal.noSlots')}
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {availableSlots.map((slot) => {
                              const slotTime = parseSlotTime(slot.startTime);
                              const isAvailable = slot.available && !slot.held;
                              const isSelected = selectedSlot === slot.startTime;
                              return (
                                <button
                                  key={slot.startTime}
                                  disabled={!isAvailable}
                                  onClick={() => setSelectedSlot(isSelected ? null : slot.startTime)}
                                  className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,102,0,0.3)] ring-1 ring-primary'
                                      : isAvailable
                                        ? 'bg-white/5 border border-white/10 text-white hover:border-primary/40 hover:bg-primary/5'
                                        : 'bg-white/2 border border-white/5 text-slate-600 cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slotTime}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">payments</span>
                      Bezahlung
                    </h3>
                    <div className="p-4 rounded-lg bg-[#1a1310] border border-white/5 flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{t('adminRes.newBookingModal.onSiteLabel')}</span>
                        <span className="text-slate-500 text-xs">Der Kunde zahlt Bar oder mit Karte direkt am Counter.</span>
                      </div>
                    </div>

                    {selectedField && selectedSlot && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{t('adminRes.newBookingModal.estPrice')}</span>
                        <span className="text-primary font-bold text-lg">{formatEuro(estimatedPrice)}</span>
                      </div>
                    )}
                  </section>

                  {nbError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">error</span>
                      {nbError}
                    </div>
                  )}
                </>
              )}
            </div>

            {!nbSuccess && (
              <div className="p-6 border-t border-white/10 bg-[#140f0c]/80 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleNewBooking}
                    disabled={nbSubmitting || !selectedSlot || !nbName.trim()}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {nbSubmitting ? (
                      <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined">add_circle</span>
                    )}
                    {t('adminRes.newBookingModal.saveBooking')}
                  </button>
                  <button
                    onClick={closeNewBooking}
                    disabled={nbSubmitting}
                    className="w-full py-3 text-slate-500 hover:text-white text-sm font-medium transition-colors text-center"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
         Detail Drawer / Modal
         ═══════════════════════════════════════════════ */}
      {detailTarget && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center md:justify-end p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailTarget(null)}>
          <div
            className="glass-panel rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{t('adminRes.details.title')}</h3>
                  <p className="text-slate-500 text-xs font-mono">{detailTarget.confirmationCode}</p>
                </div>
              </div>
              <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {(() => {
              const sc = getStatusConfig(t)[getDisplayStatus(detailTarget)];
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border ${sc.border} mb-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              );
            })()}

            <div className="flex flex-col gap-3 text-sm">
              <DetailRow label="Kunde" value={detailTarget.customerName} />
              {detailTarget.customerPhone && <DetailRow label="Telefon" value={detailTarget.customerPhone} />}
              {detailTarget.customerEmail && <DetailRow label={t('adminRes.details.emailLabel')} value={detailTarget.customerEmail} />}
              <div className="border-t border-white/5 my-1" />
              <DetailRow label="Platz" value={detailTarget.fieldName} />
              <DetailRow label="Datum" value={formatDateTime(detailTarget.startTime)} />
              <DetailRow label={t('adminRes.details.endLabel')} value={formatTime(detailTarget.endTime)} />
              <DetailRow label="Dauer" value={`${detailTarget.durationMinutes} Minuten`} />
              <div className="border-t border-white/5 my-1" />
              <DetailRow label={t('adminRes.details.priceLabel')} value={formatEuro(detailTarget.totalPrice)} highlight />
              <DetailRow label={t('adminRes.details.paymentStatusLabel')} value={getPaymentStatusLabels(t)[detailTarget.paymentStatus] || detailTarget.paymentStatus} />
              {detailTarget.paymentMethod && (
                <DetailRow label={t('adminRes.details.paymentMethodLabel')} value={
                  detailTarget.paymentMethod === 'CARD' ? 'Karte' :
                  detailTarget.paymentMethod === 'APPLE_PAY' ? 'Apple Pay' :
                  detailTarget.paymentMethod === 'GOOGLE_PAY' ? 'Google Pay' :
                  'Vor Ort'
                } />
              )}

              {detailTarget.equipmentRentals && detailTarget.equipmentRentals.length > 0 && (
                <>
                  <div className="border-t border-white/5 my-1" />
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{t('adminRes.details.rentalsTitle')}</p>
                  {detailTarget.equipmentRentals.map((rental, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-300">{rental.equipmentName} {rental.size ? `(${rental.size})` : ''} × {rental.quantity}</span>
                      <span className="text-white font-medium">{formatEuro(rental.price)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
              {detailTarget.paymentStatus === 'PAID' && getDisplayStatus(detailTarget) !== 'CANCELLED' && (
                <button
                  onClick={() => { setRefundTarget(detailTarget); setDetailTarget(null); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                  {t('adminRes.modals.refundAction')} ({formatEuro(detailTarget.totalPrice)})
                </button>
              )}
              {getDisplayStatus(detailTarget) !== 'CANCELLED' && getDisplayStatus(detailTarget) !== 'COMPLETED' && (
                <button
                  onClick={() => { setCancelTarget(detailTarget); setDetailTarget(null); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Stornieren
                </button>
              )}
            </div>

            <p className="text-slate-600 text-[10px] mt-4 text-center">
              {t('adminRes.details.created')} {new Date(detailTarget.createdAt).toLocaleString('de-AT')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Detail row sub-component ─── */
function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'text-primary font-bold' : 'text-white'}>{value}</span>
    </div>
  );
}
