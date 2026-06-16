import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation } from 'react-i18next';
import { contactService, ContactMessage } from '../../services/contactService';

export function AdminKontaktFormular() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await contactService.getAll();
      setMessages(res.data.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await contactService.getById(id);
      setSelectedMessage(res.data.data);
      setIsDrawerOpen(true);
      setMessages(prev => prev.map(m => m.id === id && m.status === 'NEW' ? { ...m, status: 'READ' } : m));
    } catch {
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedMessage(null), 300);
  };

  const handleMarkReplied = async () => {
    if (!selectedMessage) return;
    await contactService.markReplied(selectedMessage.id);
    setSelectedMessage(prev => prev ? { ...prev, status: 'REPLIED' } : null);
    setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'REPLIED' } : m));
  };

  const handleArchive = async (id: number) => {
    await contactService.archive(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) handleCloseDrawer();
  };

  const allCount = messages.length;
  const newCount = messages.filter(m => m.status === 'NEW').length;
  const repliedCount = messages.filter(m => m.status === 'REPLIED').length;

  const filteredMessages = messages.filter(m => {
    if (filterStatus && m.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.subject || '').toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `${t('adminContact.time.today')}, ${time}`;
    if (isYesterday) return `${t('adminContact.time.yesterday')}, ${time}`;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) + `, ${time}`;
  };

  const handleExport = () => {
    const headers = [t('adminContact.table.id'), t('adminContact.table.date'), t('adminContact.table.name'), t('adminContact.table.email'), 'Telefon', t('adminContact.table.subject'), t('adminContact.drawer.message'), t('adminContact.table.status')];
    const statusLabels: Record<string, string> = { NEW: 'Neu', READ: 'Gelesen', REPLIED: 'Beantwortet', ARCHIVED: 'Archiviert' };
    const rows = filteredMessages.map(msg => [
      msg.id,
      new Date(msg.createdAt).toLocaleString('de-DE'),
      msg.name,
      msg.email,
      msg.phone || '',
      msg.subject || '',
      msg.message,
      statusLabels[msg.status] || msg.status
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kontaktanfragen_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'READ': return 'bg-primary/15 text-primary border border-primary/30';
      case 'REPLIED': return 'bg-green-500/15 text-green-400 border border-green-500/30';
      case 'ARCHIVED': return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
      default: return '';
    }
  };
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-400';
      case 'READ': return 'bg-primary';
      case 'REPLIED': return 'bg-green-400';
      case 'ARCHIVED': return 'bg-slate-400';
      default: return '';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW': return t('adminContact.statuses.NEW');
      case 'READ': return t('adminContact.statuses.READ');
      case 'REPLIED': return t('adminContact.statuses.REPLIED');
      case 'ARCHIVED': return t('adminContact.statuses.ARCHIVED');
      default: return status;
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle(t('adminContact.title'))}</title>
      </Helmet>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t('adminContact.header')}</h1>
            <p className="text-slate-400 mt-1">{t('adminContact.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-surface-dark border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all hover:shadow-[0_0_10px_rgba(255,140,0,0.1)]"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Exportieren
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-full">
          <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">mail</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400">{t('adminContact.stats.all')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold text-white">{isLoading ? '–' : allCount}</h3>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-5 relative overflow-hidden group border-l-4 border-l-blue-500">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-blue-500">mark_email_unread</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400">{t('adminContact.stats.new')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold text-white">{isLoading ? '–' : newCount}</h3>
                <span className="text-xs font-medium text-blue-400">{t('adminContact.stats.unread')}</span>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-5 relative overflow-hidden group border-l-4 border-l-green-500">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-green-500">reply</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400">{t('adminContact.stats.replied')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold text-white">{isLoading ? '–' : repliedCount}</h3>
                <span className="text-xs font-medium text-slate-500">{t('adminContact.stats.total')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-surface-dark/30 p-2 rounded-lg border border-surface-border">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              className="w-full bg-background-dark border border-surface-border rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder={t('adminContact.search')}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="bg-background-dark border border-surface-border rounded-md py-2 pl-3 pr-8 text-sm text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">{t('adminContact.filters.all')}</option>
              <option value="NEW">{t('adminContact.statuses.NEW')}</option>
              <option value="READ">{t('adminContact.statuses.READ')}</option>
              <option value="REPLIED">{t('adminContact.statuses.REPLIED')}</option>
            </select>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden shadow-2xl w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-auto">
              <thead className="bg-surface-dark/80 text-xs uppercase text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider w-24">{t('adminContact.table.id')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider w-40">{t('adminContact.table.date')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider w-48">{t('adminContact.table.name')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider w-64">{t('adminContact.table.email')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider">{t('adminContact.table.subject')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider w-32">{t('adminContact.table.status')}</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right w-32">{t('adminContact.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Keine Nachrichten gefunden.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map(msg => (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenDetail(msg.id)}
                      className={`border-b border-surface-border hover:bg-surface-border transition-colors group cursor-pointer ${msg.status === 'REPLIED' || msg.status === 'ARCHIVED' ? 'bg-surface-dark/20' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-500">#{msg.id}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${msg.status === 'NEW' ? 'text-white' : 'text-slate-400'}`}>
                        {formatDate(msg.createdAt)}
                      </td>
                      <td className={`px-6 py-4 font-medium ${msg.status === 'NEW' || msg.status === 'READ' ? 'text-white' : 'text-slate-300'}`}>
                        {msg.name}
                      </td>
                      <td className={`px-6 py-4 ${msg.status === 'NEW' || msg.status === 'READ' ? 'text-slate-300' : 'text-slate-400'}`}>
                        {msg.email}
                      </td>
                      <td className={`px-6 py-4 ${msg.status === 'NEW' || msg.status === 'READ' ? 'text-slate-300' : 'text-slate-400'}`}>
                        {msg.subject || '–'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusBadgeClass(msg.status)} px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(msg.status)}`} />
                          {getStatusLabel(msg.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title={t('adminContact.actions.view')}
                            onClick={e => { e.stopPropagation(); handleOpenDetail(msg.id); }}
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title={t('adminContact.actions.delete')}
                            onClick={e => { e.stopPropagation(); handleArchive(msg.id); }}
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-slate-500">{t('adminContact.table.showing', { count: filteredMessages.length, total: allCount })}</p>
            <div className="flex gap-2">
              <button className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="p-1 rounded text-slate-500 hover:text-white">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-9998 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={handleCloseDrawer}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-9999 w-full md:w-[480px] bg-surface-dark border-l border-surface-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedMessage && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-surface-border bg-background-dark/50 backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-white">{t('adminContact.drawer.title')}</h2>
                <p className="text-sm text-slate-400">ID #{selectedMessage.id}</p>
              </div>
              <button onClick={handleCloseDrawer} className="p-2 rounded-full hover:bg-surface-border text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background-dark/95">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xl font-bold border border-surface-border">
                  {selectedMessage.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedMessage.name}</h3>
                  <a className="text-primary hover:underline text-sm block" href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                  {selectedMessage.phone && (
                    <span className="text-xs text-slate-500 mt-1 block">{t('adminContact.drawer.tel')}{selectedMessage.phone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-dark/50 p-3 rounded-lg border border-surface-border/50">
                  <p className="text-xs text-slate-500 mb-1">{t('adminContact.table.date')}</p>
                  <p className="text-sm text-white font-medium">{formatDate(selectedMessage.createdAt)}</p>
                </div>
                <div className="bg-surface-dark/50 p-3 rounded-lg border border-surface-border/50">
                  <p className="text-xs text-slate-500 mb-1">{t('adminContact.table.status')}</p>
                  <span className={`${getStatusBadgeClass(selectedMessage.status)} px-2 py-0.5 rounded text-xs font-bold inline-block`}>
                    {getStatusLabel(selectedMessage.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('adminContact.table.subject')}</p>
                <p className="text-white font-medium text-lg">{selectedMessage.subject || 'Kein Betreff'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('adminContact.drawer.message')}</p>
                <div
                  className="p-5 rounded-lg text-slate-300 leading-relaxed text-sm whitespace-pre-wrap"
                  style={{
                    background: 'rgba(18, 18, 18, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(38, 38, 38, 0.5)',
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-surface-border bg-background-dark flex flex-col gap-3">
              <a
                href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject || t('adminContact.drawer.replySubject')}`}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-black transition-all shadow-[0_0_10px_rgba(255,140,0,0.2)] hover:shadow-[0_0_20px_rgba(255,140,0,0.4)] hover:bg-orange-400"
              >
                <span className="material-symbols-outlined">reply</span>
                Direkt antworten
              </a>
              <div className="flex gap-3">
                <button
                  onClick={handleMarkReplied}
                  disabled={selectedMessage.status === 'REPLIED'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-dark px-4 py-3 text-sm font-medium text-slate-300 hover:bg-surface-border transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  Als erledigt markieren
                </button>
                <button
                  onClick={() => handleArchive(selectedMessage.id)}
                  className="flex items-center justify-center rounded-lg border border-surface-border bg-surface-dark px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                  title={t('adminContact.actions.delete')}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
