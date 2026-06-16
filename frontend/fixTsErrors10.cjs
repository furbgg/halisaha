const fs = require('fs');
const path = require('path');

const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');

mtxt = mtxt.replace(/\}(?:\s*)\}(?:\s*)$/, '}');
fs.writeFileSync(mPath, mtxt);

console.log('Fixed Material Brace pt 2');
