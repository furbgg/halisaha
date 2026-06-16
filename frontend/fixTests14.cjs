const fs = require('fs');
const path = require('path');

const nPath = path.join(process.cwd(), 'src', '__tests__', 'components', 'Navbar.test.tsx');
let nTxt = fs.readFileSync(nPath, 'utf8');

nTxt = nTxt.replace(/vi\.mock\('react-i18next', \(\) \=\> \(\{[\s\S]*?useTranslation\: \(\) \=\> \(\{ t\: \(key\: string\) \=\> key \}\),[\s\S]*?\}\)\);/, "");
nTxt = nTxt.replace(/'Startseite'/g, "'navbar.home'");
nTxt = nTxt.replace(/'Jetzt Buchen'/g, "'navbar.bookNow'");

fs.writeFileSync(nPath, nTxt);

console.log('Fixed Navbar mocks');
