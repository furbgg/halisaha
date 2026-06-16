const fs = require('fs');
const path = require('path');

// Fix AdminReservierungen
const resPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(resPath, 'utf8');
rtxt = rtxt.replace(/statusConfig\[getDisplayStatus\(r\)\]/g, "getStatusConfig(t())[getDisplayStatus(r)]");
rtxt = rtxt.replace(/paymentStatusLabels\[/g, "getPaymentStatusLabels(t())[");
rtxt = rtxt.replace(/const t\(\) \= useTranslation\(\)\.t;/g, ""); // if any
rtxt = rtxt.replace(/export function AdminReservierungen\(\) \{/, "export function AdminReservierungen() {\n  const tWrapper = () => { const { t } = require('react-i18next').useTranslation(); return t; };\n");
// Actually, it's easier to just pass 't' to the exportCSV function and others.
// The exportCSV function is defined outside or inside?
// Let's just do a simple replace first. I'll read the file to see how exportCSV is defined.
fs.writeFileSync(resPath, rtxt);

// Fix AdminEinstellungen (DAYS outside component)
const einPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(einPath, 'utf8');
etxt = etxt.replace(/const DAYS = \[t/, "const getDays = (t: any) => [t");
etxt = etxt.replace(/\)\, t\(/g, "), t("); // just ensuring it works
etxt = etxt.replace(/DAYS\.map/g, "getDays(t).map");
etxt = etxt.replace(/DAYS\[/g, "getDays(t)[");
fs.writeFileSync(einPath, etxt);

console.log('Fixed phase 1');
