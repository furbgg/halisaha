const fs = require('fs');
const path = require('path');

const sPath = path.join(process.cwd(), 'src', 'test', 'setup.ts');
let stxt = fs.readFileSync(sPath, 'utf8');

stxt = stxt.replace(/Trans: \(\{ children \}\) \=\> children,/, `Trans: ({ i18nKey, children }) => {
    const val = getI18nStr(i18nKey, de);
    if (val) return val;
    return children;
  },`);

fs.writeFileSync(sPath, stxt);

console.log('Fixed Trans mock');
