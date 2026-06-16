const fs = require('fs');
const path = require('path');

// Fix AdminEinstellungen
const ePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(ePath, 'utf8');
etxt = etxt.replace(/'\{t\('adminSettings\.saveBar\.notSaved'\)\}'/, "t('adminSettings.saveBar.notSaved')");
fs.writeFileSync(ePath, etxt);

// Fix AdminPersonal
const pPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminPersonal.tsx');
let ptxt = fs.readFileSync(pPath, 'utf8');
ptxt = ptxt.replace(/editingStaff \? editingStaff \? t\('adminStaff\.modal\.updateBtn'\) \: t\('adminStaff\.modal\.createBtn'\)/, "editingStaff ? t('adminStaff.modal.updateBtn') : t('adminStaff.modal.createBtn')");
fs.writeFileSync(pPath, ptxt);

// Fix AdminMaterial (missing closing brace?)
const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');
if (!mtxt.endsWith('}\n') && !mtxt.endsWith('}')) {
   mtxt += '\n}\n';
   fs.writeFileSync(mPath, mtxt);
}

// Let me ensure AdminMaterial syntax is completely right, so I will check if there's an unclosed bracket
// Wait, the error is at the end of file "751:1 - error TS1005: '}' expected."
// So I just append '}' at the end of the file.
