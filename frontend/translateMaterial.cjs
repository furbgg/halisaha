const fs = require('fs');
const path = require('path');

const tsxPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let txt = fs.readFileSync(tsxPath, 'utf8');

const dePath = path.join(process.cwd(), 'src', 'i18n', 'de.json');
const trPath = path.join(process.cwd(), 'src', 'i18n', 'tr.json');

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

de.adminMaterial = {
  title: 'Material & Inventar',
  allCategories: 'Alle',
  exportBtn: 'Exportieren',
  newBtn: 'Neues Material',
  loadError: 'Fehler beim Laden der Materialliste.',
  stats: {
    total: 'Gesamtbestand',
    rentable: 'Verleihbar',
    defect: 'Defekt / Wartung',
    actionNeeded: 'Handlungsbedarf',
    allGood: 'Alles in Ordnung',
    itemsActive: 'Artikel aktiv',
    items: 'Artikel'
  },
  categories: {
    title: 'Kategorien',
    empty: 'Keine Kategorien vorhanden',
    rentableParams: 'Stück • {{rentable}} verleihbar'
  },
  table: {
    article: 'Artikel',
    sizeType: 'Größe / Typ',
    available: 'Verfügbar',
    status: 'Status',
    rentalFee: 'Leihgebühr',
    actions: 'Aktionen',
    empty: 'Kein Material in dieser Kategorie gefunden.',
    pieces: 'Stück',
    oneSize: 'Einheitsgröße',
    showing: 'Zeige {{count}} von {{total}} Artikeln'
  },
  conditions: {
    new: 'Neu',
    good: 'Gut',
    damaged: 'Beschädigt',
    retired: 'Ausgemustert'
  },
  actions: {
    edit: 'Bearbeiten',
    delete: 'Löschen',
    deleteTitle: 'Material löschen',
    deleteConfirm: "Möchten Sie '{{name}}' wirklich aus dem Verleih nehmen?",
    deactivateBtn: 'Deaktivieren'
  },
  modal: {
    editTitle: 'Material bearbeiten',
    newTitle: 'Neuer Material',
    name: 'Name *',
    category: 'Kategorie *',
    quantity: 'Menge *',
    condition: 'Zustand *',
    rentable: 'Für Verleih verfügbar',
    rentableDesc: 'Das Material kann von Kunden gebucht werden.',
    pricePerHour: 'Preis pro Stunde (€)',
    sizes: 'Verfügbare Größen',
    sizesHint: '(Kommagetrennt)',
    notes: 'Notizen',
    notesPH: 'Optionale Notizen...',
    cancel: 'Abbrechen',
    save: 'Speichern'
  }
};

