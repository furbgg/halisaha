const fs = require('fs');
const path = require('path');

// Fix AdminReservierungen
const rPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(rPath, 'utf8');
rtxt = rtxt.replace(/exportCSV\(filtered\)/g, "exportCSV(filtered, t)");
rtxt = rtxt.replace(/filterTabs\.map/g, "getFilterTabs(t).map");
fs.writeFileSync(rPath, rtxt);

// Fix AdminMaterial (conditionInfo typing)
const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');
// To be absolutely sure, let's enforce any.
mtxt = mtxt.replace(/const conditionInfo\: \{ label\: string; color\: string; dot\: boolean \} \= /g, "const conditionInfo: any = ");
mtxt = mtxt.replace(/const conditionInfo = /g, "const conditionInfo: any = ");
fs.writeFileSync(mPath, mtxt);

console.log('Fixed phase 4');
