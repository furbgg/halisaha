import { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation } from 'react-i18next';
import {
  adminReservationService,
  type AdminReservation,
  type PaymentStatus,
  type PaymentMethod,
} from '../../services/adminReservationService';
import api from '../../services/api';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../../types/api';

/* ═══════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════ */

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED' | 'ON_SITE';
type MethodFilter = 'all' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'ON_SITE';

const statusInfo: Record<PaymentStatus, { label: string; icon?: string; bg: string; text: string; border: string }> = {
  PAID:     { label: 'Erfolg',         icon: undefined,      bg: 'bg-primary/10',   text: 'text-primary',    border: 'border-primary/20' },
  PENDING:  { label: 'Ausstehend',     icon: undefined,      bg: 'bg-amber-500/10', text: 'text-amber-400',  border: 'border-amber-500/20' },
  REFUNDED: { label: 'Erstattet',      icon: 'undo',         bg: 'bg-red-500/10',   text: 'text-red-400',    border: 'border-red-500/20' },
  FAILED:   { label: 'Fehlgeschlagen', icon: 'block',        bg: 'bg-slate-700/50', text: 'text-slate-400',  border: 'border-slate-600/30' },
  ON_SITE:  { label: 'Vor Ort',        icon: undefined,      bg: 'bg-green-500/10', text: 'text-green-400',  border: 'border-green-500/20' },
};

