import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ADMIN_PORTAL_PATH, pageTitle } from '../../config/brand';
import { dashboardService, type DashboardData, type TimelineEntry } from '../../services/dashboardService';

/* ─── Status color map ─── */
const statusColorMap: Record<TimelineEntry['status'], { bg: string; border: string; label: string }> = {
  CONFIRMED: { bg: 'bg-primary/20', border: 'border-l-primary', label: 'Bestätigt' },
  CANCELLED: { bg: 'bg-red-500/10 opacity-60', border: 'border-l-red-500', label: 'Storniert' },
  MODIFIED: { bg: 'bg-yellow-500/20', border: 'border-l-yellow-500', label: 'Geändert' },
  COMPLETED: { bg: 'bg-emerald-500/20', border: 'border-l-emerald-500', label: 'Abgeschlossen' },
  NO_SHOW: { bg: 'bg-slate-500/20', border: 'border-l-slate-500', label: 'No Show' },
};

/* ─── Sport Icons map ─── */
const sportIconMap: Record<string, string> = {
  FOOTBALL: 'sports_soccer',
  BUBBLE_SOCCER: 'sports_handball',
  TENNIS: 'sports_tennis',
  BASKETBALL: 'sports_basketball',
  VOLLEYBALL: 'sports_volleyball',
};

/* ─── Payment method labels + colors ─── */
const paymentMethodLabels: Record<string, string> = { APPLE_PAY: 'Apple Pay', GOOGLE_PAY: 'Google Pay', CARD: 'Karte', ON_SITE: 'Vor Ort' };
const paymentMethodColors: Record<string, string> = { APPLE_PAY: '#ff4400', GOOGLE_PAY: '#3b82f6', CARD: '#f59e0b', ON_SITE: '#ef4444' };
const paymentMethodDotClass: Record<string, string> = { APPLE_PAY: 'bg-primary shadow-[0_0_5px_rgba(255,68,0,0.8)]', GOOGLE_PAY: 'bg-blue-500', CARD: 'bg-amber-500', ON_SITE: 'bg-red-500' };

/* ─── Material bar colors (cycle) ─── */
const materialBarColors = ['bg-blue-400', 'bg-yellow-400', 'bg-red-400', 'bg-green-400', 'bg-purple-400'];

/* ─── Heatmap day order ─── */
const heatmapDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const heatmapSlots = ['09-12', '13-16', '17-20', '21-23'];

