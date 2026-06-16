import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation } from 'react-i18next';
import { equipmentService, Equipment } from '../../services/equipmentService';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

const ALL_CATEGORIES = 'Alle Kategorien';

export function AdminMaterial() {
  const { t } = useTranslation();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    condition: 'GUT' as Equipment['condition'],
    rentable: false,
    rentalPricePerHour: 0,
    availableSizes: '' as string,
    notes: ''
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await equipmentService.getAll();
      setEquipmentList(res.data.data);
    } catch (err) {
      setError(t('adminMaterial.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(equipmentList.map(e => e.category))];
    return [t('adminMaterial.allCategories'), ...cats];
  }, [equipmentList]);

  const filteredList = useMemo(() => {
    if (activeCategory === t('adminMaterial.allCategories')) return equipmentList;
    return equipmentList.filter(e => e.category === activeCategory);
  }, [equipmentList, activeCategory]);

  const stats = useMemo(() => {
    const totalStock = equipmentList.reduce((sum, e) => sum + e.quantity, 0);
    const rentableCount = equipmentList.filter(e => e.rentable).reduce((sum, e) => sum + e.quantity, 0);
    const defectCount = equipmentList
      .filter(e => e.condition === 'BESCHAEDIGT' || e.condition === 'AUSGEMUSTERT')
      .reduce((sum, e) => sum + e.quantity, 0);
    return { totalStock, rentableCount, defectCount };
  }, [equipmentList]);

  const handleOpenModal = (item?: Equipment) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        condition: item.condition,
        rentable: item.rentable,
        rentalPricePerHour: item.rentalPricePerHour,
        availableSizes: item.availableSizes ? item.availableSizes.join(', ') : '',
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        quantity: 1,
        condition: 'NEU',
        rentable: false,
        rentalPricePerHour: 0,
        availableSizes: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        condition: formData.condition,
        rentable: formData.rentable,
        rentalPricePerHour: Number(formData.rentalPricePerHour),
        availableSizes: formData.availableSizes
          ? formData.availableSizes.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        notes: formData.notes || null,
      };
      if (editingItem) {
        await equipmentService.update(editingItem.id, payload);
      } else {
        await equipmentService.create(payload);
      }
      await fetchData();
      handleCloseModal();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (item: Equipment) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await equipmentService.delete(itemToDelete.id);
      await fetchData();
    } catch {
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Kategorie', 'Menge', 'Zustand', 'Verleihbar', 'Preis/Stunde (€)', 'Größen', 'Notizen'];
    const conditionLabels: Record<string, string> = { NEU: 'Neu', GUT: 'Gut', BESCHAEDIGT: 'Beschädigt', AUSGEMUSTERT: 'Ausgemustert' };
    const rows = filteredList.map(item => [
      item.name,
      item.category,
      item.quantity,
      conditionLabels[item.condition] || item.condition,
      item.rentable ? 'Ja' : 'Nein',
      item.rentable ? item.rentalPricePerHour.toFixed(2) : '',
      item.availableSizes ? item.availableSizes.join('; ') : '',
      item.notes || ''
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `material_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getConditionInfo = (condition: Equipment['condition']) => {
    switch (condition) {
      case 'NEU':
        return { label: t('adminMaterial.conditions.new'), color: 'emerald', dot: true };
      case 'GUT':
        return { label: t('adminMaterial.conditions.good'), color: 'emerald', dot: true };
      case 'BESCHAEDIGT':
        return { label: t('adminMaterial.conditions.damaged'), color: 'orange', dot: false };
      case 'AUSGEMUSTERT':
        return { label: t('adminMaterial.conditions.retired'), color: 'red', dot: false };
      default:
        return { label: condition, color: 'slate', dot: false };
    }
  };

  const getAvailabilityColor = (item: Equipment) => {
    if (!item.rentable || item.quantity === 0) return 'red';
    if (item.quantity <= 5) return 'orange';
    return 'emerald';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Helmet>
        <title>{pageTitle(t('adminMaterial.title'))}</title>
      </Helmet>

      <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#050505]/80 px-8 backdrop-blur-xl z-10 shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="h-6 w-1 rounded bg-primary shadow-[0_0_10px_rgba(255,68,0,0.6)]"></span>
          Material &amp; Inventar
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Exportieren
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,68,0,0.4)] hover:shadow-[0_0_25px_rgba(255,68,0,0.6)] hover:-translate-y-px"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Neues Material
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={t('adminMaterial.stats.total')}
            value={stats.totalStock}
            icon="inventory"
            color="primary"
            subtitle={`${equipmentList.length} Artikel`}
          />
          <StatCard
            title={t('adminMaterial.stats.rentable')}
            value={stats.rentableCount}
            icon="shopping_bag"
            color="blue"
            subtitle={`${equipmentList.filter(e => e.rentable).length} Artikel aktiv`}
          />
          <StatCard
            title={t('adminMaterial.stats.defect')}
            value={stats.defectCount}
            icon="build"
            color="red"
            subtitle={stats.defectCount > 0 ? t('adminMaterial.stats.actionNeeded') : t('adminMaterial.stats.allGood')}
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-6 border-b border-white/10 mb-6 px-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'text-white font-bold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary shadow-[0_0_15px_rgba(255,68,0,0.6)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-surface-dark/70 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase text-white/50 font-medium tracking-wider">
                    <tr>
                      <th className="px-6 py-4">{t('adminMaterial.stats.items')}</th>
                      <th className="px-6 py-4">{t('adminMaterial.table.sizeType')}</th>
                      <th className="px-6 py-4 text-center">{t('adminMaterial.table.available')}</th>
                      <th className="px-6 py-4">{t('adminMaterial.table.status')}</th>
                      <th className="px-6 py-4">{t('adminMaterial.table.rentalFee')}</th>
                      <th className="px-6 py-4 text-right">{t('adminMaterial.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          <span className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </td>
                      </tr>
                    ) : filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl opacity-50">inventory</span>
                            <p>{t('adminMaterial.table.empty')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item) => {
                        const conditionInfo: any = getConditionInfo(item.condition);
                        const availColor = getAvailabilityColor(item);
                        return (
                          <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/50 ring-1 ring-transparent group-hover:ring-primary/40 transition-all shrink-0">
                                  <span className="material-symbols-outlined text-xl">
                                    {getCategoryIcon(item.category)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-bold text-white group-hover:text-primary transition-colors">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-white/30 font-mono tracking-wide">
                                    {item.category} • ID: #{item.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {item.availableSizes && item.availableSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {item.availableSizes.slice(0, 3).map((size) => (
                                    <span
                                      key={size}
                                      className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/10"
                                    >
                                      {size}
                                    </span>
                                  ))}
                                  {item.availableSizes.length > 3 && (
                                    <span className="text-xs text-white/40">
                                      +{item.availableSizes.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-white/30">{t('adminMaterial.table.oneSize')}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={`text-sm font-bold ${
                                  availColor === 'emerald' ? 'text-emerald-400' :
                                  availColor === 'orange' ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {item.quantity}
                                </span>
                                <span className="text-[10px] text-white/30">{t('adminMaterial.table.pieces')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {conditionInfo.dot ? (
                                  <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                      conditionInfo.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`} />
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                      conditionInfo.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`} />
                                  </span>
                                ) : (
                                  <span className={`flex h-2 w-2 rounded-full ${
                                    conditionInfo.color === 'orange' ? 'bg-orange-400 shadow-[0_0_5px_orange]' :
                                    conditionInfo.color === 'red' ? 'bg-red-400 shadow-[0_0_5px_red]' : 'bg-slate-400'
                                  }`} />
                                )}
                                <span className={`text-xs font-semibold ${
                                  conditionInfo.color === 'emerald' ? 'text-emerald-400' :
                                  conditionInfo.color === 'orange' ? 'text-orange-400' :
                                  conditionInfo.color === 'red' ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                  {conditionInfo.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {item.rentable && item.rentalPricePerHour > 0 ? (
                                <span className="text-white/70 font-mono">
                                  {item.rentalPricePerHour.toFixed(2)} €
                                </span>
                              ) : (
                                <span className="text-xs text-white/30">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="rounded-lg p-1.5 text-white/50 hover:bg-primary/20 hover:text-primary transition-colors"
                                  title={t('adminMaterial.actions.edit')}
                                >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                  onClick={() => confirmDelete(item)}
                                  className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                  title={t('adminMaterial.actions.delete')}
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && filteredList.length > 0 && (
                <div className="flex items-center justify-between border-t border-white/5 bg-white/2 px-6 py-3">
                  <p className="text-xs text-white/40 font-medium">
                    {t('adminMaterial.table.showing', { count: filteredList.length, total: equipmentList.length })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full xl:w-80 shrink-0">
            <div className="rounded-xl border border-white/10 bg-surface-dark/70 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <h3 className="text-lg font-bold text-white tracking-tight">{t('adminMaterial.categories.title')}</h3>
                <span className="rounded-full bg-primary/20 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary shadow-[0_0_10px_rgba(255,68,0,0.2)]">
                  {equipmentList.length} Artikel
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {categories.filter(c => c !== t('adminMaterial.allCategories')).map((cat) => {
                  const items = equipmentList.filter(e => e.category === cat);
                  const totalQty = items.reduce((s, e) => s + e.quantity, 0);
                  const rentableQty = items.filter(e => e.rentable).reduce((s, e) => s + e.quantity, 0);
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-lg border p-4 transition-all text-left ${
                        activeCategory === cat
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          activeCategory === cat
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white/5 text-white/50'
                        }`}>
                          <span className="material-symbols-outlined text-xl">
                            {getCategoryIcon(cat)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${
                            activeCategory === cat ? 'text-primary' : 'text-white'
                          }`}>
                            {cat}
                          </p>
                          <p className="text-xs text-white/40">
                            {totalQty} {t('adminMaterial.categories.rentableParams', { rentable: rentableQty }).split('{{rentable}}')[0]} {rentableQty} {t('adminMaterial.categories.rentableParams', { rentable: rentableQty }).split('{{rentable}}')[1]}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-white">{items.length}</span>
                          <p className="text-[10px] text-white/30">{t('adminMaterial.stats.items')}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {categories.length <= 1 && !isLoading && (
                  <div className="text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-50">category</span>
                    <p className="text-xs">{t('adminMaterial.categories.empty')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />

          <div className="relative w-full max-w-lg bg-[#0f0f0f]/95 backdrop-blur-xl rounded-xl border border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? t('adminMaterial.modal.editTitle') : t('adminMaterial.modal.newTitle')}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="equipment-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.name')}</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm"
                      placeholder="z.B. Nike Mercurial"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.category')}</label>
                    <input
                      required
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm"
                      placeholder="z.B. Kramponlar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.quantity')}</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.condition')}</label>
                    <div className="relative">
                      <select
                        value={formData.condition}
                        onChange={e => setFormData({ ...formData, condition: e.target.value as Equipment['condition'] })}
                        className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm appearance-none pr-10"
                      >
                        <option value="NEU">{t('adminMaterial.conditions.new')}</option>
                        <option value="GUT">{t('adminMaterial.conditions.good')}</option>
                        <option value="BESCHAEDIGT">{t('adminMaterial.conditions.damaged')}</option>
                        <option value="AUSGEMUSTERT">{t('adminMaterial.conditions.retired')}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-slate-500 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.rentable}
                        onChange={e => setFormData({ ...formData, rentable: e.target.checked })}
                      />
                      <div className="w-10 h-6 bg-black rounded-full border border-white/20 peer-checked:bg-primary/20 peer-checked:border-primary transition-all" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{t('adminMaterial.modal.rentable')}</span>
                      <span className="text-xs text-slate-400">{t('adminMaterial.modal.rentableDesc')}</span>
                    </div>
                  </label>

                  {formData.rentable && (
                    <div className="pt-2 border-t border-white/5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.pricePerHour')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.rentalPricePerHour}
                        onChange={e => setFormData({ ...formData, rentalPricePerHour: Number(e.target.value) })}
                        className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Verfügbare Größen <span className="text-slate-500 normal-case font-normal">{t('adminMaterial.modal.sizesHint')}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.availableSizes}
                    onChange={e => setFormData({ ...formData, availableSizes: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm"
                    placeholder="z.B. EU 38, EU 39, EU 40, EU 41, EU 42"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('adminMaterial.modal.notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-3 text-sm resize-none h-20"
                    placeholder={t('adminMaterial.modal.notesPH')}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0a0a0a] flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                form="equipment-form"
                disabled={isSaving}
                className="px-6 py-2 bg-primary hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(255,68,0,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title={t('adminMaterial.actions.deleteTitle')}
        message={`Möchten Sie '${itemToDelete?.name}' wirklich aus dem Verleih nehmen?`}
        confirmLabel={t('adminMaterial.actions.deactivateBtn')}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

/* ---------- Helper Components ---------- */

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'blue' | 'red';
  subtitle: string;
}) {
  const colors = {
    primary: {
      glow: 'bg-primary/10 group-hover:bg-primary/20',
      border: 'hover:border-primary/50',
      icon: 'group-hover:text-primary group-hover:border-primary/30',
      dot: 'bg-primary shadow-[0_0_8px_rgba(255,68,0,0.6)]',
      text: 'text-primary',
    },
    blue: {
      glow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
      border: 'hover:border-blue-500/50',
      icon: 'group-hover:text-blue-400 group-hover:border-blue-500/30',
      dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      text: 'text-blue-400',
    },
    red: {
      glow: 'bg-red-500/10 group-hover:bg-red-500/20',
      border: 'hover:border-red-500/50',
      icon: 'group-hover:text-red-400 group-hover:border-red-500/30',
      dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
      text: 'text-red-400',
    },
  };

  const c = colors[color];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-surface-dark/50 backdrop-blur-md p-6 group ${c.border} transition-all duration-500 shadow-lg`}>
      <div className={`absolute right-0 top-0 h-32 w-32 translate-x-10 rounded-full ${c.glow} blur-3xl transition-all`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-4xl font-bold text-white">{value.toLocaleString('de-DE')}</h3>
        </div>
        <div className={`rounded-lg bg-white/5 border border-white/10 p-3 text-white/80 ${c.icon} transition-colors`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className={`flex h-2 w-2 rounded-full ${c.dot}`} />
        <span className={`text-xs font-semibold ${c.text}`}>{subtitle}</span>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('krampon') || lower.includes('schuh') || lower.includes('boot')) return 'do_not_step';
  if (lower.includes('yelek') || lower.includes('leibchen') || lower.includes('trikot')) return 'checkroom';
  if (lower.includes('ball') || lower.includes('bälle') || lower.includes('top')) return 'sports_soccer';
  if (lower.includes('tor') || lower.includes('netz') || lower.includes('goal')) return 'sports';
  return 'inventory_2';
}
