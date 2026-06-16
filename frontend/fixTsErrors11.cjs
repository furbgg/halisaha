const fs = require('fs');
const path = require('path');

const resPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(resPath, 'utf8');

rtxt = rtxt.replace(/const getFilterTabs = \(t: any\) => \[/, "const getFilterTabs = (t: any): { key: FilterKey; label: string }[] => [");

fs.writeFileSync(resPath, rtxt);

console.log('Fixed FilterKey casting');