const methodInfo: Record<PaymentMethod | 'ON_SITE', { label: string; icon: string }> = {
  CARD:       { label: 'Karte',      icon: 'credit_card' },
  APPLE_PAY:  { label: 'Apple Pay',  icon: 'phone_iphone' },
  GOOGLE_PAY: { label: 'GPay',       icon: 'android' },
  ON_SITE:    { label: 'Barzahlung', icon: 'payments' },
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all',      label: 'Alle' },
  { key: 'PAID',     label: 'Erfolg' },
  { key: 'PENDING',  label: 'Ausstehend' },
  { key: 'REFUNDED', label: 'Erstattet' },
  { key: 'FAILED',   label: 'Fehlgeschlagen' },
  { key: 'ON_SITE',  label: 'Vor Ort' },
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

const formatEuro = (n: number): string =>
  n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const formatDate = (iso: string): { date: string; time: string } => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('de-AT', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }),
  };
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColors = [
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-pink-500/20 text-pink-400',
  'bg-teal-500/20 text-teal-400',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const toDateStr = (d: Date): string => d.toISOString().split('T')[0];

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */

export function AdminZahlungen() {
  const { t } = useTranslation();
  
  const statusConfig: Record<string, { label: string; icon?: string; bg: string; text: string; border: string }> = {
    PAID:     { label: t('adminPayments.statuses.PAID'),         icon: undefined,      bg: 'bg-primary/10',   text: 'text-primary',    border: 'border-primary/20' },
    PENDING:  { label: t('adminPayments.statuses.PENDING'),     icon: undefined,      bg: 'bg-amber-500/10', text: 'text-amber-400',  border: 'border-amber-500/20' },
    REFUNDED: { label: t('adminPayments.statuses.REFUNDED'),      icon: 'undo',         bg: 'bg-red-500/10',   text: 'text-red-400',    border: 'border-red-500/20' },
    FAILED:   { label: t('adminPayments.statuses.FAILED'), icon: 'block',        bg: 'bg-slate-700/50', text: 'text-slate-400',  border: 'border-slate-600/30' },
    ON_SITE:  { label: t('adminPayments.statuses.ON_SITE'),        icon: undefined,      bg: 'bg-green-500/10', text: 'text-green-400',  border: 'border-green-500/20' },
  };

  const methodLabels: Record<string, { label: string; icon: string }> = {
    CARD:       { label: t('adminPayments.methods.CARD'),      icon: 'credit_card' },
    APPLE_PAY:  { label: t('adminPayments.methods.APPLE_PAY'),  icon: 'phone_iphone' },
    GOOGLE_PAY: { label: t('adminPayments.methods.GOOGLE_PAY'),       icon: 'android' },
    ON_SITE:    { label: t('adminPayments.methods.ON_SITE'), icon: 'payments' },
  };

  const statusFilterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: t('adminPayments.filters.all') },
    { key: 'PAID',     label: t('adminPayments.statuses.PAID') },
    { key: 'PENDING',  label: t('adminPayments.statuses.PENDING') },
    { key: 'REFUNDED', label: t('adminPayments.statuses.REFUNDED') },
    { key: 'FAILED',   label: t('adminPayments.statuses.FAILED') },
    { key: 'ON_SITE',  label: t('adminPayments.statuses.ON_SITE') },
  ];

  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [refundTarget, setRefundTarget] = useState<AdminReservation | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundFull, setRefundFull] = useState(false);
  const [refunding, setRefunding] = useState(false);

  /* ─── Fetch ─── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminReservationService.getAll();
      setReservations(res.data.data || []);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      setError(axErr.response?.data?.message || t('adminPayments.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let todayRevenue = 0;
    let yesterdayRevenue = 0;
    let pendingCount = 0;
    let refundedTotal = 0;
    let refundedCount = 0;

    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    reservations.forEach((r) => {
      const rd = new Date(r.startTime);
      if (rd >= today && (r.paymentStatus === 'PAID' || r.paymentStatus === 'ON_SITE')) {
        todayRevenue += r.totalPrice;
      }
      if (rd >= yesterday && rd < today && (r.paymentStatus === 'PAID' || r.paymentStatus === 'ON_SITE')) {
        yesterdayRevenue += r.totalPrice;
      }
      if (r.paymentStatus === 'PENDING') pendingCount++;
      if (r.paymentStatus === 'REFUNDED' && rd.getMonth() === thisMonth && rd.getFullYear() === thisYear) {
        refundedTotal += r.totalPrice;
        refundedCount++;
      }
    });

    const revenueDiff = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

    return { todayRevenue, revenueDiff, pendingCount, refundedTotal, refundedCount };
  }, [reservations]);

  /* ─── Filtering + Search ─── */
  const filtered = useMemo(() => {
    let list = reservations;

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.paymentStatus === statusFilter);
    }
    if (methodFilter !== 'all') {
      list = list.filter((r) => r.paymentMethod === methodFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.confirmationCode.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.customerPhone && r.customerPhone.includes(q)) ||
          (r.customerEmail && r.customerEmail.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [reservations, statusFilter, methodFilter, searchQuery]);

  /* ─── Pagination ─── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  useEffect(() => { setCurrentPage(1); }, [statusFilter, methodFilter, searchQuery]);

  /* ─── Refund ─── */
  const openRefund = (r: AdminReservation) => {
    setRefundTarget(r);
    setRefundAmount(r.totalPrice.toFixed(2));
    setRefundFull(true);
    setRefundReason('');
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > refundTarget.totalPrice) return;
    try {
      setRefunding(true);
      await api.post(`/payments/admin/${refundTarget.id}/refund`, null, { params: { amount } });
      setReservations((prev) =>
        prev.map((r) => (r.id === refundTarget.id ? { ...r, paymentStatus: 'REFUNDED' as const } : r)),
      );
      setRefundTarget(null);
    } catch (err) {
      const axErr = err as AxiosError<ApiResponse<unknown>>;
      alert(axErr.response?.data?.message || t('adminPayments.refundModal.refundError'));
    } finally {
      setRefunding(false);
    }
  };

  /* ─── Page numbers ─── */
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

  /* ─── CSV Export ─── */
  const exportCSV = () => {
    const header = `${t('adminPayments.table.id')};${t('adminPayments.table.date')};${t('adminPayments.table.customer')};${t('adminPayments.table.method')};${t('adminPayments.table.amount')};${t('adminPayments.table.status')}\n`;
    const rows = filtered.map((r) => {
      const { date } = formatDate(r.startTime);
      const method = r.paymentMethod ? (methodLabels[r.paymentMethod]?.label || r.paymentMethod) : 'N/A';
      const status = statusConfig[r.paymentStatus]?.label || r.paymentStatus;
      return [r.confirmationCode, date, r.customerName, method, r.totalPrice.toFixed(2).replace('.', ','), status].join(';');
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zahlungen_${toDateStr(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <>
        <Helmet><title>{pageTitle(t('adminPayments.title'))}</title></Helmet>
        <div className="p-4 md:p-8 lg:px-12 flex flex-col gap-6 max-w-[1400px] mx-auto">
          <div className="h-10 w-80 bg-slate-700/40 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-panel rounded-xl p-5 h-28 animate-pulse" />)}
          </div>
          <div className="glass-panel rounded-xl overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
                <div className="h-4 w-24 bg-slate-700/40 rounded" />
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

  if (error) {
    return (
      <>
        <Helmet><title>{pageTitle(t('adminPayments.titleError'))}</title></Helmet>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="glass-card rounded-xl p-8 text-center max-w-md">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4 block">error</span>
            <h2 className="text-white text-lg font-bold mb-2">{t('adminPayments.errorTitle')}</h2>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={fetchData} className="bg-primary hover:bg-orange-600 text-black text-sm font-bold py-2 px-6 rounded-lg transition-colors">
              Erneut versuchen
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{pageTitle(t('adminPayments.title'))}</title></Helmet>

      <div className="p-4 md:p-8 lg:px-12 flex flex-col gap-6 max-w-[1400px] mx-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-3">
                Zahlungshistorie &amp; Erstattungen
                <span className="bg-white/5 rounded-md p-1 flex items-center justify-center border border-white/10" title={t('adminPayments.secureEnv')}>
                  <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                </span>
              </h2>
              <p className="text-slate-400 text-sm">{t('adminPayments.subtitle')}</p>
            </div>
            <button
              onClick={exportCSV}
              className="glass-card hover:border-primary/40 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportieren
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-primary/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                Umsatz heute
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">{formatEuro(stats.todayRevenue)}</span>
                {stats.revenueDiff !== 0 && (
                  <span className={`text-sm font-semibold mb-1 flex items-center ${stats.revenueDiff > 0 ? 'text-primary' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-[16px]">{stats.revenueDiff > 0 ? 'trending_up' : 'trending_down'}</span>
                    {stats.revenueDiff > 0 ? '+' : ''}{stats.revenueDiff}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{t('adminPayments.stats.vsYesterday')}</p>
            </div>

            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-amber-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[18px] text-amber-400">pending</span>
                Offene Zahlungen
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">{stats.pendingCount}</span>
                {stats.pendingCount > 0 && (
                  <span className="text-amber-400 text-sm font-semibold mb-1 flex items-center">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Erfordert Aufmerksamkeit
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{t('adminPayments.stats.pendingSub')}</p>
            </div>

            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-red-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[18px] text-red-400">remove_circle</span>
                Gesamt Erstattet (Monat)
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {stats.refundedTotal > 0 ? '- ' : ''}{formatEuro(stats.refundedTotal)}
                </span>
              </div>
              <p className="text-xs text-slate-600">{stats.refundedCount} {stats.refundedCount !== 1 ? t('adminPayments.stats.transactionsPlural') : t('adminPayments.stats.transactions')}</p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative w-full lg:w-96 group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1f1a15] border border-white/10 text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block pl-10 p-2.5 placeholder-slate-600 transition-all outline-none"
                placeholder={t('adminPayments.search')}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusFilterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === tab.key
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            {filtered.length} {filtered.length !== 1 ? t('adminPayments.foundTextPlural') : t('adminPayments.foundText')} {t('adminPayments.foundSuffix')}
          </div>

          {/* ═══════════════════════════════════════════════
             Desktop Table
             ═══════════════════════════════════════════════ */}
          <div className="hidden lg:block glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold min-w-[140px]">{t('adminPayments.table.id')}</th>
                    <th className="p-4 font-semibold min-w-[160px]">{t('adminPayments.table.date')}</th>
                    <th className="p-4 font-semibold min-w-[180px]">{t('adminPayments.table.customer')}</th>
                    <th className="p-4 font-semibold min-w-[140px]">{t('adminPayments.table.method')}</th>
                    <th className="p-4 font-semibold min-w-[120px] text-right">{t('adminPayments.table.amount')}</th>
                    <th className="p-4 font-semibold min-w-[140px]">{t('adminPayments.table.status')}</th>
                    <th className="p-4 font-semibold min-w-[120px] text-right">{t('adminPayments.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 block">account_balance_wallet</span>
                        Keine Zahlungen gefunden
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r) => {
                      const sc = statusConfig[r.paymentStatus];
                      const method = r.paymentMethod ? methodLabels[r.paymentMethod] : null;
                      const { date, time } = formatDate(r.startTime);
                      const isRefundable = r.paymentStatus === 'PAID' || r.paymentStatus === 'ON_SITE';

                      return (
                        <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-slate-400">{r.confirmationCode}</td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white">{date}</span>
                              <span className="text-xs text-slate-500">{t("adminPayments.timeFmt", { time })}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(r.customerName)}`}>
                                {getInitials(r.customerName)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{r.customerName}</span>
                                {r.customerPhone && <span className="text-xs text-slate-500">{r.customerPhone}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {method ? (
                              <div className="flex items-center gap-2 text-slate-300">
                                <span className="material-symbols-outlined text-[20px]">{method.icon}</span>
                                {method.label}
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-bold text-base ${r.paymentStatus === 'REFUNDED' ? 'line-through text-white/30' : r.paymentStatus === 'FAILED' ? 'line-through text-white/30' : 'text-white'}`}>
                              {formatEuro(r.totalPrice)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                              {sc.icon ? (
                                <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full ${r.paymentStatus === 'PAID' || r.paymentStatus === 'ON_SITE' ? 'bg-current animate-pulse' : 'bg-current'}`} />
                              )}
                              {sc.label}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {isRefundable && (
                                <button
                                  onClick={() => openRefund(r)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                                  title={t('adminPayments.refundModal.refundBtn')}
                                >
                                  <span className="material-symbols-outlined text-[20px]">restart_alt</span>
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
              <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Zeige <span className="text-white font-medium">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> von{' '}
                  <span className="text-white font-medium">{filtered.length}</span> Einträgen
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
             Mobile Card View
             ═══════════════════════════════════════════════ */}
          <div className="lg:hidden flex flex-col gap-3">
            {paginated.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">account_balance_wallet</span>
                Keine Zahlungen gefunden
              </div>
            ) : (
              paginated.map((r) => {
                const sc = statusConfig[r.paymentStatus];
                const method = r.paymentMethod ? methodLabels[r.paymentMethod] : null;
                const { date, time } = formatDate(r.startTime);
                const isRefundable = r.paymentStatus === 'PAID' || r.paymentStatus === 'ON_SITE';

                return (
                  <div key={r.id} className="glass-card rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                        {sc.icon ? (
                          <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                        {sc.label}
                      </span>
                      <span className="font-mono text-slate-500 text-xs">{r.confirmationCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(r.customerName)}`}>
                          {getInitials(r.customerName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">{r.customerName}</span>
                          {method && <span className="text-slate-500 text-xs">{method.label}</span>}
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${r.paymentStatus === 'REFUNDED' ? 'line-through text-white/30' : 'text-white'}`}>
                        {formatEuro(r.totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{date}, {t("adminPayments.timeFmt", { time })}</span>
                      {isRefundable && (
                        <button
                          onClick={() => openRefund(r)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          Erstatten
                        </button>
                      )}
                    </div>
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
                <span className="text-xs text-slate-500">{t('adminPayments.table.pageOf', { current: currentPage, total: totalPages })}</span>
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
         Refund Modal
         ═══════════════════════════════════════════════ */}
      {refundTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !refunding && setRefundTarget(null)}>
          <div className="glass-panel rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-xl font-bold text-white">{t('adminPayments.refundModal.title')}</h3>
              <button onClick={() => setRefundTarget(null)} disabled={refunding} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">{t('adminPayments.refundModal.transaction')}</span>
                  <span className="text-sm font-mono text-white">{refundTarget.confirmationCode}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500">{t('adminPayments.refundModal.origAmount')}</span>
                  <span className="text-sm font-bold text-white">{formatEuro(refundTarget.totalPrice)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-slate-300">{t('adminPayments.refundModal.type')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setRefundFull(false); setRefundAmount(''); }}
                    className={`p-3 rounded-lg border text-center text-sm font-semibold transition-all ${
                      !refundFull
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Teilerstattung
                  </button>
                  <button
                    onClick={() => { setRefundFull(true); setRefundAmount(refundTarget.totalPrice.toFixed(2)); }}
                    className={`p-3 rounded-lg border text-center text-sm font-semibold transition-all ${
                      refundFull
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Volle Erstattung
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">{t('adminPayments.refundModal.amountEur')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">€</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => { setRefundAmount(e.target.value); setRefundFull(false); }}
                    disabled={refundFull}
                    step="0.01"
                    min="0.01"
                    max={refundTarget.totalPrice}
                    className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 block pl-8 p-3 transition-all font-mono font-medium outline-none disabled:opacity-60"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500">{t('adminPayments.refundModal.maxRefundable')}{formatEuro(refundTarget.totalPrice)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">{t('adminPayments.refundModal.reason')}</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block p-3 text-sm min-h-[80px] outline-none placeholder-slate-600"
                  placeholder={t('adminPayments.refundModal.reasonPH')}
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-3 justify-end">
              <button
                onClick={() => setRefundTarget(null)}
                disabled={refunding}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding || !refundAmount || parseFloat(refundAmount) <= 0}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refunding ? (
                  <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                )}
                {refundAmount ? `${parseFloat(refundAmount || '0').toFixed(2).replace('.', ',')} € {t('adminPayments.refundModal.refundBtn')}` : 'Erstatten'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
