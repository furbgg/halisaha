const fs = require('fs');
const path = require('path');

// AdminEinstellungen: DAYS
const ePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(ePath, 'utf8');
etxt = etxt.replace(/DAYS\.forEach\(/g, "getDays(t).forEach(");
fs.writeFileSync(ePath, etxt);

// AdminReservierungen: require and durationLabels
const rPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(rPath, 'utf8');
// Fix require
rtxt = rtxt.replace(/const tWrapper = \(\) \=> \{ const \{ t \} = require\('react-i18next'\)\.useTranslation\(\); return t; \};\n/, ""); // Remove the injected mock
// But then exportCSV uses `t()`. Wait, earlier I replaced `exportCSV = (data: AdminReservation[]) =>` with `exportCSV = (data: AdminReservation[], t: any) =>` and inside it `t`. Oh no, I replaced `getStatusConfig(t())` with `getStatusConfig(t)`! 
// Let's remove tWrapper from AdminReservierungen.tsx
rtxt = rtxt.replace(/const tWrapper \= \(\) \=\> \{ const \{ t \} \= require\('react-i18next'\)\.useTranslation\(\)\; return t\; \}\;\n/, "");
// Fix durationLabels -> getDurationLabels(t)
rtxt = rtxt.replace(/durationLabels\[/g, "getDurationLabels(t)[");
rtxt = rtxt.replace(/statusConfig\[/g, "getStatusConfig(t)["); // ensure it is correct
fs.writeFileSync(rPath, rtxt);

// AdminMaterial: type error 'dot' on Element
const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');
mtxt = mtxt.replace(/const conditionInfo = getConditionConfig\(t\)\[item\.state\] \|\| getConditionConfig\(t\)\['USED'\];/g, "const conditionInfo: { label: string; color: string; dot: boolean } = getConditionConfig(t)[item.state] || getConditionConfig(t)['USED'];");
fs.writeFileSync(mPath, mtxt);

console.log('Fixed phase 3');
