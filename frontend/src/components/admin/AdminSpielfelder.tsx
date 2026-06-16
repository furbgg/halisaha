import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export interface Field {
  id: number;
  name: string;
  supportedSports: string[];
  hourlyPrice: number;
  allowedDurations: number[];
  active: boolean;
  openingTime: string;
  closingTime: string;
  weekdayOpening: string | null;
  weekdayClosing: string | null;
  weekendOpening: string | null;
  weekendClosing: string | null;
}

const AVAILABLE_SPORTS = [
  { id: 'FOOTBALL', label: 'Futbol', icon: 'sports_soccer' },
  { id: 'BUBBLE_SOCCER', label: 'Bubble Soccer', icon: 'sports_handball' },
  { id: 'TENNIS', label: 'Tenis', icon: 'sports_tennis' },
  { id: 'BASKETBALL', label: 'Basketbol', icon: 'sports_basketball' },
  { id: 'VOLLEYBALL', label: 'Voleybol', icon: 'sports_volleyball' },
];

const AVAILABLE_DURATIONS = [60, 90, 120, 150, 180];

interface AdminSpielfelderProps {
  fields: Field[];
  onFieldsChange: () => void;
}

export function AdminSpielfelder({ fields, onFieldsChange }: AdminSpielfelderProps) {
  const { t } = useTranslation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Field>>({
    name: '',
    supportedSports: ['FOOTBALL'],
    hourlyPrice: 0,
    allowedDurations: [60, 90],
    active: true,
    openingTime: '10:00',
    closingTime: '23:30',
  });

  const handleOpenAdd = () => {
    setEditingField(null);
    setFormData({
      name: '',
      supportedSports: ['FOOTBALL'],
      hourlyPrice: 0,
      allowedDurations: [60, 90, 120, 150, 180],
      active: true,
      openingTime: '10:00',
      closingTime: '23:30',
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleOpenEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      ...field,
      supportedSports: field.supportedSports?.length ? field.supportedSports : ['FOOTBALL']
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('adminSettings.fields.deleteConfirm', 'Bu sahayı silmek istediğinizden emin misiniz? (Bağlı rezervasyonlar varsa silinmeyebilir)'))) return;
    try {
      await api.delete(`/admin/fields/${id}`);
      onFieldsChange();
    } catch (err: any) {
      alert(err.response?.data?.message || t('adminSettings.errors.generic', 'Hata oluştu'));
    }
  };

  const handleToggleActive = async (field: Field) => {
    try {
      await api.put(`/admin/fields/${field.id}`, { ...field, active: !field.active });
      onFieldsChange();
    } catch (err: any) {
      alert(t('adminSettings.errors.generic', 'Hata oluştu'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload: Partial<Field> = {
        ...formData,
        hourlyPrice: formData.hourlyPrice ?? 0,
        allowedDurations: formData.allowedDurations?.length ? formData.allowedDurations : [60],
        supportedSports: formData.supportedSports?.length ? formData.supportedSports : ['FOOTBALL']
      };

      if (editingField) {
        await api.put(`/admin/fields/${editingField.id}`, payload);
      } else {
        await api.post(`/admin/fields`, payload);
      }
      setIsModalOpen(false);
      onFieldsChange();
    } catch (err: any) {
      setError(err.response?.data?.message || t('adminSettings.errors.generic', 'Bir hata oluştu'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSport = (sportId: string) => {
    const current = formData.supportedSports || [];
    if (current.includes(sportId)) {
       setFormData({ ...formData, supportedSports: current.filter(s => s !== sportId) });
    } else {
       setFormData({ ...formData, supportedSports: [...current, sportId] });
    }
  };

  const toggleDuration = (dur: number) => {
    const current = formData.allowedDurations || [];
    if (current.includes(dur)) {
       setFormData({ ...formData, allowedDurations: current.filter(d => d !== dur) });
    } else {
       setFormData({ ...formData, allowedDurations: [...current, dur].sort((a,b) => a-b) });
    }
  };

  const getSportIcon = (sportId: string) => AVAILABLE_SPORTS.find(s => s.id === sportId)?.icon || 'sports_soccer';
  const getSportLabel = (sportId: string) => AVAILABLE_SPORTS.find(s => s.id === sportId)?.label || sportId;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">stadium</span>
          <h2 className="text-2xl font-black tracking-tight text-white">{t('adminSettings.fields.manageTitle', 'Saha Yönetimi')}</h2>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,68,0,0.3)]"
        >
          <span className="material-symbols-outlined">add</span>
          {t('adminSettings.fields.add', 'Yeni Saha Ekle')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.id} className="bg-glass backdrop-blur-md border border-white/10 rounded-2xl p-6 relative group overflow-hidden transition-all hover:bg-white/5 hover:border-white/20">
            <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold rounded-bl-2xl ${field.active ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
              {field.active ? t('adminSettings.fields.status.active', 'Aktif') : t('adminSettings.fields.status.inactive', 'Pasif')}
            </div>

            <div className="flex items-start gap-5 mb-5">
              <div className={`${(field.supportedSports || []).length > 2 ? 'w-20 h-20' : 'w-16 h-16'} rounded-xl bg-surface-dark flex flex-wrap items-center justify-center text-primary/80 border border-primary/20 p-2 gap-1 gap-y-1`}>
                {(field.supportedSports || []).slice(0, 4).map(sport => (
                   <span key={sport} className={`material-symbols-outlined ${(field.supportedSports || []).length > 2 ? 'text-lg' : 'text-2xl'}`} title={getSportLabel(sport)}>{getSportIcon(sport)}</span>
                ))}
              </div>
              <div>
                <h3 className="text-white font-black text-2xl tracking-tight mb-1">{field.name}</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(field.supportedSports || []).map(sport => (
                    <span key={sport} className="px-2 py-1 bg-surface-dark text-slate-300 rounded border border-white/10">
                      {getSportLabel(sport)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 text-sm">
              <div className="bg-background-dark p-3 rounded-xl border border-white/5">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{t('adminSettings.fields.durations', 'Süreler')}</span>
                <span className="text-white font-bold">{field.allowedDurations?.join(', ')} dk</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={field.active} onChange={() => handleToggleActive(field)} />
                <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                <span className="ml-2 text-sm font-bold text-slate-400 select-none">{t('adminSettings.fields.statusLabel', 'Durum')}</span>
              </label>

              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(field)} className="bg-surface-dark hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-white/10 hover:border-blue-500/30 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> {t('common.edit', 'Düzenle')}
                </button>
                <button onClick={() => handleDelete(field.id)} className="bg-surface-dark hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface-dark/95 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{editingField ? 'edit_square' : 'add_box'}</span>
                {editingField ? t('adminSettings.fields.edit', 'Sahayı Düzenle') : t('adminSettings.fields.add', 'Yeni Saha Ekle')}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined">error</span>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.form.name', 'Saha Adı')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3"
                    placeholder={t('adminSettings.fields.form.namePlaceholder', 'Örn: Kapalı Saha 1')}
                  />
                </div>

                <div>
                   <label className="block mb-3 text-sm font-bold text-white">{t('adminSettings.fields.form.sports', 'Desteklenen Sporlar (Çoklu Seçim)')}</label>
                   <div className="flex flex-wrap gap-3">
                     {AVAILABLE_SPORTS.map(sport => {
                       const isSelected = (formData.supportedSports || []).includes(sport.id);
                       return (
                         <button
                           key={sport.id}
                           type="button"
                           onClick={() => toggleSport(sport.id)}
                           className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                             isSelected 
                               ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,68,0,0.1)]' 
                               : 'bg-background-dark border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                           }`}
                         >
                           <span className="material-symbols-outlined text-lg">{sport.icon}</span>
                           {sport.label}
                         </button>
                       );
                     })}
                   </div>
                   {(!formData.supportedSports || formData.supportedSports.length === 0) && (
                     <p className="text-xs text-red-400 mt-2">{t('adminSettings.fields.form.sportRequired', '* En az bir spor türü seçmelisiniz.')}</p>
                   )}
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/10">

                  <div>
                     <label className="block mb-3 text-sm font-bold text-white">{t('adminSettings.fields.form.durations', 'Kiralanabilir Süreler (dk)')}</label>
                     <div className="flex flex-wrap gap-2">
                       {AVAILABLE_DURATIONS.map(dur => {
                         const isSelected = (formData.allowedDurations || []).includes(dur);
                         return (
                           <button
                             key={dur}
                             type="button"
                             onClick={() => toggleDuration(dur)}
                             className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                               isSelected ? 'bg-white text-black border-white' : 'bg-background-dark border-white/20 text-slate-400 hover:border-white/50 hover:text-white'
                             }`}
                           >
                             {dur}
                           </button>
                         );
                       })}
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.form.openTime', 'Açılış Saati (Standart)')}</label>
                    <input
                      type="time"
                      required
                      value={formData.openingTime || '10:00'}
                      onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                      className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.form.closeTime', 'Kapanış Saati (Standart)')}</label>
                    <input
                      type="time"
                      required
                      value={formData.closingTime || '23:30'}
                      onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                      className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-[-24px] bg-surface-dark pb-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-white/10"
                >
                  {t('common.cancel', 'İptal')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.supportedSports?.length || !formData.allowedDurations?.length}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-[0_0_15px_rgba(255,68,0,0.3)] flex items-center gap-2"
                >
                  {isSaving ? <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                  {editingField ? t('common.saveChanges', 'Değişiklikleri Kaydet') : t('adminSettings.fields.create', 'Sahayı Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
