const fs = require('fs');
const path = require('path');

// Fix AdminZahlungen
const zahlungenPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminZahlungen.tsx');
let ztxt = fs.readFileSync(zahlungenPath, 'utf8');

ztxt = ztxt.replace(/ icon\?\: string; bg\: string; text\: string; border\: string \}>(?:\s*)\=(?:\s*)\{/, "const statusInfo: Record<PaymentStatus, { label: string; icon?: string; bg: string; text: string; border: string }> = {");
ztxt = ztxt.replace(/ icon\: string \}>(?:\s*)\=(?:\s*)\{/, "const methodInfo: Record<PaymentMethod | 'ON_SITE', { label: string; icon: string }> = {");
ztxt = ztxt.replace(/ label\: string \}\[\](?:\s*)\=(?:\s*)\[/, "const statusFilters: { key: StatusFilter; label: string }[] = [");
fs.writeFileSync(zahlungenPath, ztxt);

// Fix AdminKontaktFormular
const kontaktPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminKontaktFormular.tsx');
let ktxt = fs.readFileSync(kontaktPath, 'utf8');
ktxt = ktxt.replace(/\{t\('adminContact\.drawer\.tel'\)\}\{\{selectedMessage\.phone\}\}/, "{t('adminContact.drawer.tel')}{selectedMessage.phone}");
fs.writeFileSync(kontaktPath, ktxt);

// Fix AdminPersonal
const personalPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminPersonal.tsx');
let ptxt = fs.readFileSync(personalPath, 'utf8');
ptxt = ptxt.replace(/\{editingStaff \? editingStaff \? t\('adminStaff\.modal\.editTitle'\) \: t\('adminStaff\.modal\.newTitle'\)/, "{editingStaff ? t('adminStaff.modal.editTitle') : t('adminStaff.modal.newTitle')");
fs.writeFileSync(personalPath, ptxt);

// Fix AdminEinstellungen
const einstellungenPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(einstellungenPath, 'utf8');
etxt = etxt.replace(/\{secPwSaving \? '\{t\('adminSettings\.saveBar\.saving'\)\}' \: 'Passwort aktualisieren'\}/, "{secPwSaving ? t('adminSettings.saveBar.saving') : t('adminSettings.security.password.submit', 'Passwort aktualisieren')}");
fs.writeFileSync(einstellungenPath, etxt);

console.log('Fixed files');