/* ─── Day badge helper ─── */
const barBadge = (pct: number) => {
  if (pct >= 80) return { label: 'Stark', cls: 'text-primary border-primary/30 bg-primary/10' };
  if (pct >= 50) return { label: 'Gut', cls: 'text-green-400 border-green-900/50 bg-green-900/20' };
  return { label: 'Normal', cls: 'text-slate-400 border-slate-600' };
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardService.getDashboard();
        const d = response.data.data;
        setData({
          ...d,
          todayTimeline: d.todayTimeline || [],
          weeklyRevenue: d.weeklyRevenue || [],
          paymentMethodStats: d.paymentMethodStats || [],
          topMaterials: d.topMaterials || [],
          monthlyTrend: d.monthlyTrend || [],
          hourlyHeatmap: d.hourlyHeatmap || [],
          fieldStats: d.fieldStats || [],
          upcomingReservations: d.upcomingReservations || [],
          todayRevenue: d.todayRevenue ?? 0,
          monthRevenue: d.monthRevenue ?? 0,
          weekRevenue: d.weekRevenue ?? 0,
          refundedAmount: d.refundedAmount ?? 0,
          utilizationPercent: d.utilizationPercent ?? 0,
          insights: d.insights ?? null,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Dashboard-Daten konnten nicht geladen werden.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  /* ─── Helpers ─── */
  const todayVsYesterday = () => {
    if (!data || data.yesterdayReservations === 0) return { label: 'Keine Daten', positive: true };
    const diff = ((data.todayReservations - data.yesterdayReservations) / data.yesterdayReservations) * 100;
    const sign = diff >= 0 ? '+' : '';
    return { label: `${sign}${Math.round(diff)}% vs Gestern`, positive: diff >= 0 };
  };

  const buildConicGradient = (): string => {
    if (!data || !data.paymentMethodStats.length) return 'conic-gradient(#334155 0% 100%)';
    let accumulated = 0;
    const segments = data.paymentMethodStats.map((s) => {
      const start = accumulated;
      accumulated += s.percentage;
      return `${paymentMethodColors[s.method] || '#475569'} ${start}% ${accumulated}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  const groupTimelineByField = (): Record<string, TimelineEntry[]> => {
    if (!data) return {};
    const grouped: Record<string, TimelineEntry[]> = {};
    data.todayTimeline.forEach((entry) => {
      if (!grouped[entry.fieldName]) grouped[entry.fieldName] = [];
      grouped[entry.fieldName].push(entry);
    });
    return grouped;
  };

  const timeToPercent = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const totalMin = h * 60 + m;
    const dayStart = 9 * 60;
    const dayEnd = 23 * 60;
    return Math.max(0, Math.min(100, ((totalMin - dayStart) / (dayEnd - dayStart)) * 100));
  };

  const getWeeklyMax = (): number => {
    if (!data || !data.weeklyRevenue.length) return 1;
    return Math.max(...data.weeklyRevenue.map((d) => d.revenue), 1);
  };

  const getHeatmapByDay = (): Record<string, Record<string, number>> => {
    if (!data) return {};
    const result: Record<string, Record<string, number>> = {};
    data.hourlyHeatmap.forEach((cell) => {
      if (!result[cell.dayOfWeek]) result[cell.dayOfWeek] = {};
      result[cell.dayOfWeek][cell.timeSlot] = Math.max(result[cell.dayOfWeek][cell.timeSlot] || 0, cell.intensity);
    });
    return result;
  };

  const buildTrendLine = (): { points: string; circles: { cx: number; cy: number; label: string; revenue: number }[] } => {
    if (!data || !data.monthlyTrend.length) return { points: '', circles: [] };
    const maxRev = Math.max(...data.monthlyTrend.map((m) => m.revenue), 1);
    const stepX = 600 / Math.max(data.monthlyTrend.length - 1, 1);
    const circles: { cx: number; cy: number; label: string; revenue: number }[] = [];
    const pts = data.monthlyTrend.map((m, i) => {
      const x = i * stepX;
      const y = 200 - (m.revenue / maxRev) * 180;
      circles.push({ cx: x, cy: y, label: m.monthLabel, revenue: m.revenue });
      return `${x},${y}`;
    });
    return { points: pts.join(' '), circles };
  };

  const formatEuro = (n: number) => `€${n.toLocaleString('de-AT')}`;

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <>
        <Helmet><title>{pageTitle('Dashboard')}</title></Helmet>
        <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #3d1400, transparent 60%)' }} />
          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-3 w-16 bg-slate-700 rounded mb-3" />
                  <div className="h-7 w-20 bg-slate-700 rounded mb-2" />
                  <div className="h-2 w-24 bg-slate-700 rounded" />
                </div>
              ))}
            </div>
            <div className="glass-panel rounded-xl p-6 h-64 animate-pulse mb-6">
              <div className="h-4 w-40 bg-slate-700 rounded mb-4" />
              <div className="h-20 bg-slate-800/40 rounded-lg mb-3" />
              <div className="h-20 bg-slate-800/40 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel rounded-xl p-6 h-48 animate-pulse" />
              <div className="glass-panel rounded-xl p-6 h-48 animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <>
        <Helmet><title>{pageTitle('Dashboard — Fehler')}</title></Helmet>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="glass-card rounded-xl p-8 text-center max-w-md">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4 block">error</span>
            <h2 className="text-white text-lg font-bold mb-2">Fehler beim Laden</h2>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-primary hover:bg-orange-600 text-black text-sm font-bold py-2 px-6 rounded-lg transition-colors">
              Erneut versuchen
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!data) return null;

  const comparison = todayVsYesterday();
  const timelineGrouped = groupTimelineByField();
  const weeklyMax = getWeeklyMax();
  const heatmap = getHeatmapByDay();
  const trend = buildTrendLine();

  return (
    <>
      <Helmet><title>{pageTitle('Advanced Admin Dashboard')}</title></Helmet>

      <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #3d1400, transparent 60%)' }} />

        <div className="relative z-10 flex flex-col gap-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Heute</span>
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{data.todayReservations}</div>
              <div className={`text-xs font-medium flex items-center gap-1 ${comparison.positive ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm">{comparison.positive ? 'trending_up' : 'trending_down'}</span>
                {comparison.label}
              </div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vergleich</span>
                  <span className="text-primary text-xs font-bold">{comparison.label}</span>
                </div>
                <div className="text-[10px] text-slate-400">Gestern: <span className="text-white font-medium">{data.yesterdayReservations} Buchungen</span></div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">Echtzeit (Bezahlt)</span>
                <span className="material-symbols-outlined text-primary text-lg">payments</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{formatEuro(data.todayRevenue)}</div>
              <div className="text-slate-400 text-xs">Letzte Buchung: {data.lastBookingAgo || '—'}</div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Einnahmen</span>
                  <span className="text-green-400 text-xs font-bold">{data.todayRevenue > 500 ? 'Stark' : 'Normal'}</span>
                </div>
                <div className="text-[10px] text-slate-400">Woche: <span className="text-white font-medium">{formatEuro(data.weekRevenue)}</span></div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monatsumsatz</span>
                <span className="material-symbols-outlined text-slate-500 text-lg">show_chart</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{formatEuro(data.monthRevenue)}</div>
              <div className="text-primary text-xs font-medium">{data.monthReservations} Buchungen</div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance</span>
                </div>
                <div className="h-10 flex items-end gap-1 mb-2">
                  {data.weeklyRevenue.map((d, i) => {
                    const h = weeklyMax > 0 ? (d.revenue / weeklyMax) * 100 : 10;
                    return (
                      <div key={i} className={`flex-1 rounded-sm ${i === data.weeklyRevenue.length - 1 ? 'bg-primary shadow-[0_0_8px_rgba(255,68,0,0.4)]' : 'bg-slate-700/50'}`} style={{ height: `${h}%` }} />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Auslastung</span>
                <span className="material-symbols-outlined text-slate-500 text-lg">percent</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{Math.round(data.utilizationPercent)}%</div>
              <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                <div className="bg-primary h-1 rounded-full shadow-[0_0_8px_rgba(255,68,0,0.5)]" style={{ width: `${Math.min(data.utilizationPercent, 100)}%` }} />
              </div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platz Details</span>
                </div>
                {data.fieldStats.map((f) => (
                  <div key={f.fieldId} className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">{f.fieldName}</span>
                    <span className="text-white font-medium">{f.reservationCount} Buchungen</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Erstattet</span>
                <span className="material-symbols-outlined text-orange-400 text-lg">undo</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{formatEuro(data.refundedAmount)}</div>
              <div className="text-orange-400 text-xs font-medium">{data.refundedCount ?? 0} Stornierungen</div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rückbuchungen</span>
                </div>
                <div className="text-[10px] text-slate-400">Gesamte Rückerstattung: <span className="text-orange-400 font-bold">-{formatEuro(data.refundedAmount)}</span></div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-colors duration-300 group relative">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fehler</span>
                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{data.failedPaymentCount ?? 0}</div>
              <div className="text-red-500 text-xs font-medium">Zahlung abgelehnt</div>
              <div className="card-tooltip">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Warnungen</span>
                  {(data.failedPaymentCount ?? 0) > 0 && <span className="text-red-500 text-xs font-bold">Aktion nötig</span>}
                </div>
                <div className="flex items-center gap-2 text-[10px] bg-red-500/10 p-1.5 rounded border border-red-500/20">
                  <span className="material-symbols-outlined text-[14px] text-red-500">credit_card_off</span>
                  <span className="text-slate-200">{data.failedPaymentCount ?? 0} fehlgeschlagene Zahlungsversuche</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative">

            <div className="xl:col-span-2 glass-panel rounded-xl p-6 flex flex-col gap-4" style={{ overflow: 'visible', zIndex: 30 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">view_column</span>
                  Heutiger Zeitplan
                </h2>
                <div className="flex gap-4 text-xs font-medium bg-black/20 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-primary shadow-[0_0_5px_rgba(255,68,0,0.8)]" /> Bestätigt</div>
                  <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-red-500" /> Storniert</div>
                  <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-yellow-500" /> Geändert</div>
                </div>
              </div>

              <div className="flex flex-1 relative min-h-[500px] mt-2 border-t border-l border-white/10 rounded-tl-xl overflow-hidden bg-black/10">
                <div className="w-16 shrink-0 border-r border-white/10 relative bg-surface-dark/50">
                   {[9,11,13,15,17,19,21,23].map(hour => (
                     <div key={hour} className="absolute w-full right-0 text-right pr-2 text-[10px] text-slate-500 font-mono" 
                          style={{ top: `${((hour - 9) / 14) * 100}%`, transform: 'translateY(-50%)' }}>
                       {hour.toString().padStart(2,'0')}:00
                     </div>
                   ))}
                </div>

                <div className="flex-1 flex overflow-x-auto relative" style={{ overflowY: 'visible' }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    {[9,11,13,15,17,19,21,23].map((hour) => (
                      <div key={hour} className="absolute w-full border-t border-white/5" style={{ top: `${((hour - 9) / 14) * 100}%` }} />
                    ))}
                  </div>

                  {(() => {
                    const allFieldNames = data.fieldStats.map(f => f.fieldName);
                    Object.keys(timelineGrouped).forEach(name => {
                      if (!allFieldNames.includes(name)) allFieldNames.push(name);
                    });
                    const fieldNames = allFieldNames.length > 0 ? allFieldNames : Object.keys(timelineGrouped);

                    return fieldNames.map((fieldName, fIdx) => {
                      const entries = timelineGrouped[fieldName] || [];
                      return (
                        <div key={fieldName} className="flex-1 min-w-[150px] border-r border-white/10 relative group/col flex flex-col" style={{ zIndex: 10 }}>
                          
                          <div className="sticky top-0 bg-surface-dark border-b border-primary/20 p-3 text-center z-20 shadow-lg group-hover/col:bg-primary/5 transition-colors">
                            <h3 className="text-white font-black tracking-tight text-sm uppercase truncate">{fieldName}</h3>
                          </div>

                          <div className="flex-1 relative w-full h-full group-hover/col:bg-white/2 transition-colors" style={{ minHeight: '500px' }}>
                             {entries.map((entry, eIdx) => {
                               const startPct = timeToPercent(entry.startTime);
                               const endPct = timeToPercent(entry.endTime);
                               const heightPct = Math.max(endPct - startPct, 3);
                               const colors = statusColorMap[entry.status] || statusColorMap.CONFIRMED;
                               const gameType = (entry as any).gameType || 'FOOTBALL';
                               const icon = sportIconMap[gameType] || 'sports_soccer';

                               return (
                                 <div
                                   key={eIdx}
                                   className={`absolute left-1 right-1 rounded-md ${colors.bg} border-l-4 ${colors.border} p-2 hover:brightness-125 cursor-pointer backdrop-blur-md shadow-lg transition-all hover:scale-[1.02] group/item overflow-hidden`}
                                   style={{ top: `${startPct}%`, height: `${heightPct}%`, minHeight: '40px', zIndex: 20 }}
                                   onMouseEnter={(e) => (e.currentTarget.style.zIndex = '9999')}
                                   onMouseLeave={(e) => (e.currentTarget.style.zIndex = '20')}
                                 >
                                    <div className="absolute -top-2 -right-2 opacity-10 pointer-events-none">
                                      <span className="material-symbols-outlined text-[60px]">{icon}</span>
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                      <div className="flex justify-between items-start mb-1">
                                         <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider bg-black/30 px-1 rounded">{entry.startTime} - {entry.endTime}</span>
                                         <span className="material-symbols-outlined text-[14px] text-white drop-shadow-md">{icon}</span>
                                      </div>
                                      <span className="text-sm text-white font-black leading-tight drop-shadow">{entry.customerName}</span>
                                    </div>

                                    <div className="schedule-popover left-[105%] top-0 min-w-[220px]">
                                      <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
                                        <div className="flex flex-col">
                                          <span className="text-white font-bold text-sm">{entry.customerName}</span>
                                          <span className="text-primary text-xs flex items-center gap-1 font-bold tracking-wide"><span className="material-symbols-outlined text-[14px]">{icon}</span> {gameType}</span>
                                        </div>
                                        <div className={`p-1.5 rounded ${entry.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                          <span className="material-symbols-outlined text-sm">{entry.status === 'CANCELLED' ? 'cancel' : 'check_circle'}</span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Zeit:</span>
                                          <span className="text-white font-mono">{entry.startTime} - {entry.endTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Status:</span>
                                          <span className={`font-medium ${entry.status === 'CANCELLED' ? 'text-red-400' : 'text-green-400'}`}>{colors.label}</span>
                                        </div>
                                      </div>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>

                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {data.fieldStats.length === 0 && Object.keys(timelineGrouped).length === 0 && (
                <div className="flex items-center justify-center h-32 text-slate-500 text-sm">Keine Buchungen für heute</div>
              )}
            </div>

            <div className="flex flex-col gap-6 relative" style={{ zIndex: 10 }}>

              <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col justify-between min-h-[220px] relative" style={{ overflow: 'visible', zIndex: 10 }}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-white text-base font-bold">Wochenumsatz</p>
                    <p className="text-slate-400 text-xs">Aktuell: {formatEuro(data.weekRevenue)}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">bar_chart</span>
                </div>
                <div className="flex items-end gap-3 h-[140px] justify-between relative" style={{ zIndex: 10 }}>
                  {data.weeklyRevenue.map((d, i) => {
                    const heightPct = weeklyMax > 0 ? (d.revenue / weeklyMax) * 100 : 5;
                    const isMax = d.revenue === weeklyMax && d.revenue > 0;
                    const badge = barBadge(heightPct);
                    return (
                      <div key={i} className="w-full relative group bar-group h-full flex items-end">
                        <div
                          className="w-full bg-slate-800 rounded-t-sm relative transition-all duration-300 group-hover:bg-slate-700"
                          style={{ height: `${Math.max(heightPct, 5)}%` }}
                        >
                          <div className={`absolute inset-x-0 bottom-0 top-0 bg-primary transition-opacity ${isMax ? 'opacity-100 shadow-[0_0_15px_rgba(255,68,0,0.5)]' : 'opacity-30 group-hover:opacity-60'}`} />
                        </div>
                        <div className="bar-tooltip" style={{ zIndex: 50 }}>
                          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                            <span className="text-white font-bold text-sm">{d.dayLabel}</span>
                            <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <span className="text-2xl font-bold text-white tracking-tight">{formatEuro(d.revenue)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono uppercase relative" style={{ zIndex: 10 }}>
                  {data.weeklyRevenue.map((d, i) => <span key={i}>{d.dayLabel}</span>)}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl flex-1 min-h-[200px] relative chart-hover-wrapper cursor-help group" style={{ zIndex: 10, overflow: 'visible' }}>
                <p className="text-white text-base font-bold mb-4">Zahlungsmethode</p>
                <div className="flex items-center gap-6 relative" style={{ zIndex: 10 }}>
                  <div
                    className="relative size-24 rounded-full border-[6px] border-slate-700 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,68,0,0.2)]"
                    style={{ background: buildConicGradient() }}
                  >
                    <div className="size-16 bg-[#161b14] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">Total</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    {data.paymentMethodStats.map((s) => (
                      <div key={s.method} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${paymentMethodDotClass[s.method] || 'bg-slate-500'}`} />
                          <span className="text-slate-300">{paymentMethodLabels[s.method] || s.method}</span>
                        </div>
                        <span className="font-bold text-white">{Math.round(s.percentage)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-popup-container" style={{ zIndex: 50 }}>
                  <div className="popup-content p-4 rounded-xl w-[90%] flex flex-col gap-3" style={{ zIndex: 50 }}>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-white font-bold text-sm">Transaktionsdetails</span>
                      <span className="material-symbols-outlined text-primary text-sm animate-bounce">trending_up</span>
                    </div>
                    {data.paymentMethodStats.map((s) => (
                      <div key={s.method} className="flex justify-between items-center text-xs">
                        <span className="font-medium flex items-center gap-1.5" style={{ color: paymentMethodColors[s.method] }}>
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: paymentMethodColors[s.method] }} />
                          {paymentMethodLabels[s.method] || s.method}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold">{s.count} Trans.</span>
                          <span className="text-slate-400 text-[10px]">{Math.round(s.percentage)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative" style={{ zIndex: 10 }}>

            <div className="bg-linear-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-[100px] text-primary">insights</span>
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(255,68,0,0.6)]">Monats-Analyse</span>
                    <span className="text-slate-400 text-xs font-medium">{data.insights?.analyzedMonth || '—'}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{data.insights?.totalReservations ?? 0} Buchungen gesamt</span>
                </div>

                {data.insights && data.insights.fieldInsights.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {data.insights.fieldInsights.map((field) => (
                      <div key={field.fieldId} className="border border-white/5 rounded-lg p-4 bg-black/20">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-primary text-sm">sports_soccer</span>
                          <span className="text-white font-bold text-sm">{field.fieldName}</span>
                          <span className="text-slate-500 text-[10px] ml-auto">{field.totalBookings} Buchungen</span>
                        </div>

                        <div className="mb-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Schwächste Tage</p>
                          <div className="flex flex-col gap-1">
                            {field.weakestDays.map((day, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                                <span className="text-white font-medium">{day.dayName}</span>
                                <span className="text-slate-400">— {day.bookingCount} Buchungen</span>
                                <span className="text-slate-600 text-[10px]">(Ø andere: {day.avgOtherDays})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Schwächste Zeitfenster</p>
                          <div className="flex flex-wrap gap-1.5">
                            {field.weakestSlots.map((slot, i) => (
                              <div key={i} className="flex items-center gap-1 bg-yellow-500/5 border border-yellow-500/10 rounded px-2 py-1 text-[10px]">
                                <span className="material-symbols-outlined text-yellow-500 text-[12px]">warning</span>
                                <span className="text-slate-300">{slot.dayName.substring(0, 2)}</span>
                                <span className="text-white font-medium">{slot.timeRange}</span>
                                <span className="text-slate-500">({slot.bookingCount})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to={`${ADMIN_PORTAL_PATH}/einstellungen`} className="flex items-center gap-2 text-xs text-primary hover:text-orange-400 transition-colors font-medium mt-1">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span>
                      Happy Hour für diese Zeiten aktivieren?
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm py-4">Noch keine Daten für die Analyse vorhanden.</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-xl flex flex-col flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg">Meistgemietetes Material</h3>
                  <span className="text-primary text-xs hover:underline cursor-pointer">Alle ansehen</span>
                </div>
                <div className="flex flex-col gap-4">
                  {data.topMaterials.map((mat, i) => {
                    const maxRentals = Math.max(...data.topMaterials.map(m => m.rentalCount), 1);
                    const widthPct = (mat.rentalCount / maxRentals) * 100;
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white font-medium">{mat.name}</span>
                          <span className="text-slate-400">{mat.rentalCount} Ausleihen</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full">
                          <div className={`${materialBarColors[i % materialBarColors.length]} h-2 rounded-full transition-all duration-500`} style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {data.topMaterials.length === 0 && (
                    <div className="text-slate-500 text-sm text-center py-4">Keine Daten</div>
                  )}
                </div>
              </div>

                <div className="relative rounded-xl overflow-hidden group cursor-default flex-1 bg-surface-dark border border-white/10" style={{ minHeight: '180px' }}>
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-36 h-36 rounded-full border border-primary/20 group-hover:border-primary/40 transition-all duration-700"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,68,0,0.15), transparent, rgba(255,68,0,0.08), transparent)',
                      animation: 'spin 12s linear infinite',
                    }}
                  />
                </div>
                <div
                  className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-primary/30 transition-all duration-500"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    background: 'linear-gradient(135deg, rgba(17,26,14,0.8) 0%, rgba(13,18,8,0.9) 50%, rgba(17,26,14,0.7) 100%)',
                  }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center h-full py-6 gap-3">
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="SALAMANDA SOCCER ARENA"
                      className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(255,68,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(255,68,0,0.5)] transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 -m-2 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/80 text-xs font-bold tracking-widest uppercase">SoccerArena</p>
                    <p className="text-primary/60 text-[10px] font-medium tracking-wider">Salamanda OG</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 relative" style={{ zIndex: 10 }}>

            <div className="lg:col-span-2 glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(255,68,0,0.03) 0%, transparent 70%)' }} />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h3 className="text-white font-bold text-lg">Monatlicher Trend</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Letzte 6 Monate</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-4 h-[2px] bg-primary rounded shadow-[0_0_6px_rgba(255,68,0,0.8)]" />
                    Umsatz
                  </div>
                  {trend.circles.length > 0 && (
                    <span className="text-primary text-xs font-bold">{formatEuro(trend.circles[trend.circles.length - 1]?.revenue ?? 0)}</span>
                  )}
                </div>
              </div>

              <div className="h-56 w-full relative border-l border-b border-slate-700/50">
                {[25, 50, 75].map((pct, i) => (
                  <div
                    key={pct}
                    className="absolute w-full h-px"
                    style={{
                      bottom: `${pct}%`,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)',
                      animation: `fadeSlideIn 0.5s ease-out ${0.1 * i}s both`,
                    }}
                  />
                ))}

                <svg className="absolute inset-0 w-full h-full p-3" style={{ overflow: 'visible' }} preserveAspectRatio="none" viewBox="0 0 600 200">
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff4400" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#ff4400" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
                    </linearGradient>
                    <filter id="trendGlow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="pointGlow">
                      <stop offset="0%" stopColor="#ff4400" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {trend.points && trend.circles.length > 0 && (
                    <polygon
                      points={`${trend.circles[0].cx},200 ${trend.points} ${trend.circles[trend.circles.length - 1].cx},200`}
                      fill="url(#trendFill)"
                      style={{ animation: 'fadeIn 1.5s ease-out 0.5s both' }}
                    />
                  )}

                  {trend.points && (
                    <polyline
                      fill="none"
                      points={trend.points}
                      stroke="#ff4400"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                      opacity="0.15"
                      filter="url(#trendGlow)"
                      style={{
                        strokeDasharray: 2000,
                        strokeDashoffset: 2000,
                        animation: 'drawLine 2s ease-out 0.3s forwards',
                      }}
                    />
                  )}

                  {trend.points && (
                    <polyline
                      fill="none"
                      points={trend.points}
                      stroke="#ff4400"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      style={{
                        strokeDasharray: 2000,
                        strokeDashoffset: 2000,
                        animation: 'drawLine 2s ease-out 0.3s forwards',
                      }}
                    />
                  )}

                  {trend.circles.map((c, i) => {
                    const isLast = i === trend.circles.length - 1;
                    return (
                      <g key={i} style={{ animation: `popIn 0.4s ease-out ${0.3 + i * 0.15}s both` }}>
                        <circle cx={c.cx} cy={c.cy} r="16" fill="url(#pointGlow)" opacity="0" className="transition-opacity duration-300" style={{ pointerEvents: 'none' }}>
                          <set attributeName="opacity" to="1" begin="mouseover" end="mouseout" />
                        </circle>
                        {isLast && (
                          <circle cx={c.cx} cy={c.cy} r="8" fill="none" stroke="#ff4400" strokeWidth="1" opacity="0.4">
                            <animate attributeName="r" from="6" to="18" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle
                          cx={c.cx}
                          cy={c.cy}
                          r={isLast ? 5 : 3.5}
                          fill={isLast ? '#ff4400' : '#0d1208'}
                          stroke="#ff4400"
                          strokeWidth={isLast ? 2.5 : 2}
                          className="transition-all duration-300 cursor-pointer hover:r-6"
                          style={{ filter: isLast ? 'drop-shadow(0 0 6px rgba(255,68,0,0.8))' : 'none' }}
                        />
                        <foreignObject x={c.cx - 50} y={c.cy - 55} width="100" height="45" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center" style={{ pointerEvents: 'none' }}>
                            <div className="bg-[#1a2016] border border-primary/30 rounded-lg px-2.5 py-1.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm whitespace-nowrap">
                              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{c.label}</div>
                              <div className="text-xs text-white font-bold">{formatEuro(c.revenue)}</div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-xs text-slate-500 mt-3 px-3 uppercase font-mono">
                {data.monthlyTrend.map((m, i) => {
                  const isLast = i === data.monthlyTrend.length - 1;
                  return (
                    <span key={i} className={isLast ? 'text-primary font-bold' : ''} style={{ animation: `fadeSlideUp 0.3s ease-out ${0.1 * i}s both` }}>
                      {m.monthLabel}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl relative" style={{ zIndex: 10 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Stunden-Auslastung</h3>
                <span className="text-xs text-slate-400">Durchschnitt</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  {heatmapSlots.map((s) => <span key={s}>{s}</span>)}
                </div>
                {heatmapDays.map((day) => {
                  const dayData = heatmap[day] || {};
                  return (
                    <div key={day} className="flex gap-1 h-8 items-center">
                      <span className="w-6 text-[10px] text-slate-400 font-bold uppercase">{day}</span>
                      {heatmapSlots.map((slot) => {
                        const intensity = dayData[slot] ?? 0;
                        const opacityMap: Record<number, string> = {
                          0: 'bg-primary/5',
                          1: 'bg-primary/10',
                          2: 'bg-primary/20',
                          3: 'bg-primary/30',
                          4: 'bg-primary/40',
                          5: 'bg-primary/50',
                          6: 'bg-primary/60',
                          7: 'bg-primary/70',
                          8: 'bg-primary/80',
                          9: 'bg-primary/90',
                          10: 'bg-primary',
                        };
                        const bg = opacityMap[Math.min(Math.round(intensity * 10), 10)] || 'bg-primary/5';
                        const pct = Math.round(intensity * 100);
                        return (
                          <div
                            key={slot}
                            className={`flex-1 h-full rounded ${bg} hover:brightness-125 transition-colors cursor-help hour-block relative`}
                            title={`${day} ${slot}: ${pct}%`}
                          >
                            <div className="hour-tooltip">
                              <div className="text-xs font-bold text-white mb-1">{day} {slot}:00</div>
                              <div className="text-[10px] text-slate-300">Auslastung: <span className="text-primary font-bold">{pct}%</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

