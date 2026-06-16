const fs = require('fs');
const path = require('path');

const ePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(ePath, 'utf8');

etxt = etxt.replace(/'\{t\('adminSettings\.security\.verifying'\)\}'/, "t('adminSettings.security.verifying')");

fs.writeFileSync(ePath, etxt);