tr.adminMaterial = {
  title: 'Malzeme & Envanter',
  allCategories: 'Tümü',
  exportBtn: 'Dışa Aktar',
  newBtn: 'Yeni Malzeme',
  loadError: 'Malzeme listesi yüklenirken hata oluştu.',
  stats: {
    total: 'Toplam Stok',
    rentable: 'Kiralanabilir',
    defect: 'Arızalı / Bakımda',
    actionNeeded: 'İşlem Gerekiyor',
    allGood: 'Her şey yolunda',
    itemsActive: 'ürün aktif',
    items: 'Ürün'
  },
  categories: {
    title: 'Kategoriler',
    empty: 'Kategori bulunmuyor',
    rentableParams: 'Adet • {{rentable}} kiralanabilir'
  },
  table: {
    article: 'Ürün',
    sizeType: 'Beden / Tür',
    available: 'Mevcut',
    status: 'Durum',
    rentalFee: 'Kiralama Ücreti',
    actions: 'İşlemler',
    empty: 'Bu kategoride malzeme bulunamadı.',
    pieces: 'Adet',
    oneSize: 'Standart Beden',
    showing: '{{total}} üründen {{count}} tanesi gösteriliyor'
  },
  conditions: {
    new: 'Yeni',
    good: 'İyi',
    damaged: 'Hasarlı',
    retired: 'Hizmet Dışı'
  },
  actions: {
    edit: 'Düzenle',
    delete: 'Sil',
    deleteTitle: 'Malzemeyi Sil',
    deleteConfirm: "'{{name}}' ürününü kiralamadan kaldırmak istediğinize emin misiniz?",
    deactivateBtn: 'Devre Dışı Bırak'
  },
  modal: {
    editTitle: 'Malzemeyi Düzenle',
    newTitle: 'Yeni Malzeme',
    name: 'İsim *',
    category: 'Kategori *',
    quantity: 'Miktar *',
    condition: 'Durum *',
    rentable: 'Kiralamaya Uygun',
    rentableDesc: 'Malzeme müşteriler tarafından rezerve edilebilir.',
    pricePerHour: 'Saatlik Fiyat (€)',
    sizes: 'Mevcut Bedenler',
    sizesHint: '(Virgülle ayrılmış)',
    notes: 'Notlar',
    notesPH: 'İsteğe bağlı notlar...',
    cancel: 'İptal',
    save: 'Kaydet'
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

txt = txt.replace(/import \{ pageTitle \} from '\.\.\/\.\.\/config\/brand';/, "import { pageTitle } from '../../config/brand';\nimport { useTranslation } from 'react-i18next';");
txt = txt.replace(/export function AdminMaterial\(\)\s*\{/, "export function AdminMaterial() {\n  const { t } = useTranslation();");

// Replace 'Alle'
txt = txt.replace(/const CATEGORY_ALL = 'Alle';/, "const CATEGORY_ALL = 'Alle'; // We will replace its usages below");
txt = txt.replace(/setActiveCategory\(CATEGORY_ALL\)/g, "setActiveCategory(t('adminMaterial.allCategories'))");
txt = txt.replace(/activeCategory === CATEGORY_ALL/g, "activeCategory === t('adminMaterial.allCategories')");
txt = txt.replace(/const CATEGORY_ALL = 'Alle';(.*\/\/.*)/, "const CATEGORY_ALL = t('adminMaterial.allCategories');");
// Wait, hook `t` is inside the component, `CATEGORY_ALL` is outside.
// I will just use `t('adminMaterial.allCategories')` wherever `CATEGORY_ALL` is used.
txt = txt.replace(/const CATEGORY_ALL = 'Alle';/, "");
txt = txt.replace(/CATEGORY_ALL/g, "t('adminMaterial.allCategories')");

// HTML/String Replacements
txt = txt.replace(/>Material &amp; Inventar</, ">{t('adminMaterial.title')}<");
txt = txt.replace(/pageTitle\('Material & Inventar'\)/, "pageTitle(t('adminMaterial.title'))");
txt = txt.replace(/>Exportieren</, ">{t('adminMaterial.exportBtn')}<");
txt = txt.replace(/>Neues Material</, ">{t('adminMaterial.newBtn')}<");
txt = txt.replace(/Fehler beim Laden der Materialliste\./, "{t('adminMaterial.loadError')}");
txt = txt.replace(/"Gesamtbestand"/, "{t('adminMaterial.stats.total')}");
txt = txt.replace(/"Verleihbar"/, "{t('adminMaterial.stats.rentable')}");
txt = txt.replace(/"Defekt \/ Wartung"/, "{t('adminMaterial.stats.defect')}");
txt = txt.replace(/'Artikel'/, "t('adminMaterial.stats.items')");
txt = txt.replace(/'Artikel aktiv'/, "t('adminMaterial.stats.itemsActive')");
txt = txt.replace(/'Handlungsbedarf'/, "t('adminMaterial.stats.actionNeeded')");
txt = txt.replace(/'Alles in Ordnung'/, "t('adminMaterial.stats.allGood')");
txt = txt.replace(/>Kategorien</, ">{t('adminMaterial.categories.title')}<");
txt = txt.replace(/>Artikel</g, ">{t('adminMaterial.stats.items')}<");
txt = txt.replace(/Stück • \{rentableQty\} verleihbar/, "{t('adminMaterial.categories.rentableParams', { rentable: rentableQty }).split('{{rentable}}')[0]} {rentableQty} {t('adminMaterial.categories.rentableParams', { rentable: rentableQty }).split('{{rentable}}')[1]}"); // Simplistic approach, will fix manually later or better:
txt = txt.replace(/Stück • \{rentableQty\} verleihbar/g, `{t('adminMaterial.categories.rentableParams', { rentable: rentableQty }).replace('{{rentable}}', rentableQty.toString())}`);

txt = txt.replace(/>Keine Kategorien vorhanden</, ">{t('adminMaterial.categories.empty')}<");

txt = txt.replace(/>Artikel</, ">{t('adminMaterial.table.article')}<");
txt = txt.replace(/>Größe \/ Typ</, ">{t('adminMaterial.table.sizeType')}<");
txt = txt.replace(/>Verfügbar</, ">{t('adminMaterial.table.available')}<");
txt = txt.replace(/>Status</, ">{t('adminMaterial.table.status')}<");
txt = txt.replace(/>Leihgebühr</, ">{t('adminMaterial.table.rentalFee')}<");
txt = txt.replace(/>Aktionen</, ">{t('adminMaterial.table.actions')}<");

txt = txt.replace(/>Kein Material in dieser Kategorie gefunden\.</, ">{t('adminMaterial.table.empty')}<");

txt = txt.replace(/>Stück</g, ">{t('adminMaterial.table.pieces')}<");
txt = txt.replace(/>Einheitsgröße</, ">{t('adminMaterial.table.oneSize')}<");

txt = txt.replace(/Zeige \{filteredList\.length\} von \{equipmentList\.length\} Artikeln/, "{t('adminMaterial.table.showing', { count: filteredList.length, total: equipmentList.length })}");

txt = txt.replace(/title="Bearbeiten"/, "title={t('adminMaterial.actions.edit')}");
txt = txt.replace(/title="Löschen"/, "title={t('adminMaterial.actions.delete')}");

txt = txt.replace(/'Material bearbeiten' : 'Neues Material'/, "t('adminMaterial.modal.editTitle') : t('adminMaterial.modal.newTitle')");
txt = txt.replace(/>Name \*</, ">{t('adminMaterial.modal.name')}<");
txt = txt.replace(/>Kategorie \*</, ">{t('adminMaterial.modal.category')}<");
txt = txt.replace(/>Menge \*</, ">{t('adminMaterial.modal.quantity')}<");
txt = txt.replace(/>Zustand \*</, ">{t('adminMaterial.modal.condition')}<");

txt = txt.replace(/>Neu</, ">{t('adminMaterial.conditions.new')}<");
txt = txt.replace(/>Gut</, ">{t('adminMaterial.conditions.good')}<");
txt = txt.replace(/>Beschädigt</, ">{t('adminMaterial.conditions.damaged')}<");
txt = txt.replace(/>Ausgemustert</, ">{t('adminMaterial.conditions.retired')}<");

txt = txt.replace(/>Für Verleih verfügbar</, ">{t('adminMaterial.modal.rentable')}<");
txt = txt.replace(/>Das Material kann von Kunden gebucht werden\.</, ">{t('adminMaterial.modal.rentableDesc')}<");
txt = txt.replace(/>Preis pro Stunde \(€\)</, ">{t('adminMaterial.modal.pricePerHour')}<");
txt = txt.replace(/>Verfügbare Größen</, ">{t('adminMaterial.modal.sizes')}<");
txt = txt.replace(/>\(Kommagetrennt\)</, ">{t('adminMaterial.modal.sizesHint')}<");
txt = txt.replace(/>Notizen</, ">{t('adminMaterial.modal.notes')}<");

txt = txt.replace(/placeholder="Optionale Notizen\.\.\."/, "placeholder={t('adminMaterial.modal.notesPH')}");

txt = txt.replace(/>Abbrechen</, ">{t('adminMaterial.modal.cancel')}<");
txt = txt.replace(/>Speichern</, ">{t('adminMaterial.modal.save')}<");

txt = txt.replace(/title="Material löschen"/, "title={t('adminMaterial.actions.deleteTitle')}");
txt = txt.replace(/message=\{\`Möchten Sie '\\\$\{itemToDelete\?\.name\}' wirklich aus dem Verleih nehmen\?\`\}/, "message={t('adminMaterial.actions.deleteConfirm', { name: itemToDelete?.name })}");
txt = txt.replace(/confirmLabel="Deaktivieren"/, "confirmLabel={t('adminMaterial.actions.deactivateBtn')}");

txt = txt.replace(/label: 'Neu'/g, "label: t('adminMaterial.conditions.new')");
txt = txt.replace(/label: 'Verfügbar'/g, "label: t('adminMaterial.conditions.good')");
txt = txt.replace(/label: 'Beschädigt'/g, "label: t('adminMaterial.conditions.damaged')");
txt = txt.replace(/label: 'Ausgemustert'/g, "label: t('adminMaterial.conditions.retired')");
txt = txt.replace(/label: condition/g, "label: condition // no change");

fs.writeFileSync(tsxPath, txt);
