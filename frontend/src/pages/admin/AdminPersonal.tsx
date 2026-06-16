import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation } from 'react-i18next';
import { staffService, Staff } from '../../services/staffService';
import api from '../../services/api';

export function AdminPersonal() {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', email: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '' });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await staffService.getAll();
      setStaffList(res.data.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', role: '', phone: '', email: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      phone: staff.phone || '',
      email: staff.email || '',
      notes: staff.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (editingStaff) {
        await staffService.update(editingStaff.id, { ...formData, active: editingStaff.active });
      } else {
        await staffService.create({ ...formData, active: true });
      }
      setIsModalOpen(false);
      await fetchStaff();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await staffService.delete(id);
      await fetchStaff();
    } catch {
    }
  };

  const handleInviteAdmin = async () => {
    try {
      setIsInviting(true);
      setInviteError('');
      setInviteSuccess('');
      await api.post('/admin/users/invite-admin', adminForm);
      setInviteSuccess(t('adminStaff.adminInviteSuccess'));
      setAdminForm({ name: '', email: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('adminStaff.adminInviteError');
      setInviteError(msg);
    } finally {
      setIsInviting(false);
    }
  };

  const allCount = staffList.length;
  const activeCount = staffList.filter(s => s.active).length;
  const inactiveCount = staffList.filter(s => !s.active).length;
  const roles = [...new Set(staffList.map(s => s.role))];

  const filteredStaff = staffList.filter(s => {
    if (filterRole && s.role !== filterRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
    }
    return true;
  });

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeClass = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('manager') || r.includes('leiter')) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    if (r.includes('trainer')) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    if (r.includes('platzwart') || r.includes('wartung')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (r.includes('rezeption') || r.includes('empfang')) return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
    return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  };

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return '–';
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return t('adminStaff.time.minsAgo', { min: diffMin });
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return t('adminStaff.time.hoursAgo', { hours: diffH });
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return t('adminStaff.time.yesterday');
    return t('adminStaff.time.daysAgo', { days: diffD });
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle(t('adminStaff.title'))}</title>
      </Helmet>

      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary/80 text-sm font-medium uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Admin Panel
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{t('adminStaff.title')}</h2>
              <p className="text-slate-400 mt-1 max-w-lg">{t('adminStaff.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-white">groups</span>
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('adminStaff.stats.total')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white">{isLoading ? '–' : allCount}</span>
              </div>
            </div>
            <div className="bg-glass backdrop-blur-md border border-primary/20 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(255,68,0,0.05)]">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">verified_user</span>
              </div>
              <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">{t('adminStaff.stats.activeTitle')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-primary drop-shadow-[0_0_8px_rgba(255,68,0,0.5)]">{isLoading ? '–' : activeCount}</span>
                <span className="text-slate-400 text-sm font-normal">{t('adminStaff.stats.activeDesc')}</span>
              </div>
              <div className="w-full bg-surface-dark h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-primary h-full shadow-[0_0_10px_rgba(255,68,0,0.8)]" style={{ width: allCount > 0 ? `${(activeCount / allCount) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-white">person_off</span>
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('adminStaff.stats.inactive')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white">{isLoading ? '–' : inactiveCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-lg leading-5 bg-background-dark/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder={t('adminStaff.search.placeholder')}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500">filter_list</span>
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2.5 border border-white/10 rounded-lg leading-5 bg-background-dark/50 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm appearance-none transition-all cursor-pointer"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                >
                  <option value="">{t('adminStaff.search.allRoles')}</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500 text-sm">expand_more</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={openCreateModal}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-[0_0_10px_rgba(255,68,0,0.3)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">add</span>
                Neues Personal
              </button>
              <button
                onClick={() => { setIsAdminModalOpen(true); setInviteSuccess(''); setInviteError(''); }}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/10 font-bold py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">admin_panel_settings</span>
                Neues Admin
              </button>
            </div>
          </div>

          <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-white/10 bg-white/5 text-slate-400 font-semibold">
                  <tr>
                    <th className="px-6 py-4" scope="col">{t('adminStaff.table.staff')}</th>
                    <th className="px-6 py-4" scope="col">{t('adminStaff.table.role')}</th>
                    <th className="px-6 py-4" scope="col">{t('adminStaff.table.status')}</th>
                    <th className="px-6 py-4" scope="col">{t('adminStaff.table.contact')}</th>
                    <th className="px-6 py-4" scope="col">{t('adminStaff.table.created')}</th>
                    <th className="px-6 py-4 text-right" scope="col">{t('adminStaff.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Keine Mitarbeiter gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map(staff => (
                      <tr key={staff.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold">
                              {getInitials(staff.name)}
                              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background-dark ${staff.active ? 'bg-primary' : 'bg-slate-500'}`} />
                            </div>
                            <div className="font-medium text-white">
                              <div>{staff.name}</div>
                              <div className="text-xs text-slate-500 font-normal">ID: #EMP-{String(staff.id).padStart(3, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeClass(staff.role)}`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {staff.active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 border border-slate-600/30">
                              Inaktiv
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">{staff.email || '–'}</span>
                            <span className="text-xs">{staff.phone || '–'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {formatDate(staff.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(staff)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title={t('adminStaff.actions.editProfile')}
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeactivate(staff.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title={t('adminStaff.actions.deactivate')}
                            >
                              <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                {t('adminStaff.table.showing', { count: filteredStaff.length, total: allCount })}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsModalOpen(false)}
      />

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="bg-background-dark border border-white/10 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">
              {editingStaff ? t('adminStaff.modal.editTitle') : t('adminStaff.modal.newTitle')}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600"
                placeholder={t('adminStaff.modal.namePH')}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.role')}</label>
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 appearance-none cursor-pointer"
              >
                <option value="">{t('adminStaff.modal.rolePH')}</option>
                <option value="Manager">{t('adminStaff.modal.roles.Manager')}</option>
                <option value="Trainer">{t('adminStaff.modal.roles.Trainer')}</option>
                <option value="Platzwart">{t('adminStaff.modal.roles.Platzwart')}</option>
                <option value="Rezeption">{t('adminStaff.modal.roles.Rezeption')}</option>
                <option value="Reinigung">{t('adminStaff.modal.roles.Reinigung')}</option>
                <option value="Security">{t('adminStaff.modal.roles.Security')}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600"
                  placeholder={t('adminStaff.modal.emailPH')}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600"
                  placeholder={t('adminStaff.modal.phonePH')}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.notes')}</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600 resize-none"
                rows={3}
                placeholder={t('adminStaff.modal.notesPH')}
              />
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium text-sm"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.role}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_10px_rgba(255,68,0,0.2)]"
            >
              {isSaving ? (
                <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : editingStaff ? t('adminStaff.modal.updateBtn') : t('adminStaff.modal.createBtn')}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAdminModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsAdminModalOpen(false)}
      />

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isAdminModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="bg-background-dark border border-white/10 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              </div>
              <h3 className="text-xl font-bold text-white">{t('adminStaff.adminModal.title')}</h3>
            </div>
            <button onClick={() => setIsAdminModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-400">{t('adminStaff.adminModal.desc')}</p>

            {inviteSuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {inviteSuccess}
              </div>
            )}
            {inviteError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {inviteError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.modal.name')}</label>
              <input
                type="text"
                value={adminForm.name}
                onChange={e => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600"
                placeholder={t('adminStaff.modal.namePH')}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('adminStaff.adminModal.email')}</label>
              <input
                type="email"
                value={adminForm.email}
                onChange={e => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 p-3 placeholder:text-slate-600"
                placeholder={t('adminStaff.adminModal.emailPH')}
              />
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium text-sm"
            >
              Abbrechen
            </button>
            <button
              onClick={handleInviteAdmin}
              disabled={isInviting || !adminForm.name || !adminForm.email}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_10px_rgba(255,68,0,0.2)]"
            >
              {isInviting ? (
                <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : t('adminStaff.adminModal.inviteBtn')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
